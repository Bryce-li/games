const { createClient } = require('@supabase/supabase-js')
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
  { key: 'dressUp', title: 'Dress Up Games', showOnHomepage: false, order: 14, maxGames: 6 },
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
  { key: 'towerDefense', title: 'Tower Defense Games', showOnHomepage: false, order: 26, maxGames: 6 }
]

async function syncCategories() {
  console.log('📂 开始同步分类数据...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    // 1. 清空现有分类数据
    console.log('\n🧹 清空现有分类数据...')
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) {
      console.error('❌ 清空分类数据失败:', deleteError.message)
      return
    }
    console.log('✅ 现有分类数据已清空')

    // 2. 插入新的分类数据
    console.log('\n📥 插入分类数据...')
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < categoriesData.length; i++) {
      const category = categoriesData[i]
      console.log(`📁 插入分类 ${i + 1}/${categoriesData.length}: ${category.title}`)

      try {
        const { error: insertError } = await supabase
          .from('categories')
          .insert({
            category_key: category.key,
            category_title: category.title,
            show_on_homepage: category.showOnHomepage,
            display_order: category.order,
            max_games: category.maxGames
          })

        if (insertError) {
          console.error(`❌ 插入分类 ${category.title} 失败:`, insertError.message)
          errorCount++
        } else {
          console.log(`  ✅ 分类 ${category.title} 插入成功`)
          successCount++
        }
      } catch (error) {
        console.error(`❌ 处理分类 ${category.title} 时出错:`, error.message)
        errorCount++
      }
    }

    // 3. 验证同步结果
    console.log('\n🔍 验证分类同步结果...')
    const { data: categories, error: verifyError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (verifyError) {
      console.error('❌ 验证分类数据失败:', verifyError.message)
      return
    }

    console.log(`\n📊 分类同步统计:`)
    console.log(`   ✅ 成功插入: ${successCount} 个分类`)
    console.log(`   ❌ 插入失败: ${errorCount} 个分类`)
    console.log(`   📂 数据库中总计: ${categories.length} 个分类`)

    // 4. 显示主页分类
    console.log('\n🏠 主页显示的分类:')
    const homepageCategories = categories.filter(cat => cat.show_on_homepage)
    homepageCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.category_title} (${cat.category_key}) - 最多显示${cat.max_games}个游戏`)
    })

    // 5. 显示所有分类
    console.log('\n📋 所有分类列表:')
    categories.forEach((cat, index) => {
      const status = cat.show_on_homepage ? '🏠 主页' : '🔍 搜索'
      console.log(`   ${index + 1}. ${cat.category_title} (${cat.category_key}) - ${status}`)
    })

    console.log('\n🎉 分类数据同步完成！')

  } catch (error) {
    console.error('❌ 分类同步过程出错:', error.message)
  }
}

syncCategories() 