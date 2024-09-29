import { appLogger } from '@questpie/shared/utils/logger'
import { sql } from 'drizzle-orm'
import type { PgDatabase, PgTransaction } from 'drizzle-orm/pg-core'

export type DbLike = PgDatabase<any, any, any> | PgTransaction<any, any>

type Seeder<TDbLike extends DbLike, TName extends string> = {
  name: TName
  seed: (db: TDbLike) => Promise<void>
  options?: {
    once?: boolean
  }
}

export function createSeeder<const T extends Seeder<any, any>>(seeder: T) {
  return seeder
}
// export function registerSeeders<const T extends Seeder<any, any>>(seeders: [T, ...T[]]) {
export function createSeedRunner<const T extends Seeder<any, any>>(seeders: T[]) {
  async function ensureSeedersTable(db: DbLike) {
    await db.execute(sql`
            CREATE TABLE IF NOT EXISTS seeders (
                name TEXT PRIMARY KEY,
                seeded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `)
  }

  async function checkSeeder(db: DbLike, name: T['name']) {
    const result = await db.execute(sql`
            SELECT * FROM seeders WHERE name = ${name};
        `)
    return result.rows.length > 0
  }

  async function markSeederAsSeeded(db: DbLike, name: T['name']) {
    await db.execute(sql`
            INSERT INTO seeders (name) VALUES (${name});
        `)
  }

  async function run(db: DbLike, name: T['name'][]) {
    // get all seeders
    const sedersToRun: Seeder<DbLike, any>[] = []
    for (const seed of seeders) {
      if (name.includes(seed.name)) {
        sedersToRun.push(seed)
      }
    }

    // run seeders
    await ensureSeedersTable(db)

    for (const seed of sedersToRun) {
      await db.transaction(async (tx) => {
        appLogger.info(`Running seeder: ${seed.name}`)
        if (seed.options?.once) {
          const hasRun = await checkSeeder(tx as any, seed.name)
          if (hasRun) {
            appLogger.info(`Seeder ${seed.name} has already been run, skipping`)
            return
          }
        }

        await seed.seed(db)

        if (seed.options?.once) {
          await markSeederAsSeeded(tx as any, seed.name)
        }
      })
    }
  }

  return {
    run,
  }
}
