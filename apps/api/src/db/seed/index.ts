import { injectDatabase } from '@questpie/api/db/db.client'
import { testSeeder } from '@questpie/api/db/seed/test.seeder'
import { ioc, iocResolve } from '@questpie/api/ioc'
import { createSeedRunner } from '@questpie/seed/index'

export const seedRunner = createSeedRunner([testSeeder])

export function runStartupSeeds() {
  const { db } = iocResolve(ioc.use(injectDatabase))

  seedRunner.run(db, ['test-seeder'])
}
