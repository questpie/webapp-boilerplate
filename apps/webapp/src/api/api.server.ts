import { treaty } from '@elysiajs/eden'
import type { ApiType } from '@questpie/api/index'
import { AUTH_COOKIE_NAME } from '@questpie/webapp/app/(auth)/auth.constants'
import { buildAuthHeaders } from '@questpie/webapp/app/(auth)/auth.utils'
import { env } from '@questpie/webapp/env'
import { cookies } from 'next/headers'

const apiServer = treaty<ApiType>(env.PUBLIC_API_URL, {
  headers: {
    ...buildAuthHeaders(cookies().get(AUTH_COOKIE_NAME)?.value),
  },
})

export { apiServer }
