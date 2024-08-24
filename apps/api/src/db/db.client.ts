import { env } from '@questpie/api/config/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from './db.schema'

// for query purposes
const queryClient = postgres(env.DATABASE_URL)
export const db = drizzle(queryClient, { schema })
