// Adapters
import { MailClient, type DefaultMailOptions, type MailOptions } from '@questpie/mail/base-mail'
import { Resend } from 'resend'

export class ResendMailClient extends MailClient {
  private resend: Resend

  constructor({ apiKey, ...options }: DefaultMailOptions & { apiKey: string }) {
    super(options)
    this.resend = new Resend(apiKey)
  }

  async send(options: MailOptions): Promise<void> {
    await this.resend.emails.send({
      ...this.options,
      ...options,
    })
  }
}
