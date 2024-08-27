import { jobFactory } from '@questpie/api/jobs/job-factory'
import { getMailClient } from '@questpie/api/mail/mail.client'
import { waitFor } from '@questpie/shared/utils/async'
import { Type } from '@sinclair/typebox'

/**
 * This is not ideal, as you should use workflow for this, or just use bulk invoke
 */
export const sendBulkMailJob = jobFactory.createJob({
  name: 'send-bulk-mail',
  schema: Type.Object({
    to: Type.Array(Type.String()),
    subject: Type.String(),
    html: Type.Optional(Type.String()),
    text: Type.String(),
  }),
  async run(job) {
    const { to: tos, subject, html, text } = job.data

    const mailClient = await getMailClient()

    for (const to of tos) {
      await mailClient.send({
        to,
        subject,
        html,
        text,
      })
      await waitFor(50)
    }
  },
})
