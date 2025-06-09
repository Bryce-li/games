import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from '@/lib/i18n-config'

// 获取首选语言
function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0])
      .find(lang => i18n.locales.includes(lang))
    if (preferredLocale) return preferredLocale
  }
  return i18n.defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 检查路径是否已经包含语言代码
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
 
  // 重定向到带语言代码的路径
  if (pathnameIsMissingLocale) {
    // 从 cookie 中获取语言偏好
    const preferredLanguage = request.cookies.get('preferred-language')?.value
    const locale = preferredLanguage || i18n.defaultLocale
    
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: [
    // 跳过所有内部路径 (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
} 