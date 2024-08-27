import { MailClient, type DefaultMailOptions, type MailOptions } from '@questpie/mail/base-mail'
import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

export class SMTPMailClient extends MailClient {
  private transporter: nodemailer.Transporter
  private afterSendCallback?: (info: nodemailer.SentMessageInfo) => Promise<void>

  constructor({
    transport,
    afterSendCallback,
    ...defaultOpts
  }: DefaultMailOptions & {
    transport: SMTPTransport | SMTPTransport.Options
    afterSendCallback?: (info: nodemailer.SentMessageInfo) => Promise<void>
  }) {
    super(defaultOpts)
    this.transporter = nodemailer.createTransport(transport)
    this.afterSendCallback = afterSendCallback
  }

  async send(options: MailOptions): Promise<void> {
    let html: string | undefined = options.html
    let text: string | undefined = options.text

    if (options.react) {
      html = await render(options.react, {
        pretty: true,
      })
      text = await render(options.react, {
        plainText: true,
      })
    }

    const info = await this.transporter.sendMail({
      from: options.from,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text,
      html,
      attachments: options.attachments,
      headers: options.headers,
    })
    if (this.afterSendCallback) {
      await this.afterSendCallback(info)
    }
  }
}
