export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'zh'],
} as const

export type Locale = (typeof i18n)['locales'][number]

// 获取用户首选语言
export function getPreferredLocale(acceptLanguage: string | null): Locale {
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0])
      .find(lang => i18n.locales.includes(lang as Locale))
    if (preferredLocale) return preferredLocale as Locale
  }
  return i18n.defaultLocale
} 