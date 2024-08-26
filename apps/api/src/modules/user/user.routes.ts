import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { Elysia } from 'elysia'

export const userRoutes = new Elysia({ prefix: '/user', tags: ['User'] })
  .use(protectedMiddleware)
  .get('/me', async ({ auth }) => {
    return { me: auth.user }
  })
