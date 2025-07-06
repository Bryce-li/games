// 数据库表类型定义（与数据库表结构对应）
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          google_id: string
          role: 'user' | 'admin'
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          google_id: string
          role?: 'user' | 'admin'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          google_id?: string
          role?: 'user' | 'admin'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          expires_at: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          expires_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
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

// 用户类型定义
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string | null
  google_id: string
  role: 'user' | 'admin'
  is_active: boolean
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
} 