import { sendBulkMailJob } from '@questpie/api/mail/jobs/send-bulk-mail.job'
/**
 * Register all workers here
 */

sendBulkMailJob.registerWorker()

console.log('Workers instances running')
