import type { Locale } from './i18n-config'

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  zh: () => import('../dictionaries/zh.json').then((module) => module.default),
} as const;

export const getDictionary = async (locale: Locale) => {
  try {
    return await dictionaries[locale as keyof typeof dictionaries]()
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    return dictionaries.en()
  }
} 