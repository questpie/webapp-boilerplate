import { injectDatabase } from '@questpie/api/db/db.client'
import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { injectAuthService } from '@questpie/api/modules/auth/serivces/auth.service'
import {
  injectOrganizationService,
  type OrganizationWithRole,
} from '@questpie/api/modules/organizations/services/organizations.service'
import type { UserRole } from '@questpie/shared/constants/db.constants'
import { ORGANIZATION_HEADER } from '@questpie/shared/modules/organizations/organizations.constants'
import Elysia, { t } from 'elysia'
import { HttpError } from 'elysia-http-error'

// Constants

/**
 * Middleware for handling organization-related authentication.
 */
export const organizationMiddleware = new Elysia({
  name: 'organization.middleware',
})
  .use(protectedMiddleware)
  .use(injectDatabase)
  .use(injectAuthService)
  .use(injectOrganizationService)
  .resolve(async ({ headers, authService, organizationsService, db, auth, error }) => {
    const organizationId = headers[ORGANIZATION_HEADER]

    if (!organizationId) {
      throw HttpError.BadRequest('Organization header is required')
    }

    const isSuperAdmin = await authService.getSuperAdmin(db, auth.user.id)

    let organization = null
    if (organizationId) {
      organization = await organizationsService.getForUser(db, {
        organizationId,
        userId: auth.user.id,
      })
    }

    if (organization && isSuperAdmin) {
      organization = { ...organization, role: 'superAdmin' }
    }

    return { organization } as { organization: NonNullable<typeof organization> }
  })
  .macro(({ onBeforeHandle }) => ({
    /**
     * Checks if the user has one of the specified roles or is the owner.
     * @param {string[]} roles - Array of allowed roles.
     */
    hasRole(roles: UserRole[] | true = true) {
      onBeforeHandle(async ({ organization, error }) => {
        if (!organization) {
          throw HttpError.BadRequest('Insufficient permissions')
        }

        if (
          organization.role !== 'superAdmin' &&
          Array.isArray(roles) &&
          !roles.includes(organization.role as OrganizationWithRole['role'])
        ) {
          throw HttpError.BadRequest('Insufficient permissions')
        }
      })
    },
  }))
  .guard({
    response: {
      401: t.Object({
        message: t.String(),
      }),
      400: t.Object({
        message: t.String(),
      }),
      403: t.Object({
        message: t.String(),
      }),
    },
  })
  .as('plugin')
