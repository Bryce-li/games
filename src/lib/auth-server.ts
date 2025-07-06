import { cookies } from 'next/headers'
import type { User } from './supabase/client'
import { verifySession, SESSION_COOKIE_NAME } from './auth'

// 获取当前用户（从cookies中读取会话）- 仅服务器端使用
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