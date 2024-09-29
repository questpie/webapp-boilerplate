import type { TransactionLike } from '@questpie/api/db/db.client'
import { createSeeder } from '@questpie/seed/index'

export const testSeeder = createSeeder({
  name: 'test-seeder',
  seed: async (db: TransactionLike) => {},
})
