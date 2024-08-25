import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { pusher } from '@questpie/api/pusher/pusher.client'
import Elysia, { t } from 'elysia'

export const pusherAuthRoutes = new Elysia().use(protectedMiddleware).post(
  '/pusher',
  async ({ auth, body }) => {
    const { socket_id, channel_name } = body
    const userId = auth.user.id

    const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: userId,
      user_info: { name: auth.user.name },
    })

    return authResponse
  },
  {
    body: t.Object({
      socket_id: t.String(),
      channel_name: t.String(),
    }),
  }
)
