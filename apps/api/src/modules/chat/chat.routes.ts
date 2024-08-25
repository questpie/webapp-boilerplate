/**
 * This is a chat example, showing how to use Pusher for private chat rooms
 */

import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { pusher } from '@questpie/api/pusher/pusher.client'
import Elysia, { t } from 'elysia'

export const chatBodySchema = t.Object({
  type: t.Union([t.Literal('message'), t.Literal('typing')]),
  content: t.String(),
})

export const chatRoutes = new Elysia({ prefix: '/chat/:roomId' }).use(protectedMiddleware).post(
  '/message',
  ({ body, params, auth }) => {
    const { roomId } = params
    const { type, content } = body
    const userId = auth.user.id

    const message = {
      type,
      userId,
      content,
      timestamp: Date.now(),
    }

    pusher.trigger(`private-room-${roomId}`, 'chat-event', message)

    return { success: true }
  },
  {
    body: chatBodySchema,
  }
)
