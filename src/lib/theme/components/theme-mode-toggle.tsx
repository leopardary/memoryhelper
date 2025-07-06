'use client'

import { SunIcon, MoonIcon} from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import { Button } from '@/app/components/button'

export function ThemeModeToggler() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <SunIcon className={theme == 'light' ? 'hidden' : ''} />
      <MoonIcon className={theme == 'dark' ? 'hidden' : ''} />
    </Button>
  )
}