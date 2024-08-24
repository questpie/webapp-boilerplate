import { magicLinkRoutes } from '@questpie/api/modules/auth/magic-link/magic-link.routes'
import { googleRoutes } from '@questpie/api/modules/auth/oauth/google.routes'
import Elysia from 'elysia'

export const authRoutes = new Elysia({ prefix: '/auth' }).use(magicLinkRoutes).use(googleRoutes)
