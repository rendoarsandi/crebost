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
    <ThemeProvider defaultTheme="system" storageKey="crebost-auth-theme">
      <SessionProvider session={session}>
        <Head>
          <title>Crebost Auth</title>
          <meta name="description" content="Authentication for Crebost platform" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  )
}
