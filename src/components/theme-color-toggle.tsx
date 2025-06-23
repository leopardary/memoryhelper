'use client'

import * as React from 'react'
import { useThemeContext } from '@/providers/colors-theme-provider'
import { useTheme } from 'next-themes'

import { ThemeColors } from '@/types/theme'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/select'

const availableThemeColors = [
  { name: 'Zinc', light: 'bg-zinc-900', dark: 'bg-zinc-100' },
  { name: 'Red', light: 'bg-red-600', dark: 'bg-red-600' },
  { name: 'Rose', light: 'bg-rose-600', dark: 'bg-rose-700' },
  { name: 'Orange', light: 'bg-orange-500', dark: 'bg-orange-700' },
  { name: 'Green', light: 'bg-green-600', dark: 'bg-green-500' },
  { name: 'Blue', light: 'bg-blue-600', dark: 'bg-blue-500' },
  { name: 'Yellow', light: 'bg-yellow-400', dark: 'bg-yellow-500' },
  { name: 'Violet', light: 'bg-violet-600', dark: 'bg-violet-700' },
]

export function ThemeColorToggler() {
  const { themeColor, setThemeColor } = useThemeContext()
  const { theme } = useTheme()

  const onValueChange = (value: string) => {
    setThemeColor(value as ThemeColors);
  }

  return (
    <Select onValueChange={onValueChange} value={themeColor}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Color" />
      </SelectTrigger>
      <SelectContent>
        {availableThemeColors.map((color) => (
          <SelectItem key={color.name} value={color.name}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full ${theme === 'light' ? color.light : color.dark}`} />
              <span>{color.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}