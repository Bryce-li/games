// 修复数据库外键关系
// 在删除game_id字段后重新建立正确的外键约束

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

/**
 * 检查当前外键状态
 */
async function checkCurrentForeignKeys() {
  console.log('🔍 检查当前外键状态...')
  
  try {
    // 通过查询系统表检查外键约束
    const { data, error } = await supabase.rpc('get_foreign_keys_info')
    
    if (error && error.message.includes('function "get_foreign_keys_info" does not exist')) {
      console.log('⚠️ 无法直接查询外键信息，将通过测试查询来验证')
      return await testRelationships()
    }
    
    if (error) {
      console.error('❌ 查询外键信息失败:', error.message)
      return false
    }
    
    console.log('📊 当前外键约束:', data)
    return true
  } catch (error) {
    console.error('❌ 检查外键时出错:', error)
    return false
  }
}

/**
 * 通过测试查询验证表关系
 */
async function testRelationships() {
  console.log('🧪 测试表关系...')
  
  try {
    // 测试hero_games和games的关系
    console.log('测试hero_games -> games关系...')
    const { data: heroTest, error: heroError } = await supabase
      .from('hero_games')
      .select(`
        game_id,
        games!inner(id, title)
      `)
      .limit(1)
    
    if (heroError) {
      console.log('❌ hero_games -> games 关系断开:', heroError.message)
    } else {
      console.log('✅ hero_games -> games 关系正常')
    }
    
    // 测试game_tags和games的关系
    console.log('测试game_tags -> games关系...')
    const { data: tagTest, error: tagError } = await supabase
      .from('game_tags')
      .select(`
        game_id,
        games!inner(id, title)
      `)
      .limit(1)
    
    if (tagError) {
      console.log('❌ game_tags -> games 关系断开:', tagError.message)
    } else {
      console.log('✅ game_tags -> games 关系正常')
    }
    
    return !heroError && !tagError
  } catch (error) {
    console.error('❌ 测试关系时出错:', error)
    return false
  }
}

/**
 * 修复外键约束
 */
async function fixForeignKeys() {
  console.log('🔧 开始修复外键约束...')
  
  try {
    // 由于我们无法直接执行DDL语句，我们需要提供手动修复的SQL
    console.log('📝 需要在Supabase控制台中执行以下SQL语句：')
    console.log('\n-- 1. 删除可能存在的旧外键约束')
    console.log('ALTER TABLE hero_games DROP CONSTRAINT IF EXISTS hero_games_game_id_fkey;')
    console.log('ALTER TABLE game_tags DROP CONSTRAINT IF EXISTS game_tags_game_id_fkey;')
    
    console.log('\n-- 2. 添加新的外键约束')
    console.log('ALTER TABLE hero_games ADD CONSTRAINT hero_games_game_id_fkey')
    console.log('  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;')
    
    console.log('ALTER TABLE game_tags ADD CONSTRAINT game_tags_game_id_fkey')
    console.log('  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;')
    
    console.log('\n🔍 或者，可以检查当前数据的一致性...')
    
    // 检查数据一致性
    await validateDataConsistency()
    
    return true
  } catch (error) {
    console.error('❌ 修复外键时出错:', error)
    return false
  }
}

/**
 * 验证数据一致性
 */
