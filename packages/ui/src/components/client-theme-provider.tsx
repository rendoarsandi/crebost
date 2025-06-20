"use client"

import * as React from "react"
import { ThemeProvider } from "./theme-provider"

type ClientThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: "dark" | "light" | "system"
  storageKey?: string
}

export function ClientThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "crebost-ui-theme",
}: ClientThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return children without theme provider during SSR
    return <>{children}</>
  }

  return (
    <ThemeProvider defaultTheme={defaultTheme} storageKey={storageKey}>
      {children}
    </ThemeProvider>
  )
}
