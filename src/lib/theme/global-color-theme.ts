import { themes } from '@/lib/theme/constants/theme'

import { ThemeColors, ThemeMode, ThemeRadius } from '@/lib/theme/types/theme'

export default function setGlobalColorTheme(
  themeMode: ThemeMode,
  color: ThemeColors,
  radius: ThemeRadius,
) {
  const theme = { ...themes[color][themeMode], radius: `${radius}rem` } as {
    [key: string]: string
  }

  for (const key in theme) {
    document.documentElement.style.setProperty(`--${key}`, theme[key])
  }
}