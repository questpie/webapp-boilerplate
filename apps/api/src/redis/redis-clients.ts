import { env } from '@questpie/api/env'
import Elysia from 'elysia'
import { Redis, type RedisOptions } from 'ioredis'

/**
 * Extend this config with your own redis clients if needed
 */
const redisConfig = {
  default: env.REDIS_URL,
} as const satisfies Record<string, RedisOptions | string>

type RedisClientName = keyof typeof redisConfig

class RedisManager {
  private clients: Map<RedisClientName, Redis> = new Map()
  /**
   * Client name to use if no name is provided   */
  private defaultClient: RedisClientName = 'default'

  getClient(name?: RedisClientName): Redis {
    const clientName = name ?? this.defaultClient

    if (!this.clients.has(clientName)) {
      const clientConfig = redisConfig[clientName]
      if (!clientConfig) {
        throw new Error(`Redis configuration for '${clientName}' not found`)
      }
      const newClient = new Redis(clientConfig)
      this.clients.set(clientName, newClient)
    }
    return this.clients.get(clientName)!
  }
}

export function redisPlugin() {
  return new Elysia({
    name: 'redis-manager',
  }).decorate('redisManager', new RedisManager())
}
