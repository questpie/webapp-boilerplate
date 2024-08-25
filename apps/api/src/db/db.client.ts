import { env } from '@questpie/api/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db.schema'

// for query purposes
const queryClient = postgres(env.DATABASE_URL)
export const db = drizzle(queryClient, { schema })
