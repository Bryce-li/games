import { createClient } from '@supabase/supabase-js'
import type { Database, User, UserSession } from './types' // 将类型定义分离出去

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 验证环境变量
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// 创建Supabase客户端实例 - 这是一个单例，在整个应用中共享
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// 重新导出类型，方便使用
export type { User, UserSession, Database } 