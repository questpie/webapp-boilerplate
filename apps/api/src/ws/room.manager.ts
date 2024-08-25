import cuid2 from '@paralleldrive/cuid2'
import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { redisPlugin } from '@questpie/api/redis/redis-clients'
import Elysia from 'elysia'
import type Redis from 'ioredis'

interface Adapter {
  publish(channel: string, message: string): Promise<void>
  subscribe(channel: string, callback: (message: string) => void): Promise<void>
  unsubscribe(channel: string): Promise<void>
}

class RedisAdapter implements Adapter {
  private publisher: Redis
  private subscriber: Redis

  constructor(client: Redis) {
    this.publisher = client
    this.subscriber = client.duplicate()
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.publisher.publish(channel, message)
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel)
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message)
      }
    })
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel)
  }
}

class SocketClient<TData extends Record<string, any> = Record<string, any>> {
  id: string
  data: TData
  private roomManager: RoomManager

  constructor(id: string | null, data: TData, roomManager: RoomManager) {
    this.id = id || cuid2.createId()
    this.data = data
    this.roomManager = roomManager
  }

  join(roomId: string): Room {
    return this.roomManager.addClientToRoom(this, roomId)
  }

  in(...roomIds: string[]): Room {
    const newRoom = this.roomManager.getClientsInRooms(roomIds)
    newRoom.clients.delete(this)
    return newRoom
  }

  leave(roomId: string): void {
    this.roomManager.removeClientFromRoom(this, roomId)
  }
}

class Room {
  clients: Set<SocketClient> = new Set()

  constructor(
    readonly id: string,
    private readonly adapter: Adapter,
    private readonly manager: RoomManager
  ) {}

  except(...roomIds: string[]): Room {
    const exceptClients = new Set<SocketClient>()
    for (const client of this.clients) {
      if (!roomIds.some((roomId) => !!this.manager.getRoom(roomId)?.clients.has(client))) {
        exceptClients.add(client)
      }
    }
    const exceptRoom = new Room(this.id, this.adapter, this.manager)
    exceptRoom.clients = exceptClients
    return exceptRoom
  }

  async send<TData>(data: TData): Promise<void> {
    const message = JSON.stringify({ data })
    await this.adapter.publish(this.id, message)
  }

  subscribe<TData>(callback: (data: TData) => any): void {
    this.adapter.subscribe(this.id, (message: string) => {
      const { data } = JSON.parse(message)
      callback(data)
    })
  }
}

class RoomManager {
  private adapter: Adapter
  private rooms: Map<string, Room> = new Map()
  private nodeId: string

  constructor(adapter: Adapter) {
    this.adapter = adapter
    this.nodeId = cuid2.createId()
    this.subscribeToGlobalEvents()
  }

  private subscribeToGlobalEvents(): void {
    this.adapter.subscribe('global', (message: string) => {
      const { event, data, sourceNodeId } = JSON.parse(message)
      if (sourceNodeId !== this.nodeId) {
        if (event === 'clientJoined') {
          this.handleClientJoined(data)
        } else if (event === 'clientLeft') {
          this.handleClientLeft(data)
        }
      }
    })
  }

  private handleClientJoined(data: { client: { id: string; data: any }; roomId: string }): void {
    const { client, roomId } = data
    const room = this.getOrCreateRoom(roomId)
    const dummyClient = new SocketClient(client.id, client.data, this)
    room.clients.add(dummyClient)
  }

  private handleClientLeft(data: { clientId: string; roomId: string }): void {
    const { clientId, roomId } = data
    const room = this.rooms.get(roomId)
    if (room) {
      const clientToRemove = Array.from(room.clients).find((client) => client.id === clientId)
      if (clientToRemove) {
        room.clients.delete(clientToRemove)
      }
      if (room.clients.size === 0) {
        this.rooms.delete(roomId)
      }
    }
  }

  addClientToRoom(client: SocketClient, roomId: string): Room {
    let room = this.rooms.get(roomId)
    if (!room) {
      room = new Room(roomId, this.adapter, this)
      this.rooms.set(roomId, room)
    }
    room.clients.add(client)
    this.adapter.publish(
      'global',
      JSON.stringify({
        event: 'clientJoined',
        data: { client: { id: client.id, data: client.data }, roomId },
        sourceNodeId: this.nodeId,
      })
    )
    return room
  }

  removeClientFromRoom(client: SocketClient, roomId: string): void {
    const room = this.rooms.get(roomId)
    if (room) {
      room.clients.delete(client)
      if (room.clients.size === 0) {
        this.rooms.delete(roomId)
      }
      this.adapter.publish(
        'global',
        JSON.stringify({
          event: 'clientLeft',
          data: { clientId: client.id, roomId },
          sourceNodeId: this.nodeId,
        })
      )
    }
  }

  createClient<TData extends Record<string, any>>(data: TData): SocketClient<TData> {
    return new SocketClient(null, data, this)
  }
  getRoom(roomId: string) {
    return this.rooms.get(roomId)
  }

  getOrCreateRoom(roomId: string): Room {
    if (!this.getRoom(roomId)) {
      const room = new Room(roomId, this.adapter, this)
      this.rooms.set(roomId, room)
      return room
    }

    return this.getRoom(roomId)!
  }

  getClientsInRooms(roomIds: string[]): Room {
    const combinedRoom = new Room('combined', this.adapter, this)
    for (const roomId of roomIds) {
      const room = this.rooms.get(roomId)
      if (room) {
        for (const client of room.clients) {
          combinedRoom.clients.add(client)
        }
      }
    }
    return combinedRoom
  }
}

function roomManagerPlugin() {
  return new Elysia({
    name: 'room-manager',
  })
    .use(redisPlugin())
    .decorate((ctx) => ({
      ...ctx,
      roomManager: new RoomManager(new RedisAdapter(ctx.redisManager.getClient())),
    }))
}

function socketPlugin(name?: string) {
  return new Elysia({
    name: name,
  })
    .use(protectedMiddleware)
    .use(roomManagerPlugin())
    .derive({ as: 'scoped' }, async (ctx) => ({
      socket: ctx.roomManager.createClient({
        userId: ctx.auth!.user.id,
      }),
    }))
}

export { Room, RoomManager, SocketClient, socketPlugin, type Adapter }
