import { Elysia, t } from 'elysia'
import { lucia, google } from '../lucia'
import { generateState, generateCodeVerifier } from 'arctic'
import { db } from '@questpie/api/db/db.client'
import { userTable, oauthAccountsTable } from '@questpie/api/db/db.schema'
import { eq, and } from 'drizzle-orm'

export const googleRoutes = new Elysia()
  .get(
    '/login/google',
    async ({ redirect, cookie, query }) => {
      const state = generateState()
      const codeVerifier = generateCodeVerifier()

      cookie.state.set({
        value: state,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
      cookie.code_verifier.set({
        value: codeVerifier,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })

      cookie.redirectTo.set({
        value: query.redirectTo,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })

      const url = await google.createAuthorizationURL(state, codeVerifier, {
        scopes: ['profile', 'email'],
      })

      return redirect(url.toString(), 302)
    },
    {
      query: t.Object({
        redirectTo: t.String(),
      }),
    }
  )
  .get(
    '/auth/google/callback',
    async ({ query, cookie, error, redirect }) => {
      const storedState = cookie.state.value
      const storedCodeVerifier = cookie.code_verifier.value

      if (!storedState || !storedCodeVerifier || !query.state || storedState !== query.state) {
        return error(400, 'Invalid state')
      }

      try {
        const tokens = await google.validateAuthorizationCode(query.code, storedCodeVerifier)
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        })
        const googleUser = (await response.json()) as {
          email: string
          name: string
          id: string
        }

        // Start a transaction
        await db.transaction(async (trx) => {
          // Try to find an existing OAuth account
          const existingOAuthAccount = await trx
            .select()
            .from(oauthAccountsTable)
            .where(
              and(
                eq(oauthAccountsTable.provider, 'google'),
                eq(oauthAccountsTable.providerAccountId, googleUser.id)
              )
            )
            .limit(1)

          let userId: string

          if (existingOAuthAccount.length > 0) {
            // OAuth account exists, use the associated user
            userId = existingOAuthAccount[0].userId
          } else {
            // OAuth account doesn't exist, create or find user by email
            const [user] = await trx
              .insert(userTable)
              .values({
                email: googleUser.email,
                name: googleUser.name,
              })
              .onConflictDoUpdate({
                target: userTable.email,
                set: { name: googleUser.name },
              })
              .returning({ id: userTable.id })

            userId = user.id

            // Create new OAuth account
            await trx.insert(oauthAccountsTable).values({
              userId: userId,
              provider: 'google',
              providerAccountId: googleUser.id,
            })
          }

          // Create session
          const session = await lucia.createSession(userId, {})
          const sessionCookie = lucia.createSessionCookie(session.id)

          cookie[sessionCookie.name].set({
            value: sessionCookie.value,
            ...sessionCookie.attributes,
          })
        })

        const redirectTo = cookie.redirectTo.value
        redirect(redirectTo || '/')
      } catch (e) {
        console.error(e)
        return error(500, 'Internal server error')
      }
    },
    {
      query: t.Object({
        code: t.String(),
        state: t.String(),
      }),
    }
  )
