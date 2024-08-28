import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { pusher } from '@questpie/api/pusher/pusher.client'
import Elysia, { t } from 'elysia'
import type { User } from 'lucia'

export function createPusherAuthEndpoint<
  TRoute extends string,
  TUserInfo extends Record<string, any>,
>(
  route: TRoute,
  /**
   * If user is not allowed to join the channel, return a string error message or null
   * If user is allowed to join the channel, return the user info that should be bind to the socket
   */
  validateUser: (authOpts: {
    user: User
    socketId: string
    channelName: string
  }) => Promise<TUserInfo | null | string>
) {
  return new Elysia().use(protectedMiddleware).post(
    route,
    async ({ auth, body, error }) => {
      const userInfo = await validateUser({
        channelName: body.channelName,
        user: auth.user,
        socketId: body.socketId,
      })

      if (userInfo === null || typeof userInfo === 'string') {
        return error(403, userInfo ?? 'Forbidden')
      }

      const authResponse = pusher.authorizeChannel(body.socketId, body.channelName, {
        user_id: auth.user.id,
        user_info: userInfo,
      })

      return authResponse
    },
    {
      body: t.Object({
        socketId: t.String(),
        channelName: t.String(),
      }),
    }
  )
}
