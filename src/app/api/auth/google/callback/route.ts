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
const FETCH_TIMEOUT = 30000 // 30秒超时
const MAX_RETRIES = 3 // 最大重试次数
const RETRY_DELAY = 2000 // 重试延迟2秒

// 创建带超时的fetch请求
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = FETCH_TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    console.log(`发送请求到: ${url}, 超时时间: ${timeout}ms`)
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    console.log(`请求成功: ${url}, 状态码: ${response.status}`)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`请求失败: ${url}`, error)
    throw error
  }
}

// 重试函数
async function retryFetch(url: string, options: RequestInit, maxRetries: number = MAX_RETRIES) {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试第${attempt}次请求: ${url}`)
      return await fetchWithTimeout(url, options)
    } catch (error) {
      lastError = error as Error
      console.error(`第${attempt}次请求失败:`, error)
      
      if (attempt < maxRetries) {
        const delay = RETRY_DELAY * attempt
        console.log(`等待${delay}ms后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError!
}

// 处理Google OAuth回调
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    console.log('=== Google OAuth回调开始 ===')
    
    // 检查代理环境变量
    console.log('环境变量检查:', {
      HTTP_PROXY: process.env.HTTP_PROXY || '未设置',
      HTTPS_PROXY: process.env.HTTPS_PROXY || '未设置'
    })
    
    // 检查是否有错误
    if (error) {
      console.error('Google OAuth错误:', error)
      return NextResponse.redirect(new URL('/?error=oauth_error', request.url))
    }

    if (!code) {
      console.error('未收到授权码')
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
    }

    console.log('开始处理Google OAuth回调，授权码:', code.substring(0, 10) + '...')

    // 用授权码换取访问令牌 - 使用重试机制
    console.log('正在获取访问令牌...')
    const tokenResponse = await retryFetch('https://oauth2.googleapis.com/token', {
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
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('获取访问令牌失败:', errorText)
      return NextResponse.redirect(new URL('/?error=token_error', request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    console.log('成功获取访问令牌')

    // 使用访问令牌获取用户信息 - 使用重试机制
    console.log('正在获取用户信息...')
    const userResponse = await retryFetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('获取用户信息失败:', errorText)
      return NextResponse.redirect(new URL('/?error=user_info_error', request.url))
    }

    const googleUser: GoogleUser = await userResponse.json()
    console.log('成功获取用户信息:', googleUser.email)

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

    console.log('用户登录成功:', user.email)
    console.log('=== Google OAuth回调完成 ===')

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
        console.error('检测到网络连接错误，可能需要配置代理')
        return NextResponse.redirect(new URL('/?error=network_timeout', request.url))
      }
    }
    
    return NextResponse.redirect(new URL('/?error=callback_error', request.url))
  }
} 