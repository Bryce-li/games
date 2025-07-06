import type { User } from './supabase/client'

/**
 * 检查用户是否为管理员
 * 这是一个纯函数，可以在客户端和服务器端安全使用。
 * @param user - 用户对象或 null
 * @returns boolean - 如果是活跃的管理员则返回 true
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin' && user?.is_active === true
} 