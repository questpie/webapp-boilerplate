// ALL constants and enums must reside here because drizzle kit has trouble resolving ts aliases.
// So to make it easier and still be able to share constants with FE, we will export them from here.

/**
 * Users and organizations
 */

export const USER_ROLE = ['owner', 'member'] as const
export type UserRole = (typeof USER_ROLE)[number]
