import { injectDatabase } from '@questpie/api/db/db.client'
import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { injectAuthService } from '@questpie/api/modules/auth/serivces/auth.service'
import { injectOrganizationService } from '@questpie/api/modules/organizations/services/organizations.service'
import type { UserRole } from '@questpie/shared/constants/db.constants'
import { ORGANIZATION_HEADER } from '@questpie/shared/modules/organizations/organizations.constants'
import Elysia from 'elysia'

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
  .resolve(async ({ headers, authService, organizationsService, db, auth }) => {
    const organizationId = headers[ORGANIZATION_HEADER]

    if (!organizationId) {
      return { organization: null }
    }

    // check if user isn't a superAdmin
    const superAdmin = await authService.getSuperAdmin(db, auth.user.id)

    if (superAdmin) {
      const organization = await organizationsService.getById(db, organizationId)

      if (!organization) {
        return {
          organization: null,
        }
      }

      return {
        organization: {
          ...organization,
          role: 'superAdmin',
        },
      }
    }

    return {
      organization: await organizationsService.getForUser(db, {
        organizationId,
        userId: auth.user.id,
      }),
    }
  })
  .guard({
    // headers: t.Optional(
    //   t.Object({
    //     authorization: t.Optional(BearerSchema),
    //     [ORGANIZATION_HEADER]: t.Optional(t.String({ minLength: 1 })),
    //   })
    // ),
  })
  .macro(({ onBeforeHandle }) => ({
    /**
     * Checks if the user has one of the specified roles or is the owner.
     * @param {string[]} roles - Array of allowed roles.
     */
    hasRole(roles: UserRole[] | boolean = true) {
      onBeforeHandle(async ({ organization, error, headers }) => {
        if (!headers[ORGANIZATION_HEADER] && roles) {
          return error(403, { message: 'Organization header is required' })
        }

        // if there is no organizaton, but roles is not false
        if (!organization && roles !== false) {
          return error(403, { message: 'Insufficient permissions for this organization' })
        }

        // if there is an organization but we don't have persmission to access it
        if (
          organization &&
          organization.role !== 'superAdmin' &&
          Array.isArray(roles) &&
          !roles.includes(organization.role)
        ) {
          return error(403, { message: 'Insufficient permissions for this organization' })
        }
      })
    },
  }))
  .as('plugin')
