import { treaty } from '@elysiajs/eden'
import type { EdenWS } from '@elysiajs/eden/treaty'
import { chatRoutes } from '@questpie/api/modules/chat/chat.routes'
import { roomManagerPlugin } from '@questpie/api/ws/room.manager'
import { afterAll, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

// Create two separate apps for two different users
const createAppForUser = (userId: string) => {
  const mockProtectedMiddleware = new Elysia({
    name: 'protected.middleware',
  }).derive(() => ({
    auth: {
      user: { id: userId },
      session: { id: `session_${userId}` },
    },
  }))

  const mockRoomManagerPlugin = new Elysia({
    name: 'room-manager',
  }).use(roomManagerPlugin('local'))

  return new Elysia().use(mockProtectedMiddleware).use(mockRoomManagerPlugin).use(chatRoutes)
}

const app1 = createAppForUser('user1')
const app2 = createAppForUser('user2')

const api1 = treaty(app1)
const api2 = treaty(app2)

describe('Chat Routes', () => {
  let ws1: EdenWS<any>
  let ws2: EdenWS<any>

  afterAll(() => {
    ws1?.close()
    ws2?.close()
  })

  it('should connect to websocket', async () => {
    ws1 = api1.chat({ roomId: 'room1' }).index.subscribe()
    expect(ws1.ws.readyState).toBe(WebSocket.OPEN)
  })

  it('should send and receive messages', async () => {
    ws1 = api1.chat({ roomId: 'room1' }).index.subscribe()
    ws2 = api2.chat({ roomId: 'room1' }).index.subscribe()

    const messagePromise = new Promise<any>((resolve) => {
      ws2.subscribe((message) => {
        if (message.type === 'message') {
          resolve(message)
        }
      })
    })

    ws1.send(
      JSON.stringify({
        type: 'message',
        content: 'Hello, world!',
      })
    )

    const receivedMessage = await messagePromise
    expect(receivedMessage).toEqual({
      type: 'message',
      userId: 'user1',
      content: 'Hello, world!',
      timestamp: expect.any(Number),
    })
  })

  it('should send typing notifications', async () => {
    ws1 = api1.chat({ roomId: 'room1' }).index.subscribe()
    ws2 = api2.chat({ roomId: 'room1' }).index.subscribe()

    const typingPromise = new Promise<any>((resolve) => {
      ws2.subscribe((message) => {
        if (message.type === 'typing') {
          resolve(message)
        }
      })
    })

    ws1.send(
      JSON.stringify({
        type: 'typing',
        content: '',
      })
    )

    const receivedTyping = await typingPromise
    expect(receivedTyping).toEqual({
      type: 'typing',
      userId: 'user1',
      content: '',
      timestamp: expect.any(Number),
    })
  })

  it('should send activity notifications', async () => {
    const activityPromise = new Promise<any>((resolve) => {
      ws1 = api1.chat({ roomId: 'room1' }).index.subscribe()

      ws1.subscribe((message) => {
        if (message.type === 'activity') {
          resolve(message)
        }
      })
    })

    ws2 = api2.chat({ roomId: 'room1' }).index.subscribe()

    const receivedActivity = await activityPromise
    expect(receivedActivity).toEqual({
      type: 'activity',
      userId: 'user2',
      content: 'joined',
      timestamp: expect.any(Number),
    })
  })
})
