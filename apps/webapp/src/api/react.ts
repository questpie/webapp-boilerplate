import { treaty } from '@elysiajs/eden'
import type { ApiType } from '@questpie/api/index'
import { env } from '@questpie/webapp/env'

const apiReact = treaty<ApiType>(env.NEXT_PUBLIC_API_URL)

export { apiReact }
