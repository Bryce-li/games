const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function optimizeDatabase() {
  console.log('🚀 开始数据库结构优化...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    // 步骤1: 获取所有当前数据
    console.log('\n📊 步骤1: 获取当前数据...')
    
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')

    if (gamesError) {
      console.error('❌ 获取games数据失败:', gamesError.message)
      return false
    }

    const { data: tags, error: tagsError } = await supabase
      .from('game_tags')
      .select('*')

    if (tagsError) {
      console.error('❌ 获取tags数据失败:', tagsError.message)
      return false
    }

    const { data: heroes, error: heroesError } = await supabase
      .from('hero_games')
      .select('*')

    if (heroesError) {
      console.error('❌ 获取heroes数据失败:', heroesError.message)
      return false
    }

    console.log(`✅ 获取到: ${games.length}个游戏, ${tags.length}个标签, ${heroes.length}个英雄`)

    // 步骤2: 创建game_id到id的映射
    console.log('\n🔗 步骤2: 创建映射关系...')
    const gameIdToId = {}
    games.forEach(game => {
      gameIdToId[game.game_id] = game.id
    })
    console.log(`✅ 创建了 ${Object.keys(gameIdToId).length} 个映射关系`)

    // 步骤3: 准备新的标签数据（使用UUID外键）
    console.log('\n🏷️ 步骤3: 准备新的标签数据...')
    const newTagsData = []
    let validTags = 0
    let invalidTags = 0

    tags.forEach(tag => {
      const gameUuid = gameIdToId[tag.game_id]
      if (gameUuid) {
        newTagsData.push({
          game_id: gameUuid, // 现在这里将存储UUID
          tag: tag.tag,
          created_at: tag.created_at
        })
        validTags++
      } else {
        console.log(`❌ 无效标签: ${tag.game_id} -> ${tag.tag}`)
        invalidTags++
      }
    })

    console.log(`✅ 准备了 ${validTags} 个有效标签，跳过 ${invalidTags} 个无效标签`)

    // 步骤4: 准备新的英雄数据（使用UUID外键）
    console.log('\n🌟 步骤4: 准备新的英雄数据...')
    const newHeroesData = []
    let validHeroes = 0
    let invalidHeroes = 0

    heroes.forEach(hero => {
      const gameUuid = gameIdToId[hero.game_id]
      if (gameUuid) {
        newHeroesData.push({
          game_id: gameUuid, // 现在这里将存储UUID
          display_order: hero.display_order,
          is_active: hero.is_active,
          created_at: hero.created_at,
          updated_at: hero.updated_at
        })
        validHeroes++
      } else {
        console.log(`❌ 无效英雄游戏: ${hero.game_id}`)
        invalidHeroes++
      }
    })

    console.log(`✅ 准备了 ${validHeroes} 个有效英雄游戏，跳过 ${invalidHeroes} 个无效记录`)

    // 步骤5: 重建game_tags表
    console.log('\n🔧 步骤5: 重建game_tags表...')
    
    // 删除现有表
    const { error: dropTagsError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS game_tags CASCADE'
    })

    if (dropTagsError) {
      console.error('❌ 删除game_tags表失败:', dropTagsError.message)
      // 尝试手动删除数据
      const { error: deleteTagsError } = await supabase
        .from('game_tags')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      
      if (deleteTagsError) {
        console.error('❌ 清空game_tags表失败:', deleteTagsError.message)
        return false
      }
      console.log('✅ 已清空game_tags表数据')
    } else {
      console.log('✅ 已删除game_tags表')
    }

    // 步骤6: 重建hero_games表
    console.log('\n🔧 步骤6: 重建hero_games表...')
    
    // 删除现有表
    const { error: dropHeroesError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS hero_games CASCADE'
    })

    if (dropHeroesError) {
      console.error('❌ 删除hero_games表失败:', dropHeroesError.message)
      // 尝试手动删除数据
      const { error: deleteHeroesError } = await supabase
        .from('hero_games')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      
      if (deleteHeroesError) {
        console.error('❌ 清空hero_games表失败:', deleteHeroesError.message)
        return false
      }
      console.log('✅ 已清空hero_games表数据')
    } else {
      console.log('✅ 已删除hero_games表')
    }

    // 步骤7: 重新插入优化后的数据
    console.log('\n📥 步骤7: 插入优化后的数据...')
    
    if (newTagsData.length > 0) {
      const { error: insertTagsError } = await supabase
        .from('game_tags')
        .insert(newTagsData)

      if (insertTagsError) {
        console.error('❌ 插入标签数据失败:', insertTagsError.message)
        return false
      }
      console.log(`✅ 成功插入 ${newTagsData.length} 个标签记录`)
    }

    if (newHeroesData.length > 0) {
      const { error: insertHeroesError } = await supabase
        .from('hero_games')
        .insert(newHeroesData)

      if (insertHeroesError) {
        console.error('❌ 插入英雄游戏数据失败:', insertHeroesError.message)
        return false
      }
      console.log(`✅ 成功插入 ${newHeroesData.length} 个英雄游戏记录`)
    }

    // 步骤8: 删除games表的冗余game_id字段
    console.log('\n🗑️ 步骤8: 删除冗余的game_id字段...')
    const { error: dropColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE games DROP COLUMN IF EXISTS game_id'
    })

    if (dropColumnError) {
      console.error('⚠️ 删除game_id字段失败:', dropColumnError.message)
      console.log('📋 注意: 需要手动在Supabase控制台删除game_id字段')
    } else {
      console.log('✅ 已删除games表的game_id字段')
    }

    console.log('\n🎉 数据库结构优化完成！')
    return true

  } catch (error) {
    console.error('❌ 优化过程出错:', error.message)
    return false
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  optimizeDatabase().then(success => {
    if (success) {
      console.log('\n📋 下一步: 更新代码中的字段引用')
    } else {
      console.log('\n⚠️ 优化失败，请检查错误信息')
      process.exit(1)
    }
  })
}

module.exports = { optimizeDatabase } 