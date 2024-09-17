/**
 * Register all workers here
 */

import { mailClient } from '@questpie/api/mail/mail.client'
import { appLogger } from '@questpie/shared/utils/logger'

mailClient.registerWorker()

appLogger.info('Workers instances running')
