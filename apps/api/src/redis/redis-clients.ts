import { env } from '@questpie/api/env'
import { Redis, type RedisOptions } from 'ioredis'

/**
 * Extend this config with your own redis clients if needed
 */
const redisConfig = {
  default: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },
} as const satisfies Record<string, RedisOptions>

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

const redisManager = new RedisManager()

export { redisManager }
