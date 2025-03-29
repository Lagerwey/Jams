import './globals.css'
import { Inter, Roboto, Lora } from 'next/font/google'
import { NavMenu } from './components/navMenu'


const inter = Inter({ subsets: ['latin'] })
const lora = Lora({ subsets: ['latin'] });

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
        {/* <body className={inter.className}> */}
        <body className={roboto.className}>
          <NavMenu />
          {children}
        </body>
      </html>
  )
}
