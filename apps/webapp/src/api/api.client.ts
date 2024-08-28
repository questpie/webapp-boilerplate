import { treaty } from '@elysiajs/eden'
import type { ApiType } from '@questpie/api/index'
import { env } from '@questpie/webapp/env'

const apiClient = treaty<ApiType>(env.PUBLIC_API_URL)

export { apiClient }
