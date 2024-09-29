import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db.schema'
import { envApi } from '@questpie/api/env'
import { iocRegister } from '@questpie/api/ioc'

// for query purposes

const createClient = () => {
  const queryClient = postgres(envApi.DATABASE_URL)
  const db = drizzle(queryClient, { schema })
  return db
}

export type TransactionLike = ReturnType<typeof createClient>

export const injectDatabase = iocRegister('db', createClient)
