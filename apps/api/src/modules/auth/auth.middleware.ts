import { lucia } from '@questpie/api/modules/auth/lucia'
import Elysia from 'elysia'

/**
 * Extracts the session from the cookie and validates it
 */
export const authMiddleware = new Elysia()
  .resolve(async ({ cookie }) => {
    const sessionId = cookie[lucia.sessionCookieName]?.value
    return {
      auth: sessionId ? await lucia.validateSession(sessionId) : null,
    }
  })
  .as('plugin')
  .macro(({ onBeforeHandle }) => ({
    isSignedIn(value: boolean) {
      if (!value) return
      onBeforeHandle(({ auth, error }) => {
        if (!auth || !auth.session || !auth.user) {
          return error(401, 'Unauthorized')
        }
      })
    },
  }))

/**
 * Ensures the user is signed in
 */
export const protectedMiddleware = new Elysia({
  name: 'protected.middleware',
})
  .use(authMiddleware)
  .guard({ isSignedIn: true })
  .resolve(({ auth }) => {
    return {
      auth: {
        user: auth!.user!,
        session: auth!.session!,
      },
    }
  })
  .as('plugin')
