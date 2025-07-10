import { createClient } from '@supabase/supabase-js'
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 分类配置数据（与games-db.ts中的gameCategories保持一致）
const categoriesData = [
  // 主要分类 - 在主页显示
  { key: 'action', title: 'Action Games', showOnHomepage: true, order: 1, maxGames: 8 },
  { key: 'adventure', title: 'Adventure Games', showOnHomepage: true, order: 2, maxGames: 8 },
  { key: 'casual', title: 'Casual Games', showOnHomepage: true, order: 3, maxGames: 8 },
  { key: 'puzzle', title: 'Puzzle Games', showOnHomepage: true, order: 4, maxGames: 8 },
  { key: 'sports', title: 'Sports Games', showOnHomepage: true, order: 5, maxGames: 8 },
  { key: 'shooting', title: 'Shooting Games', showOnHomepage: true, order: 6, maxGames: 8 },
  
  // 次要分类 - 不在主页显示，但支持搜索和筛选
  { key: 'basketball', title: 'Basketball Games', showOnHomepage: false, order: 7, maxGames: 6 },
  { key: 'beauty', title: 'Beauty Games', showOnHomepage: false, order: 8, maxGames: 6 },
  { key: 'bike', title: 'Bike Games', showOnHomepage: false, order: 9, maxGames: 6 },
  { key: 'car', title: 'Car Games', showOnHomepage: false, order: 10, maxGames: 6 },
  { key: 'card', title: 'Card Games', showOnHomepage: false, order: 11, maxGames: 6 },
  { key: 'clicker', title: 'Clicker Games', showOnHomepage: false, order: 12, maxGames: 6 },
  { key: 'controller', title: 'Controller Games', showOnHomepage: false, order: 13, maxGames: 6 },
  { key: 'dress-up', title: 'Dress Up Games', showOnHomepage: false, order: 14, maxGames: 6 },
  { key: 'driving', title: 'Driving Games', showOnHomepage: false, order: 15, maxGames: 6 },
  { key: 'escape', title: 'Escape Games', showOnHomepage: false, order: 16, maxGames: 6 },
  { key: 'flash', title: 'Flash Games', showOnHomepage: false, order: 17, maxGames: 6 },
  { key: 'fps', title: 'FPS Games', showOnHomepage: false, order: 18, maxGames: 6 },
  { key: 'horror', title: 'Horror Games', showOnHomepage: false, order: 19, maxGames: 6 },
  { key: 'io', title: '.io Games', showOnHomepage: false, order: 20, maxGames: 6 },
  { key: 'mahjong', title: 'Mahjong Games', showOnHomepage: false, order: 21, maxGames: 6 },
  { key: 'minecraft', title: 'Minecraft Games', showOnHomepage: false, order: 22, maxGames: 6 },
  { key: 'pool', title: 'Pool Games', showOnHomepage: false, order: 23, maxGames: 6 },
  { key: 'soccer', title: 'Soccer Games', showOnHomepage: false, order: 24, maxGames: 6 },
  { key: 'stickman', title: 'Stickman Games', showOnHomepage: false, order: 25, maxGames: 6 },
  { key: 'tower-defense', title: 'Tower Defense Games', showOnHomepage: false, order: 26, maxGames: 6 }
]

async function syncCategories() {
  console.log('📂 开始同步分类数据...')
  console.log(`