import { env } from '@questpie/api/env'
import { RedisManager } from '@questpie/api/redis/redis-manager'

/**
 * Specify your redis clients here
 */
export const redisManager = new RedisManager({
  default: env.REDIS_URL,
  // add another client here
  // and get it with redisManager.get('queue')
  // queue: env.REDIS_URL
})
