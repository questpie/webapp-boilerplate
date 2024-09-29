import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { pinioLogger } from '@questpie/api/common/logger'
import { Elysia } from 'elysia'
import { ip } from 'elysia-ip'
import { rootRoutes } from './root.routes'

/**
 * Here you can either listen inside server.entry.ts or import to next.js and serve the api from next.js
 */
export const api = new Elysia()
  .use(ip())
  // .use(applyRateLimit())
  .use(
    pinioLogger.into({
      customProps(ctx) {
        return {
          response: {
            status: ctx.set.status,
            rateLimit: {
              limit: ctx.set.headers['x-ratelimit-limit'],
              remaining: ctx.set.headers['x-ratelimit-remaining'],
              reset: ctx.set.headers['x-ratelimit-reset'],
            },
          },
          ip: ctx.ip ?? 'unknown',
        }
      },
    })
  )
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Questpie API',
          description: 'The Questpie API',
          version: '1.0.0',
        },

        tags: [
          {
            name: 'Auth',
            description: 'Endpoints for authentication',
          },
          {
            name: 'User',
            description: 'Endpoints for user',
          },
        ],
      },
    })
  )
  .use(rootRoutes)

export type ApiType = typeof api
