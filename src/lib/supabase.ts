import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 由于这是游戏网站，不需要持久化会话
  },
})

// 数据库表类型定义（与数据库表结构对应）
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          game_id: string
          title: string
          description: string | null
          embed_url: string
          image_url: string | null
          thumbnail_url: string | null
          category: string
          is_new: boolean
          is_hot: boolean
          is_original: boolean
          instructions: string | null
          publish_date: string | null
          last_updated: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          title: string
          description?: string | null
          embed_url: string
          image_url?: string | null
          thumbnail_url?: string | null
          category: string
          is_new?: boolean
          is_hot?: boolean
          is_original?: boolean
          instructions?: string | null
          publish_date?: string | null
          last_updated?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          title?: string
          description?: string | null
          embed_url?: string
          image_url?: string | null
          thumbnail_url?: string | null
          category?: string
          is_new?: boolean
          is_hot?: boolean
          is_original?: boolean
          instructions?: string | null
          publish_date?: string | null
          last_updated?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_tags: {
        Row: {
          id: string
          game_id: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          tag: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          tag?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          category_key: string
          category_title: string
          show_on_homepage: boolean
          display_order: number
          max_games: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_key: string
          category_title: string
          show_on_homepage?: boolean
          display_order?: number
          max_games?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_key?: string
          category_title?: string
          show_on_homepage?: boolean
          display_order?: number
          max_games?: number
          created_at?: string
          updated_at?: string
        }
      }
      hero_games: {
        Row: {
          id: string
          game_id: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// 创建类型安全的Supabase客户端
export type SupabaseClient = typeof supabase 