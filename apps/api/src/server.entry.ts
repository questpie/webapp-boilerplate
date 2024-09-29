import { runBootstrapSeeders } from '@questpie/api/db/seed'
import { envApi } from '@questpie/api/env'
import { api } from '@questpie/api/index'
import { appLogger } from '@questpie/shared/utils/logger'
import { Elysia } from 'elysia'

export async function bootApi() {
  /**
   * TODO: if you want to listen to the api from next.js,
   * you can import the server from index.ts and use it in next.js and delete this file after
   */
  const app = new Elysia().use(api).listen(envApi.PORT)

  appLogger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
}
