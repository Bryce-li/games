const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCategories() {
  console.log('🔍 检查分类表状态...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    // 检查分类表
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ 查询分类数据失败:', error.message)
      return
    }

    console.log(`\n📂 分类表状态:`)
    console.log(`   📊 数据库中总计: ${categories.length} 个分类`)

    if (categories.length > 0) {
      console.log('\n📋 现有分类:')
      categories.forEach((cat, index) => {
        const status = cat.show_on_homepage ? '🏠 主页' : '🔍 搜索'
        console.log(`   ${index + 1}. ${cat.category_title} (${cat.category_key}) - ${status}`)
      })
    } else {
      console.log('\n⚠️  分类表为空，需要同步分类数据')
    }

  } catch (error) {
    console.error('❌ 检查分类时出错:', error.message)
  }
}

checkCategories() 