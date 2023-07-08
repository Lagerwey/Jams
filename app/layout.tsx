import './globals.css'
import { Inter } from 'next/font/google'
import { NavMenu } from './components/navMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'JAMS',
  description: 'Just Another Music Streamer',
}


export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    
  return (
      <html lang="en">
        <body className={inter.className}>
          <NavMenu />
          {children}
        </body>
      </html>
  )
}
