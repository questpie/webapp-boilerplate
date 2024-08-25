// Adapters
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import type { MailClient, MailOptions } from '@questpie/api/mail/adapter/_base.mail'
import { env } from '@questpie/api/env'

export class ResendMailClient implements MailClient {
  private resend: Resend

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey)
  }

  async sendMail(options: MailOptions): Promise<void> {
    await this.resend.emails.send({
      from: options.from ?? env.MAIL_FROM,
      subject: options.subject,
      to: options.to,
      attachments: options.attachments,
      text: options.text,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      headers: options.headers,
      replyTo: options.replyTo,
      react: options.react,
      tags: options.tags,
    })
  }
}
