import { NextRequest, NextResponse } from 'next/server'
import { signOut, clearSessionCookie } from '@/lib/auth'
import { cookies } from 'next/headers'

// 处理用户注销
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('miniplaygame-session')?.value

    if (sessionToken) {
      // 删除数据库中的会话记录
      await signOut(sessionToken)
    }

    // 清除cookie并返回成功响应
    const response = NextResponse.json({ success: true })
    const cookieOptions = clearSessionCookie()
    
    response.cookies.set(
      cookieOptions.name,
      cookieOptions.value,
      {
        expires: cookieOptions.expires,
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        path: cookieOptions.path,
      }
    )

    return response
  } catch (error) {
    console.error('注销失败:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
} 