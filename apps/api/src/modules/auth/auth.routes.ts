import { magicLinkRoutes } from '@questpie/api/modules/auth/magic-link/magic-link.routes'
import { googleRoutes } from '@questpie/api/modules/auth/oauth/google.routes'
import { pusherAuthRoute } from '@questpie/api/modules/auth/pusher/pusher.route'
import Elysia from 'elysia'

export const authRoutes = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  .use(magicLinkRoutes)
  .use(googleRoutes)
  .use(pusherAuthRoute)

// add other oauth providers routes here
// create them after google routes example
