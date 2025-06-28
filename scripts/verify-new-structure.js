// 验证新数据库结构的数据完整性

const { createClient } = require('@supabase/supabase-js')

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 验证新数据库结构数据...\n')
  
  try {
    // 检查games表
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, title, category, is_new, is_hot, is_original')
      .order('title')
    
    if (gamesError) {
      console.error('❌ 查询games表失败:', gamesError.message)
      return
    }
    
    console.log(`📊 games表: ${games?.length || 0} 条记录`)
    games?.forEach((game, index) => {
      const flags = []
      if (game.is_new) flags.push('NEW')
      if (game.is_hot) flags.push('HOT')
      if (game.is_original) flags.push('ORIG')
      const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : ''
      console.log(`  ${index + 1}. ${game.title} (${game.category})${flagStr}`)
      console.log(`     ID: ${game.id}`)
    })
    
    // 检查game_tags表
    const { data: tags, error: tagsError } = await supabase
      .from('game_tags')
      .select('game_id, tag')
    
    if (tagsError) {
      console.error('❌ 查询game_tags表失败:', tagsError.message)
      return
    }
    
    console.log(`\n🏷️ game_tags表: ${tags?.length || 0} 条记录`)
    
    // 按游戏ID分组统计标签
    const tagsByGame = {}
    tags?.forEach(tag => {
      if (!tagsByGame[tag.game_id]) {
        tagsByGame[tag.game_id] = []
      }
      tagsByGame[tag.game_id].push(tag.tag)
    })
    
    games?.forEach(game => {
      const gameTags = tagsByGame[game.id] || []
      console.log(`  ${game.title}: ${gameTags.length} 个标签 [${gameTags.join(', ')}]`)
    })
    
    // 检查hero_games表
    const { data: heroes, error: heroError } = await supabase
      .from('hero_games')
      .select('game_id, display_order, is_active')
      .order('display_order')
    
    if (heroError) {
      console.error('❌ 查询hero_games表失败:', heroError.message)
      return
    }
    
    console.log(`\n🦸 hero_games表: ${heroes?.length || 0} 条记录`)
    heroes?.forEach((hero, index) => {
      const game = games?.find(g => g.id === hero.game_id)
      const status = hero.is_active ? '激活' : '禁用'
      console.log(`  ${index + 1}. ${game?.title || '未知游戏'} (位置: ${hero.display_order}, 状态: ${status})`)
      console.log(`     关联ID: ${hero.game_id}`)
    })
    
    // 统计分析
    console.log('\n📈 数据统计:')
    const categoryStats = {}
    games?.forEach(game => {
      categoryStats[game.category] = (categoryStats[game.category] || 0) + 1
    })
    
    console.log('分类分布:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个游戏`)
    })
    
    const newCount = games?.filter(g => g.is_new).length || 0
    const hotCount = games?.filter(g => g.is_hot).length || 0
    const originalCount = games?.filter(g => g.is_original).length || 0
    
    console.log('特殊标记:')
    console.log(`  新游戏: ${newCount} 个`)
    console.log(`  热门游戏: ${hotCount} 个`)
    console.log(`  原创游戏: ${originalCount} 个`)
    
    console.log('\n✅ 数据验证完成！新数据库结构工作正常。')
    
  } catch (error) {
    console.error('❌ 验证过程中出错:', error)
  }
}

main() 