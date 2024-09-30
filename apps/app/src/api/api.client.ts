import type { ApiType } from '@questpie/api/index'
import { buildAuthHeaders } from '@questpie/app/app/(auth)/auth.utils'
import { getSessionId } from '@questpie/app/app/(auth)/use-auth'
import { getSelectedOrganizationId } from '@questpie/app/app/(main)/organizations/_components/selected-organization-provider'
import { buildOrganizationHeaders } from '@questpie/app/app/(main)/organizations/_utils/organizations.utils'
import { env } from '@questpie/app/env'
import { treaty } from '@elysiajs/eden'

const apiClient = treaty<ApiType>(env.PUBLIC_API_URL, {
  headers() {
    return {
      ...buildAuthHeaders(getSessionId()),
      ...buildOrganizationHeaders(getSelectedOrganizationId()),
    }
  },
  fetch: {
    credentials: 'include',
  },
})

export { apiClient }

export type RouteOutput<T extends (...args: any[]) => Promise<any>> = NonNullable<
  Awaited<ReturnType<T>>['data']
>
