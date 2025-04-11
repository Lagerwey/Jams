import './globals.css'
import { Roboto } from 'next/font/google'
import { NavMenu } from './components/navMenu'
import Script from 'next/script'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
});

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
        {/*<head>
          <Script src="http://localhost:8097" strategy="beforeInteractive"/>
        </head>*/}
    
        {/* <body className={inter.className}> */}
        <body className={roboto.className}>
          <NavMenu />
          {children}
        </body>
      </html>
  )
}
