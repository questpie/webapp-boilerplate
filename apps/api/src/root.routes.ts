import { authRoutes } from '@questpie/api/modules/auth/auth.routes'
import { chatRoutes } from '@questpie/api/modules/chat/chat.routes'
import { Elysia } from 'elysia'

/**
 * Aggregate all routes here
 */
export const rootRoutes = new Elysia().use(authRoutes).use(chatRoutes)
