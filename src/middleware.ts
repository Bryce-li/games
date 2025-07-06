import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdmin } from '@/lib/auth-utils'

// 定义需要保护的管理员路由
const ADMIN_ROUTES = ['/admin', '/data-upload']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 保护管理员路由
  if (pathname.startsWith('/admin')) {
    try {
      const user = await getCurrentUser()
      
      if (!user || !isAdmin(user)) {
        // 未登录或非管理员，重定向到首页
        return NextResponse.redirect(new URL('/?error=access_denied', request.url))
      }
    } catch (error) {
      console.error('中间件验证失败:', error)
      return NextResponse.redirect(new URL('/?error=auth_error', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有管理员路由
    '/admin/:path*',
  ]
} 