import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider } from '@crebost/ui'
import '../styles/globals.css'
import '@crebost/ui/src/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="crebost-landing-theme">
      <Head>
        <title>Crebost - Content Creator & Promoter Platform</title>
        <meta name="description" content="Platform untuk menghubungkan content creator dengan promoter" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
