// Adapters
import { MailClient, type DefaultMailOptions, type MailOptions } from '@questpie/mail/base-mail'
import { convert } from 'html-to-text'
import { Resend } from 'resend'

export class ResendMailClient extends MailClient {
  private resend: Resend

  constructor({ apiKey, ...options }: DefaultMailOptions & { apiKey: string }) {
    super(options)
    this.resend = new Resend(apiKey)
  }

  async send(options: MailOptions): Promise<void> {
    // if there is no text, extract it from html
    if (!options.text && options.html) {
      options.text = convert(options.html)
    }

    await this.resend.emails.send({
      ...this.options,
      ...options,
      text: options.text || '', // Resend requires text
    })
  }
}
