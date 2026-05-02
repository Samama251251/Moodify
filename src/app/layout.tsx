import type { Metadata, Viewport } from 'next'
import { Poppins, Nunito } from 'next/font/google'
import { MixpanelProvider } from '@/components/providers/mixpanel-provider'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Moodify — Your Digital Sanctuary',
  description: 'Track your mood. Understand yourself.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground font-sans">
        <MixpanelProvider>{children}</MixpanelProvider>
      </body>
    </html>
  )
}
