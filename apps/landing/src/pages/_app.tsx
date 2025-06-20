import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ClientThemeProvider } from '@crebost/ui/src/components/client-theme-provider'
import '@crebost/ui/src/styles/globals.css'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClientThemeProvider defaultTheme="system" storageKey="crebost-landing-theme">
      <Head>
        <title>Crebost - Content Creator & Promoter Platform</title>
        <meta name="description" content="Platform untuk menghubungkan content creator dengan promoter" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </ClientThemeProvider>
  )
}
