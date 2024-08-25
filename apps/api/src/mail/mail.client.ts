import type { MailClient } from '@questpie/api/mail/adapter/_base.mail'
import { ResendMailClient } from '@questpie/api/mail/adapter/resend.mail'
import { SMTPMailClient } from '@questpie/api/mail/adapter/smtp.mail'
import { env } from 'bun'
import { createTestAccount, getTestMessageUrl } from 'nodemailer'

let mailClient: MailClient

export async function getMailClient(): Promise<MailClient> {
  if (!mailClient) {
    if (process.env.NODE_ENV === 'production') {
      // if you don't have a resend api key, you can use use smptMail
      mailClient = new ResendMailClient(env.RESEND_API_KEY!)
    } else {
      const testAccount = await createTestAccount()
      mailClient = new SMTPMailClient(
        {
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        },
        async (info) => {
          // biome-ignore lint/suspicious/noConsoleLog: <explanation>
          console.log('Message sent: %s', info.messageId)
          // biome-ignore lint/suspicious/noConsoleLog: <explanation>
          console.log('Preview URL: %s', getTestMessageUrl(info))
        }
      )
    }
  }

  return mailClient
}
