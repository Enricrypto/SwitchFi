import { type Metadata } from 'next'
import { Rubik } from 'next/font/google'
import clsx from 'clsx'
import { ReactQueryProvider } from '../providers/ReactQueryProvider'
import { Web3Provider } from '../providers/Web3Provider'
import PoolsProvider from '../providers/PoolsProvider'
import { ToastContainer } from 'react-toastify'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
})

export const metadata: Metadata = {
  title: {
    template: '%s - SwitchFi',
    default: 'SwitchFi - Decentralized Exchange Platform',
  },
  description:
    'SwitchFi is a decentralized exchange platform that allows you to swap tokens, provide liquidity, and earn rewards in a secure and efficient manner.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={clsx('bg-white antialiased', rubik)}>
      <body>
        <ReactQueryProvider>
          <Web3Provider>
            <PoolsProvider />
            <Header />
            <main className="flex-auto">{children}</main>
            <Footer />
            <ToastContainer />
          </Web3Provider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
