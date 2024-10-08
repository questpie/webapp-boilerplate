import { apiServer } from '@questpie/app/api/api.server'
import { RootProviders } from '@questpie/app/app/root-providers'
import '@questpie/ui/css'
import { cn } from '@questpie/ui/lib'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessionResp = await apiServer.auth.session.index.get()

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <RootProviders authData={sessionResp.data}>{children}</RootProviders>
      </body>
    </html>
  )
}
