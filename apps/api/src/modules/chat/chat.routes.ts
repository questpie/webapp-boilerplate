/**
 * This is a chat example, showing how to use the room manager to manage chat rooms
 */

import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { socketPlugin } from '@questpie/api/ws/room.manager'
import Elysia, { t, type Static } from 'elysia'

function getChatRoom(roomId: string) {
  return `room:${roomId}`
}

function getUserRoom(userId: string) {
  return `user:${userId}`
}

export const chatResponseSchema = t.Object({
  type: t.Union([t.Literal('message'), t.Literal('typing'), t.Literal('activity')]),
  userId: t.String(),
  content: t.Optional(t.String()),
})

export const chatRoutes = new Elysia({ prefix: '/chat/:roomId' })
  .use(protectedMiddleware)
  .use(socketPlugin())
  .ws('/', {
    body: t.Object({
      type: t.Union([t.Literal('message'), t.Literal('typing'), t.Literal('activity')]),
      content: t.Optional(t.String()),
    }),
    response: chatResponseSchema,

    open(ws) {
      const client = ws.data.socket
      client.join(getChatRoom(ws.data.params.roomId))
      client.join(getUserRoom(ws.data.auth.user.id))

      // subscribe to room events and propagate to client
      client
        .in(getChatRoom(ws.data.params.roomId))
        .subscribe<Static<typeof chatResponseSchema>>((message) => {
          switch (message.type) {
            case 'message':
              ws.send(message)
              break
            case 'typing':
              ws.send(message)
              break
            case 'activity':
              ws.send(message)
              break
          }
        })
    },
    close(ws) {
      const client = ws.data.socket
      client.leave(getChatRoom(ws.data.params.roomId))
      client.leave(getUserRoom(ws.data.auth.user.id))
    },
    message(ws, message) {
      const client = ws.data.socket

      //   propagate message to room
      switch (message.type) {
        case 'message':
          // add to db
          client
            .in(getChatRoom(ws.data.params.roomId))
            .send<Static<typeof chatResponseSchema>>({ ...message, userId: ws.data.auth.user.id })
          break
        case 'typing':
          //propagate typing to room
          client
            .in(getChatRoom(ws.data.params.roomId))
            .except(getUserRoom(ws.data.auth.user.id))
            .send<Static<typeof chatResponseSchema>>({ ...message, userId: ws.data.auth.user.id })
          break
        case 'activity':
          //propagate activity to room
          client
            .in(getChatRoom(ws.data.params.roomId))
            .except(getUserRoom(ws.data.auth.user.id))
            .send<Static<typeof chatResponseSchema>>({ ...message, userId: ws.data.auth.user.id })
          break
      }
    },
  })
