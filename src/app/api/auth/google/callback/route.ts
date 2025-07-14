import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateUser, createUserSession, setSessionCookie, type GoogleUser } from '@/lib/auth'

// Google OAuth配置
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

function getGoogleRedirectUri() {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
  }
  return 'http://localhost:3000/api/auth/google/callback';
}

const GOOGLE_REDIRECT_URI = getGoogleRedirectUri()

// 网络配置常量
const FETCH_TIMEOUT = 15000 // 15秒超时

// 处理Google OAuth回调
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    // 检查是否有错误
    if (error) {
      console.error('Google OAuth错误:', error)
      return NextResponse.redirect(new URL('/?error=oauth_error', request.url))
    }

    if (!code) {
      console.error('未收到授权码')
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
    }

    // 用授权码换取访问令牌
    const controller1 = new AbortController()
    const timeoutId1 = setTimeout(() => controller1.abort(), FETCH_TIMEOUT)
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
      signal: controller1.signal
    })

    clearTimeout(timeoutId1)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('获取访问令牌失败:', errorText)
      return NextResponse.redirect(new URL('/?error=token_error', request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 使用访问令牌获取用户信息
    const controller2 = new AbortController()
    const timeoutId2 = setTimeout(() => controller2.abort(), FETCH_TIMEOUT)
    
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller2.signal
    })

    clearTimeout(timeoutId2)

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('获取用户信息失败:', errorText)
      return NextResponse.redirect(new URL('/?error=user_info_error', request.url))
    }

    const googleUser: GoogleUser = await userResponse.json()

    // 创建或更新用户
    const user = await createOrUpdateUser(googleUser)
    if (!user) {
      console.error('创建用户失败')
      return NextResponse.redirect(new URL('/?error=user_creation_error', request.url))
    }

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIP || 'unknown'

    // 创建用户会话
    const session = await createUserSession(user.id, ipAddress || undefined, userAgent || undefined)
    if (!session) {
      console.error('创建会话失败')
      return NextResponse.redirect(new URL('/?error=session_error', request.url))
    }

    // 设置会话cookie并重定向到首页
    const response = NextResponse.redirect(new URL('/', request.url))
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
    console.error('OAuth回调处理失败:', error)
    
    // 详细的错误日志记录
    if (error instanceof Error) {
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // 检查是否是网络超时错误
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT') || 
          error.name === 'AbortError' || error.message.includes('UND_ERR_CONNECT_TIMEOUT') ||
          error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        console.error('检测到网络连接错误')
        return NextResponse.redirect(new URL('/?error=network_timeout', request.url))
      }
    }
    
    return NextResponse.redirect(new URL('/?error=callback_error', request.url))
  }
} 