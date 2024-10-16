import type { TransactionLike } from '@questpie/api/db/db.client'
import {
  organizationsTable,
  userOrganizationsTable,
  type SelectSuperAdmin,
} from '@questpie/api/db/db.schema'
import { iocRegister } from '@questpie/api/ioc'
import { and, desc, eq, getTableColumns } from 'drizzle-orm'

export type OrganizationWithRole = Required<
  Awaited<ReturnType<typeof OrganizationsService.prototype.getForUser>>
>

class OrganizationsService {
  async getForUser(
    db: TransactionLike,
    opts: {
      organizationId: string
      userId: string
    }
  ) {
    return db
      .select({
        ...getTableColumns(organizationsTable),
        role: userOrganizationsTable.role,
      })
      .from(userOrganizationsTable)
      .where(
        and(
          eq(userOrganizationsTable.organizationId, opts.organizationId),
          eq(userOrganizationsTable.userId, opts.userId)
        )
      )
      .innerJoin(
        organizationsTable,
        eq(userOrganizationsTable.organizationId, organizationsTable.id)
      )
      .limit(1)
      .then((res) => res[0])
  }

  async getById(db: TransactionLike, organizationId: string) {
    return db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
      .limit(1)
      .then((res) => res[0])
  }

  async getDefaultForUser(db: TransactionLike, userId: string, isSuperAdmin?: boolean) {
    // First, check if the user has any organizations
    const userOrganization = await db
      .select({
        ...getTableColumns(organizationsTable),
        role: userOrganizationsTable.role,
      })
      .from(userOrganizationsTable)
      .where(eq(userOrganizationsTable.userId, userId))
      .innerJoin(
        organizationsTable,
        eq(userOrganizationsTable.organizationId, organizationsTable.id)
      )
      .limit(1)
      .orderBy(desc(organizationsTable.createdAt))
      .then((res) => res[0])

    if (userOrganization) {
      return userOrganization
    }

    if (!isSuperAdmin) {
      return null
    }

    // If the user doesn't have any organizations, get the first organization in the system
    // This will be used for superadmins who might not be explicitly linked to any organization
    const firstOrganization = await db
      .select()
      .from(organizationsTable)
      .limit(1)
      .orderBy(desc(organizationsTable.createdAt))
      .then((res) => res[0])

    if (firstOrganization) {
      return {
        ...firstOrganization,
        role: 'superAdmin' as const, // Assuming superadmins get this role when no specific org is found
      }
    }

    // If no organizations exist in the system at all
    return null
  }

  // Add other methods here as needed, following the structure in resources.service.ts
  // For example:
  // async getAll(db: TransactionLike, opts: {...}) {...}
  // async create(db: TransactionLike, opts: {...}) {...}
  // async getAll(db: TransactionLike, opts: {...}) {...}
  // async create(db: TransactionLike, opts: {...}) {...}
  // async deleteById(db: TransactionLike, opts: {...}) {...}
}

export const injectOrganizationService = iocRegister(
  'organizationsService',
  () => new OrganizationsService()
)
