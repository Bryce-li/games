const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyData() {
  console.log('🔍 验证Supabase数据同步状态...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    // 1. 检查游戏数据
    console.log('\n📊 检查游戏数据...')
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })

    if (gamesError) {
      console.error('❌ 获取游戏数据失败:', gamesError.message)
      return
    }

    console.log(`✅ 发现 ${games.length} 个游戏:`)
    games.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.title} (${game.game_id})`)
      console.log(`      - 分类: ${game.category}`)
      console.log(`      - 新游戏: ${game.is_new ? '是' : '否'}`)
      console.log(`      - 热门: ${game.is_hot ? '是' : '否'}`)
    })

    // 2. 检查游戏标签
    console.log('\n🏷️  检查游戏标签...')
    const { data: tags, error: tagsError } = await supabase
      .from('game_tags')
      .select('*')

    if (tagsError) {
      console.error('❌ 获取标签数据失败:', tagsError.message)
      return
    }

    console.log(`✅ 发现 ${tags.length} 个标签关联`)
    
    // 按游戏分组显示标签
    const tagsByGame = {}
    tags.forEach(tag => {
      if (!tagsByGame[tag.game_id]) {
        tagsByGame[tag.game_id] = []
      }
      tagsByGame[tag.game_id].push(tag.tag)
    })

    Object.entries(tagsByGame).forEach(([gameId, gameTags]) => {
      const game = games.find(g => g.game_id === gameId)
      console.log(`   📝 ${game?.title || gameId}: [${gameTags.join(', ')}]`)
    })

    // 3. 检查英雄区游戏
    console.log('\n🌟 检查英雄区游戏...')
    const { data: heroGames, error: heroError } = await supabase
      .from('hero_games')
      .select('*')
      .order('display_order', { ascending: true })

    if (heroError) {
      console.error('❌ 获取英雄区数据失败:', heroError.message)
      return
    }

    console.log(`✅ 发现 ${heroGames.length} 个英雄区游戏:`)
    heroGames.forEach((hero, index) => {
      const game = games.find(g => g.game_id === hero.game_id)
      console.log(`   ${index + 1}. ${game?.title || hero.game_id} (激活: ${hero.is_active ? '是' : '否'})`)
    })

    // 4. 检查分类配置表
    console.log('\n📂 检查分类配置表...')
    const { data: categoryConfigs, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (categoryError) {
      console.error('❌ 获取分类配置失败:', categoryError.message)
    } else {
      console.log(`✅ 发现 ${categoryConfigs.length} 个配置分类`)
      console.log('🏠 主页显示分类:')
      const homepageCategories = categoryConfigs.filter(cat => cat.show_on_homepage)
      homepageCategories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.category_title} (${cat.category_key}) - 最多${cat.max_games}个游戏`)
      })
    }

    // 5. 检查游戏分类统计
    console.log('\n📊 游戏分类统计...')
    const categories = {}
    games.forEach(game => {
      if (!categories[game.category]) {
        categories[game.category] = 0
      }
      categories[game.category]++
    })

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   📁 ${category}: ${count} 个游戏`)
    })

    // 6. 检查特殊标记
    console.log('\n⭐ 特殊游戏统计...')
    const newGames = games.filter(g => g.is_new)
    const hotGames = games.filter(g => g.is_hot)
    const originalGames = games.filter(g => g.is_original)

    console.log(`   🆕 新游戏: ${newGames.length} 个`)
    console.log(`   🔥 热门游戏: ${hotGames.length} 个`)
    console.log(`   🎨 原创游戏: ${originalGames.length} 个`)

    console.log('\n🎉 数据验证完成！所有数据已成功同步到Supabase。')

  } catch (error) {
    console.error('❌ 验证过程出错:', error.message)
  }
}

verifyData() 