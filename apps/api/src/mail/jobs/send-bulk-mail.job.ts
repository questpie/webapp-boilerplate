import { jobFactory } from '@questpie/api/jobs/job-factory'
import { getMailClient } from '@questpie/api/mail/mail.client'
import { waitFor } from '@questpie/shared/utils/async'
import { Type } from '@sinclair/typebox'

/**
 * This is not ideal, as you should use workflow for this, or just use bulk invoke
 */
export const sendMailJob = jobFactory.createJob({
  name: 'send-mail',
  schema: Type.Object({
    to: Type.String(),
    subject: Type.String(),
    html: Type.Optional(Type.String()),
    text: Type.String(),
  }),
  async handler(job) {
    const { to, subject, html, text } = job.data

    const mailClient = await getMailClient()

    await mailClient.send({
      to,
      subject,
      html,
      text,
    })
    await waitFor(50)
  },
})
