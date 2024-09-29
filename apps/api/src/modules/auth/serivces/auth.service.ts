import type { TransactionLike } from '@questpie/api/db/db.client'
import { superAdminsTable } from '@questpie/api/db/db.schema'
import { iocRegister } from '@questpie/api/ioc'
import { eq } from 'drizzle-orm'

class AuthService {
  async getSuperAdmin(db: TransactionLike, userId: string) {
    return db
      .select()
      .from(superAdminsTable)
      .where(eq(superAdminsTable.userId, userId))
      .limit(1)
      .then((res) => res[0])
  }

  // Add other methods here as needed
  // For example:
  // async createSuperAdmin(db: TransactionLike, opts: {...}) {...}
  // async updateSuperAdmin(db: TransactionLike, opts: {...}) {...}
  // async deleteSuperAdmin(db: TransactionLike, userId: string) {...}
}

export const injectAuthService = iocRegister('authService', () => new AuthService())
