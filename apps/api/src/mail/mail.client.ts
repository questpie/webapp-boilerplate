import { env } from '@questpie/api/env'
import type { MailClient } from '@questpie/mail/base-mail'
import { ResendMailClient } from '@questpie/mail/resend.mail'
import { SMTPMailClient } from '@questpie/mail/smtp.mail'
import { createTestAccount, getTestMessageUrl } from 'nodemailer'

let mailClient: MailClient

export async function getMailClient(): Promise<MailClient> {
  if (!mailClient) {
    if (process.env.NODE_ENV === 'production') {
      // if you don't have a resend api key, you can use use smptMail
      mailClient = new ResendMailClient({ apiKey: env.RESEND_API_KEY, from: env.MAIL_FROM })
    } else {
      const testAccount = await createTestAccount()
      mailClient = new SMTPMailClient({
        from: env.MAIL_FROM,
        transport: {
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        },
        afterSendCallback: async (info) => {
          // biome-ignore lint/suspicious/noConsoleLog: <explanation>
          console.log('Message sent: %s', info.messageId)
          // biome-ignore lint/suspicious/noConsoleLog: <explanation>
          console.log('Preview URL: %s', getTestMessageUrl(info))
        },
      })
    }
  }

  return mailClient
}
