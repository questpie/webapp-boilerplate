import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { Elysia } from 'elysia'

const app = new Elysia().use(chatRoutes)
const api = treaty(app)

describe('Chat Routes', () => {
  let ws1: WebSocket
  let ws2: WebSocket

  beforeAll(() => {
    // Mock authentication middleware
    app.derive(() => ({
      auth: {
        user: { id: 'user1' },
      },
    }))
  })

  afterAll(() => {
    ws1?.close()
    ws2?.close()
  })

  it('should connect to websocket', async () => {
    ws1 = await api..subscribe()
    expect(ws1.readyState).toBe(WebSocket.OPEN)
  })

  it('should send and receive messages', async () => {
    ws1 = await api['/chat/room1'].subscribe()
    ws2 = await api['/chat/room1'].subscribe({
      auth: { user: { id: 'user2' } },
    })

    const messagePromise = new Promise<any>((resolve) => {
      ws2.onmessage = (event) => {
        resolve(JSON.parse(event.data))
      }
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
    ws1 = await api['/chat/room1'].subscribe()
    ws2 = await api['/chat/room1'].subscribe({
      auth: { user: { id: 'user2' } },
    })

    const typingPromise = new Promise<any>((resolve) => {
      ws2.onmessage = (event) => {
        resolve(JSON.parse(event.data))
      }
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
      ws1 = api['/chat/room1'].subscribe({
        onMessage: (message) => {
          if (message.type === 'activity') {
            resolve(message)
          }
        },
      })
    })

    ws2 = await api['/chat/room1'].subscribe({
      auth: { user: { id: 'user2' } },
    })

    const receivedActivity = await activityPromise
    expect(receivedActivity).toEqual({
      type: 'activity',
      userId: 'user2',
      content: 'joined',
      timestamp: expect.any(Number),
    })
  })
})
