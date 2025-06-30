'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useTheme, type ThemeProviderProps } from 'next-themes'
import { useMounted } from '@/hooks/use-mounted'
import { ThemeColors, ThemeColorStateParams, ThemeRadius } from '@/lib/theme/types/theme'
import setGlobalColorTheme from '@/lib/theme/global-color-theme'
import { getSavedThemeColor } from '@/lib/theme/localStorageGetters/get-saved-theme-color'
import { getSavedThemeRadius } from '@/lib/theme/localStorageGetters/get-saved-theme-radius'

const ThemeContext = createContext<ThemeColorStateParams>({} as ThemeColorStateParams)

type ThemeMode = 'light' | 'dark'

export function ColorsThemeProvider({ children }: ThemeProviderProps) {
  const isMounted = useMounted()
  const { resolvedTheme: theme } = useTheme()
  
  const [themeColor, setThemeColor] = useState<ThemeColors>(getSavedThemeColor())
  const [themeRadius, setThemeRadius] = useState<ThemeRadius>(getSavedThemeRadius())

  useEffect(() => {
    if (!isMounted) return
    setGlobalColorTheme(theme as ThemeMode, themeColor, themeRadius)
    localStorage.setItem('themeColor', themeColor)
    localStorage.setItem('themeRadius', String(themeRadius))
  }, [theme, themeColor, themeRadius, isMounted])

  if (!isMounted) {
    return null
  }
  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, themeRadius, setThemeRadius }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext(): ThemeColorStateParams {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeContext must be used within a ColorsThemeProvider')
  }

  return context
}