import type { ReactElement, ReactNode } from 'react'

// Mail adapter interface
export interface MailClient {
  send(options: MailOptions): Promise<void>
}

// Complex mail options interface
export type MailOptions = {
  from?: string
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  headers?: { [key: string]: string }
  replyTo?: string
  tags?: { name: string; value: string }[]
} & (
  | { react: ReactElement; text?: never; html?: never }
  | { text: string; html?: string; react?: never }
)
