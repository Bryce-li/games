import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { createOrUpdateUser, createUserSession, setSessionCookie, type GoogleUser } from '@/lib/auth'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

/**
 * 处理来自 Google Identity Services (One-Tap) 的登录请求
 */
export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json({ error: '凭证丢失' }, { status: 400 })
    }

    // 使用 Google Auth Library 验证 ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload) {
      return NextResponse.json({ error: '无法解析凭证' }, { status: 400 })
    }

    // 从 payload 中提取用户信息
    const googleUser: GoogleUser = {
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
    }

    if (!googleUser.email) {
      return NextResponse.json({ error: '无法从凭证中获取邮箱' }, { status: 400 })
    }

    // 使用现有的函数创建或更新用户
    const user = await createOrUpdateUser(googleUser)
    if (!user) {
      return NextResponse.json({ error: '创建或更新用户失败' }, { status: 500 })
    }

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIP || 'unknown'

    // 创建用户会话
    const session = await createUserSession(user.id, ipAddress || undefined, userAgent || undefined)
    if (!session) {
      return NextResponse.json({ error: '创建会话失败' }, { status: 500 })
    }

    // 设置会话 Cookie 并返回成功响应
    const response = NextResponse.json({ success: true, user })
    const cookieOptions = setSessionCookie(session.session_token)
    
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
    console.error('Google One-Tap 登录失败:', error)
    return NextResponse.json({ error: '内部服务器错误' }, { status: 500 })
  }
} 