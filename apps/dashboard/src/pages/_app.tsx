import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ClientThemeProvider } from '@crebost/ui' // Changed to ClientThemeProvider
import Head from 'next/head'
import '../styles/globals.css'
// Removed direct import of @crebost/ui/src/styles/globals.css
// ClientThemeProvider should handle the necessary base styles from the UI package.

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ClientThemeProvider defaultTheme="system" storageKey="crebost-dashboard-theme">
      <SessionProvider session={session}>
        <Head>
          <title>Dashboard - Crebost</title>
          <meta name="description" content="Dashboard for Crebost platform" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </ClientThemeProvider>
  )
}
