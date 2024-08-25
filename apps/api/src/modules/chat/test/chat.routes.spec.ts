import { treaty } from '@elysiajs/eden'
import { chatRoutes } from '@questpie/api/modules/chat/chat.routes'
import { describe, expect, it } from 'bun:test'
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

  return new Elysia().use(mockProtectedMiddleware).use(chatRoutes)
}

const app1 = createAppForUser('user1')
const app2 = createAppForUser('user2')

const api1 = treaty(app1)
const api2 = treaty(app2)

describe('Chat Routes', () => {
  it('should send messages', async () => {
    const response = await api1.chat({ roomId: 'room1' }).message.post({
      type: 'message',
      content: 'Hello, world!',
    })

    expect(response.status).toBe(200)
  })

  it('should send typing notifications', async () => {
    const response = await api1.chat({ roomId: 'room1' }).message.post({
      type: 'typing',
      content: '',
    })

    expect(response.status).toBe(200)
  })

  it('should reject invalid message types', async () => {
    const response = await api1.chat({ roomId: 'room1' }).message.post({
      type: 'invalid' as any,
      content: 'This should fail',
    })

    expect(response.status).toBe(400)
  })
})
