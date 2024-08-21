import AppWalletProvider from './components/AppWalletProvider'
import Menu from './components/Menu'
import Navigate from './components/Navigate'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coingalaxy',
  description: 'Solana payment gateway'
}
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          <Menu />
          <main className="flex min-h-screen flex-col items-center justify-between ">
            {children}
            <Navigate />
          </main>
        </AppWalletProvider>
      </body>
    </html>
  )
}
