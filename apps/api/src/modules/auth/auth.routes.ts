import { magicLinkRoutes } from '@questpie/api/modules/auth/magic-link/magic-link.routes'
import { googleRoutes } from '@questpie/api/modules/auth/oauth/google.routes'
import { createPusherAuthEndpoint } from '@questpie/api/modules/auth/pusher/pusher-auth.route'
import Elysia from 'elysia'

export const authRoutes = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  .use(magicLinkRoutes)
  .use(googleRoutes)
  .use(
    /**
     * This is just a showcase, you can AND SHOULD use your own auth logic for channel-specific access
     */
    createPusherAuthEndpoint('/pusher', async ({ user }) => {
      return {
        name: user.name,
      }
    })
  )

// add other oauth providers routes here
// create them after google routes example
