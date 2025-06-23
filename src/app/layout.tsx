import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CartCheck - Smart Shopping Lists',
  description: 'A feature-rich shopping list app with group collaboration',
  icons: {
    icon: [
      { url: '/CartChecklogo.png', sizes: '32x32', type: 'image/png' },
      { url: '/CartChecklogo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/CartChecklogo.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/CartChecklogo.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
} 