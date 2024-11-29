import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/app/providers'
import { FrameProvider } from '@/components/FrameApp/FrameProvider'

export const metadata: Metadata = {
  title: 'Farcaster Frames v2 Demo',
  description: 'A Farcaster Frames v2 demo app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <FrameProvider>{children}</FrameProvider>
        </Providers>
      </body>
    </html>
  )
}
