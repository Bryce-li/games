import { createClient } from '@supabase/supabase-js'
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 分类配置数据（简化版，直接批量插入）
const categoriesData = [
  { category_key: 'action', category_title: 'Action Games', show_on_homepage: true, display_order: 1, max_games: 8 },
  { category_key: 'adventure', category_title: 'Adventure Games', show_on_homepage: true, display_order: 2, max_games: 8 },
  { category_key: 'casual', category_title: 'Casual Games', show_on_homepage: true, display_order: 3, max_games: 8 },
  { category_key: 'puzzle', category_title: 'Puzzle Games', show_on_homepage: true, display_order: 4, max_games: 8 },
  { category_key: 'sports', category_title: 'Sports Games', show_on_homepage: true, display_order: 5, max_games: 8 },
  { category_key: 'shooting', category_title: 'Shooting Games', show_on_homepage: true, display_order: 6, max_games: 8 },
  { category_key: 'basketball', category_title: 'Basketball Games', show_on_homepage: false, display_order: 7, max_games: 6 },
  { category_key: 'beauty', category_title: 'Beauty Games', show_on_homepage: false, display_order: 8, max_games: 6 },
  { category_key: 'bike', category_title: 'Bike Games', show_on_homepage: false, display_order: 9, max_games: 6 },
  { category_key: 'car', category_title: 'Car Games', show_on_homepage: false, display_order: 10, max_games: 6 },
  { category_key: 'card', category_title: 'Card Games', show_on_homepage: false, display_order: 11, max_games: 6 },
  { category_key: 'clicker', category_title: 'Clicker Games', show_on_homepage: false, display_order: 12, max_games: 6 },
  { category_key: 'controller', category_title: 'Controller Games', show_on_homepage: false, display_order: 13, max_games: 6 },
  { category_key: 'dress-up', category_title: 'Dress Up Games', show_on_homepage: false, display_order: 14, max_games: 6 },
  { category_key: 'driving', category_title: 'Driving Games', show_on_homepage: false, display_order: 15, max_games: 6 },
  { category_key: 'escape', category_title: 'Escape Games', show_on_homepage: false, display_order: 16, max_games: 6 },
  { category_key: 'flash', category_title: 'Flash Games', show_on_homepage: false, display_order: 17, max_games: 6 },
  { category_key: 'fps', category_title: 'FPS Games', show_on_homepage: false, display_order: 18, max_games: 6 },
  { category_key: 'horror', category_title: 'Horror Games', show_on_homepage: false, display_order: 19, max_games: 6 },
  { category_key: 'io', category_title: '.io Games', show_on_homepage: false, display_order: 20, max_games: 6 },
  { category_key: 'mahjong', category_title: 'Mahjong Games', show_on_homepage: false, display_order: 21, max_games: 6 },
  { category_key: 'minecraft', category_title: 'Minecraft Games', show_on_homepage: false, display_order: 22, max_games: 6 },
  { category_key: 'pool', category_title: 'Pool Games', show_on_homepage: false, display_order: 23, max_games: 6 },
  { category_key: 'soccer', category_title: 'Soccer Games', show_on_homepage: false, display_order: 24, max_games: 6 },
  { category_key: 'stickman', category_title: 'Stickman Games', show_on_homepage: false, display_order: 25, max_games: 6 },
  { category_key: 'tower-defense', category_title: 'Tower Defense Games', show_on_homepage: false, display_order: 26, max_games: 6 }
]

async function insertCategories() {
  console.log('📂 批量插入分类数据...')
  console.log(`📡 连接到: ${supabaseUrl}`)
  console.log(`📊 准备插入 ${categoriesData.length} 个分类`)

  try {
    // 批量插入所有分类数据
    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesData)
      .select()

    if (error) {
      console.error('❌ 批量插入分类失败:', error.message)
      return
    }

    console.log(`✅ 成功插入 ${data.length} 个分类`)

    // 验证插入结果
    const { data: allCategories, error: verifyError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (verifyError) {
      console.error('❌ 验证分类数据失败:', verifyError.message)
      return
    }

    console.log(`\n📊 插入结果验证:`)
    console.log(`   📂 数据库中总计: ${allCategories.length} 个分类`)

    // 显示主页分类
    console.log('\n🏠 主页显示的分类:')
    const homepageCategories = allCategories.filter(cat => cat.show_on_homepage)
    homepageCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.category_title} (${cat.category_key})`)
    })

    // 显示所有分类
    console.log('\n📋 所有分类列表:')
    allCategories.forEach((cat, index) => {
      const status = cat.show_on_homepage ? '🏠 主页' : '🔍 搜索'
      console.log(`   ${index + 1}. ${cat.category_title} (${cat.category_key}) - ${status}`)
    })

    console.log('\n🎉 分类数据插入完成！')

  } catch (error) {
    console.error('❌ 插入分类时出错:', error.message)
  }
}

insertCategories() 