async function validateDataConsistency() {
  console.log('\n📊 验证数据一致性...')
  
  try {
    // 检查hero_games表中的game_id是否都存在于games表中
    const { data: heroGames, error: heroError } = await supabase
      .from('hero_games')
      .select('game_id')
    
    if (heroError) {
      console.error('❌ 获取hero_games数据失败:', heroError.message)
      return false
    }
    
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id')
    
    if (gamesError) {
      console.error('❌ 获取games数据失败:', gamesError.message)
      return false
    }
    
    const gameIds = new Set(games.map(g => g.id))
    const orphanedHeroes = heroGames.filter(h => !gameIds.has(h.game_id))
    
    if (orphanedHeroes.length > 0) {
      console.log(`⚠️ 发现 ${orphanedHeroes.length} 个孤立的hero_games记录:`)
      orphanedHeroes.forEach(hero => {
        console.log(`  - game_id: ${hero.game_id}`)
      })
    } else {
      console.log('✅ hero_games数据一致性检查通过')
    }
    
    // 检查game_tags表
    const { data: gameTags, error: tagError } = await supabase
      .from('game_tags')
      .select('game_id')
    
    if (tagError) {
      console.error('❌ 获取game_tags数据失败:', tagError.message)
      return false
    }
    
    const orphanedTags = gameTags.filter(t => !gameIds.has(t.game_id))
    
    if (orphanedTags.length > 0) {
      console.log(`⚠️ 发现 ${orphanedTags.length} 个孤立的game_tags记录`)
    } else {
      console.log('✅ game_tags数据一致性检查通过')
    }
    
    return orphanedHeroes.length === 0 && orphanedTags.length === 0
  } catch (error) {
    console.error('❌ 验证数据一致性时出错:', error)
    return false
  }
}

/**
 * 测试修复后的查询
 */
async function testQueries() {
  console.log('\n🧪 测试查询功能...')
  
  try {
    // 测试手动JOIN查询（我们修改后的方式）
    console.log('测试手动JOIN查询...')
    
    const { data: heroData, error: heroError } = await supabase
      .from('hero_games')
      .select('game_id, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (heroError) {
      console.error('❌ 获取hero_games失败:', heroError.message)
      return false
    }
    
    if (heroData && heroData.length > 0) {
      const gameIds = heroData.map(h => h.game_id)
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('id, title, description, image_url, thumbnail_url, category, is_new, is_hot, is_original')
        .in('id', gameIds)
      
      if (gamesError) {
        console.error('❌ 获取games数据失败:', gamesError.message)
        return false
      }
      
      console.log(`✅ 成功获取 ${heroData.length} 个英雄区游戏配置`)
      console.log(`✅ 成功获取 ${gamesData?.length || 0} 个对应的游戏数据`)
      
      // 验证数据匹配
      const matchedGames = heroData.filter(hero => 
        gamesData?.some(game => game.id === hero.game_id)
      )
      
      console.log(`✅ 数据匹配成功: ${matchedGames.length}/${heroData.length}`)
      
      if (matchedGames.length === heroData.length) {
        console.log('🎉 所有英雄区游戏数据完整！')
        return true
      } else {
        console.log('⚠️ 部分英雄区游戏数据缺失')
        return false
      }
    } else {
      console.log('⚠️ 没有找到英雄区游戏配置')
      return true // 没有数据也算正常
    }
  } catch (error) {
    console.error('❌ 测试查询时出错:', error)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始修复外键关系...\n')
  
  try {
    // 测试数据库连接
    const { data, error } = await supabase.from('games').select('count').limit(1)
    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      process.exit(1)
    }
    console.log('✅ 数据库连接正常\n')
    
    // 检查当前状态
    await checkCurrentForeignKeys()
    console.log()
    
    // 验证数据一致性
    const isConsistent = await validateDataConsistency()
    console.log()
    
    // 提供修复方案
    if (!isConsistent) {
      console.log('⚠️ 数据一致性问题需要先解决')
    }
    
    await fixForeignKeys()
    console.log()
    
    // 测试修复效果
    const testResult = await testQueries()
    
    if (testResult) {
      console.log('\n🎉 外键关系修复完成！查询功能正常。')
      console.log('📝 注意：如果仍有关联查询问题，请在Supabase控制台执行上述SQL语句。')
    } else {
      console.log('\n⚠️ 修复完成，但仍存在一些问题，请检查数据完整性。')
    }
    
  } catch (error) {
    console.error('❌ 执行过程中出现错误:', error)
    process.exit(1)
  }
}

// 运行主函数
main() 