import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { helmet } from 'elysia-helmet'
import { rateLimit } from 'elysia-rate-limit'
import { appRoutes } from './app.routes'

const app = new Elysia()
  .use(rateLimit())
  .use(helmet())
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
            name: 'auth',
            description: 'Endpoints for authentication',
          },
        ],
      },
    })
  )
  .use(appRoutes)
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
