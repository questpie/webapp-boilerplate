/**
 * Register all workers here
 */

import { mailClient } from '@questpie/api/mail/mail.client'
import { appLogger } from '@questpie/shared/utils/logger'

export async function bootWorker() {
  // THIS is how you can use dependency injection to overwrite stuff work other processes
  // ioc.use(iocRegister('db', () => null))
  mailClient.registerWorker()

  appLogger.info('Workers instances running')
}
