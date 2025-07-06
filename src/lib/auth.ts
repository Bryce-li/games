import { supabaseAdmin } from './supabase/server'
import type { User, UserSession } from './supabase/client'
import { sign, verify } from 'jsonwebtoken'

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
    // 首先检查用户是否已存在 - 【重要】使用 admin 客户端
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('google_id', googleUser.id)
      .single()

    const adminEmail = process.env.ADMIN_EMAIL

    if (existingUser) {
      // 更新现有用户的登录时间和信息 - 【重要】使用 admin 客户端
      const updateData: Partial<Omit<User, 'id' | 'created_at'>> = {
        name: googleUser.name,
        avatar_url: googleUser.picture,
        last_login_at: new Date().toISOString(),
      }

      // 如果邮箱匹配管理员邮箱，则确保其角色为 'admin'
      if (adminEmail && googleUser.email === adminEmail) {
        updateData.role = 'admin'
      }

      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', existingUser.id)
        .select()
        .single()

      if (error) {
        console.error('更新用户信息失败:', error)
        return null
      }

      return updatedUser
    } else {
      // 根据邮箱判断新用户角色
      const newUserRole = (adminEmail && googleUser.email === adminEmail) ? 'admin' : 'user'

      // 创建新用户 - 【重要】使用 admin 客户端
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          google_id: googleUser.id,
          last_login_at: new Date().toISOString(),
          role: newUserRole, // 在创建时设置角色
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

    // 在数据库中创建会话记录 - 【重要】使用 admin 客户端
    const { data: session, error } = await supabaseAdmin
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
    
    // 从数据库查询会话 - 【重要】使用 admin 客户端
    const { data: session } = await supabaseAdmin
      .from('user_sessions')
      .select('*, users(*)')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session || !session.users) {
      return null
    }

    return session.users as User
  } catch (error) {
    console.error('会话验证失败:', error)
    return null
  }
}

// 注销用户（删除会话）
export async function signOut(token: string): Promise<boolean> {
  try {
    // 从数据库删除会话 - 【重要】使用 admin 客户端
    const { error } = await supabaseAdmin
      .from('user_sessions')
      .delete()
      .eq('session_token', token)

    return !error
  } catch (error) {
    console.error('注销失败:', error)
    return false
  }
}

// 设置会话cookie的配置
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

// 清除会话cookie的配置
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

// 导出SESSION_COOKIE_NAME供服务器端使用
export { SESSION_COOKIE_NAME } 