const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function analyzeGameIdUsage() {
  console.log('🔍 分析game_id字段的使用情况...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    // 1. 查看games表结构
    console.log('\n📊 Games表结构分析:')
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, game_id, title')
      .limit(5)

    if (gamesError) {
      console.error('❌ 查询games表失败:', gamesError.message)
      return
    }

    console.log('✅ Games表字段示例:')
    games.forEach((game, index) => {
      console.log(`   ${index + 1}. ID: ${game.id}`)
      console.log(`      Game_ID: ${game.game_id}`)
      console.log(`      Title: ${game.title}`)
    })

    // 2. 检查game_tags表的外键引用
    console.log('\n📋 Game_tags表外键分析:')
    const { data: tags, error: tagsError } = await supabase
      .from('game_tags')
      .select('id, game_id, tag')
      .limit(5)

    if (tagsError) {
      console.error('❌ 查询game_tags表失败:', tagsError.message)
    } else {
      console.log('✅ Game_tags表外键示例:')
      tags.forEach((tag, index) => {
        console.log(`   ${index + 1}. Tag_ID: ${tag.id}`)
        console.log(`      Game_ID(外键): ${tag.game_id}`)
        console.log(`      Tag: ${tag.tag}`)
      })
    }

    // 3. 检查hero_games表的外键引用
    console.log('\n🌟 Hero_games表外键分析:')
    const { data: heroGames, error: heroError } = await supabase
      .from('hero_games')
      .select('id, game_id, display_order')

    if (heroError) {
      console.error('❌ 查询hero_games表失败:', heroError.message)
    } else {
      console.log('✅ Hero_games表外键示例:')
      heroGames.forEach((hero, index) => {
        console.log(`   ${index + 1}. Hero_ID: ${hero.id}`)
        console.log(`      Game_ID(外键): ${hero.game_id}`)
        console.log(`      Display_Order: ${hero.display_order}`)
      })
    }

    // 4. 验证外键关联的数据一致性
    console.log('\n🔗 外键关联一致性检查:')
    
    // 检查game_tags中是否有无效的外键
    const { data: invalidTags, error: invalidTagsError } = await supabase
      .from('game_tags')
      .select('game_id')
      .not('game_id', 'in', `(${games.map(g => `'${g.game_id}'`).join(',')})`)

    if (!invalidTagsError && invalidTags.length === 0) {
      console.log('✅ Game_tags表的外键引用全部有效')
    } else {
      console.log(`❌ 发现 ${invalidTags?.length || 0} 个无效的外键引用`)
    }

    // 检查hero_games中是否有无效的外键
    const { data: invalidHeroes, error: invalidHeroError } = await supabase
      .from('hero_games')
      .select('game_id')
      .not('game_id', 'in', `(${games.map(g => `'${g.game_id}'`).join(',')})`)

    if (!invalidHeroError && invalidHeroes.length === 0) {
      console.log('✅ Hero_games表的外键引用全部有效')
    } else {
      console.log(`❌ 发现 ${invalidHeroes?.length || 0} 个无效的外键引用`)
    }

    // 5. 分析优化的可行性
    console.log('\n📈 优化可行性分析:')
    console.log('当前结构:')
    console.log('   Games表: id(UUID主键) + game_id(VARCHAR唯一)')
    console.log('   外键表: 引用game_id字段')
    console.log('\n优化后结构:')
    console.log('   Games表: id(UUID主键)')
    console.log('   外键表: 引用id字段')
    console.log('\n优化效果:')
    console.log('   ✅ 减少存储空间 (UUID vs VARCHAR)')
    console.log('   ✅ 提高查询性能 (UUID索引更高效)')
    console.log('   ✅ 简化代码逻辑')
    console.log('   ✅ 符合数据库设计最佳实践')

    // 6. 建议的优化步骤
    console.log('\n📋 建议的优化步骤:')
    console.log('1. 🔄 备份当前数据')
    console.log('2. 🔧 更新外键表结构 (game_id: VARCHAR -> UUID)')
    console.log('3. 📝 更新代码中的字段引用')
    console.log('4. 🗑️  删除冗余的game_id字段')
    console.log('5. ✅ 验证功能完整性')

  } catch (error) {
    console.error('❌ 分析过程出错:', error.message)
  }
}

analyzeGameIdUsage() 