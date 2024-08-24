import { authRoutes } from '@questpie/api/modules/auth/auth.routes'
import { Elysia } from 'elysia'

/**
 * Aggregate all routes here
 */
export const rootRoutes = new Elysia().use(authRoutes)
