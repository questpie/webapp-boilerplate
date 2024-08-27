import { sendBulkMailJob } from '@questpie/api/mail/jobs/send-bulk-mail.job'
import { protectedMiddleware } from '@questpie/api/modules/auth/auth.middleware'
import { Elysia, t } from 'elysia'

export const userRoutes = new Elysia({ prefix: '/user', tags: ['User'] })
  .use(protectedMiddleware)
  .get('/me', async ({ auth }) => {
    return { me: auth.user }
  })
  .post(
    '/send-test-mail',
    async ({ auth, body }) => {
      sendBulkMailJob.invoke({
        to: body.emails,
        subject: 'Test',
        text: 'Test',
      })

      return { success: true }
    },
    {
      body: t.Object({
        emails: t.Array(t.String()),
      }),
    }
  )
