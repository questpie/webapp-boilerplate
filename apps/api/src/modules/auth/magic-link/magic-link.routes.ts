import { db } from '@questpie/api/db/db.client'
import { userTable, emailVerificationTable } from '@questpie/api/db/db.schema'
import { env } from '@questpie/api/env'
import { getMailClient } from '@questpie/api/mail/mail.client'
import { lucia } from '@questpie/api/modules/auth/lucia'
import { getDeviceInfo } from '@questpie/api/modules/auth/utils/device-info'
import { eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { createDate, isWithinExpirationDate, TimeSpan } from 'oslo'
import { alphabet, generateRandomString } from 'oslo/crypto'

export const magicLinkRoutes = new Elysia({ prefix: '/magic-link' })
  .post(
    '/',
    async ({ body }) => {
      const { email } = body

      // Check if user exists
      let existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1)
        .then((r) => r[0])

      if (!existingUser) {
        // get random 4 char hash
        const name = email.split('@')[0]
          ? `${email.split('@')[0]}`
          : `User ${crypto.getRandomValues(new Uint8Array(2)).join('')}`

        // Create a new user if they don't exist
        existingUser = await db
          .insert(userTable)
          .values({ email, name })
          .returning()
          .then((r) => r[0])
      }

      // Generate token length and alphabet
      const token = generateRandomString(63, alphabet('a-z', 'A-Z', '0-9'))

      // Store token in database
      await db
        .insert(emailVerificationTable)
        .values({
          id: token,
          userId: existingUser.id,
          email,
          expiresAt: createDate(new TimeSpan(2, 'h')),
        })
        .execute()

      let link = `${env.SERVER_URL}/auth/magic-link/verify?token=${token}`
      if (body.redirectTo) {
        link += `&redirectTo=${body.redirectTo}`
      }

      const mailClient = await getMailClient()
      await mailClient.send({
        to: email,
        subject: 'Magic Link',
        text: `Click the link to login: ${link}`,
      })

      return { success: true }
    },
    {
      body: t.Object({
        email: t.String(),
        redirectTo: t.Optional(
          t.String({
            description: 'Where should the user be redirected after login?',
          })
        ),
      }),
    }
  )
  .get(
    '/verify',
    async ({ query, cookie, error, redirect, request }) => {
      const { token } = query

      const storedToken = await db
        .select()
        .from(emailVerificationTable)
        .where(eq(emailVerificationTable.id, token))
        .limit(1)
        .then((r) => r[0])

      if (!storedToken || !isWithinExpirationDate(storedToken.expiresAt)) {
        return error(400, 'Invalid token')
      }

      const user = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, storedToken.userId))
        .limit(1)
        .then((r) => r[0])

      if (!user) {
        return error(400, 'Invalid user')
      }

      // Create session
      const session = await lucia.createSession(user.id, getDeviceInfo(request))
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      })

      // Delete the used token
      await db.delete(emailVerificationTable).where(eq(emailVerificationTable.id, token))
      return query.redirectTo ? redirect(query.redirectTo, 301) : { success: true }
    },
    {
      query: t.Object({
        token: t.String(),
        redirectTo: t.Optional(
          t.String({
            description: 'Where should the user be redirected after login?',
          })
        ),
      }),
    }
  )
