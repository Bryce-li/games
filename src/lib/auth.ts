import { supabase, type User, type UserSession } from './supabase'
import { sign, verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

// JWT密钥，实际部署时应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const SESSION_COOKIE_NAME = 'miniplaygame-session'

// Google用户信息接口
export interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
}

// 创建或更新用户
export async function createOrUpdateUser(googleUser: GoogleUser): Promise<User | null> {
  try {
    // 首先检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleUser.id)
      .single()

    if (existingUser) {
      // 更新现有用户的登录时间和信息
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          name: googleUser.name,
          avatar_url: googleUser.picture,
          last_login_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (error) {
        console.error('更新用户信息失败:', error)
        return null
      }

      return updatedUser
    } else {
      // 创建新用户
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          google_id: googleUser.id,
          last_login_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('创建用户失败:', error)
        return null
      }

      return newUser
    }
  } catch (error) {
    console.error('用户操作失败:', error)
    return null
  }
}

// 创建用户会话
export async function createUserSession(
  userId: string, 
  ipAddress?: string, 
  userAgent?: string
): Promise<UserSession | null> {
  try {
    // 生成JWT token
    const sessionToken = sign(
      { userId, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '30d' } // 30天过期
    )

    // 计算过期时间
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // 在数据库中创建会话记录
    const { data: session, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single()

    if (error) {
      console.error('创建会话失败:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('会话创建过程失败:', error)
    return null
  }
}

// 验证会话token
export async function verifySession(token: string): Promise<User | null> {
  try {
    // 验证JWT token
    const decoded = verify(token, JWT_SECRET) as { userId: string }
    
    // 从数据库查询会话
    const { data: session } = await supabase
      .from('user_sessions')
      .select('*, users(*)')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session) {
      return null
    }

    return session.users as User
  } catch (error) {
    console.error('会话验证失败:', error)
    return null
  }
}

// 获取当前用户（从cookies中读取会话）
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    return await verifySession(sessionToken)
  } catch (error) {
    console.error('获取当前用户失败:', error)
    return null
  }
}

// 注销用户（删除会话）
export async function signOut(token: string): Promise<boolean> {
  try {
    // 从数据库删除会话
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', token)

    return !error
  } catch (error) {
    console.error('注销失败:', error)
    return false
  }
}

// 检查用户是否为管理员
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin' && user?.is_active === true
}

// 设置会话cookie
export function setSessionCookie(token: string) {
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)
  
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  }
}

// 清除会话cookie
export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  }
} 