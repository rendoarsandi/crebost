import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@crebost/ui'
import Head from 'next/head'
import '../styles/globals.css'
import '@crebost/ui/src/styles/globals.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="crebost-admin-theme">
      <SessionProvider session={session}>
        <Head>
          <title>Admin Panel - Crebost</title>
          <meta name="description" content="Admin panel for Crebost platform" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  )
}
