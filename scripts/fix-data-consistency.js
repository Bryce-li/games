const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixDataConsistency() {
  console.log('🔧 修复数据一致性问题...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    // 1. 检查缺少game_id的games记录
    console.log('\n🔍 检查缺少game_id的games记录...')
    const { data: missingGameId, error: missingError } = await supabase
      .from('games')
      .select('id, game_id, title')
      .is('game_id', null)

    if (missingError) {
      console.error('❌ 查询缺少game_id的记录失败:', missingError.message)
      return
    }

    if (missingGameId.length > 0) {
      console.log(`❌ 发现 ${missingGameId.length} 个缺少game_id的记录:`)
      missingGameId.forEach((game, index) => {
        console.log(`   ${index + 1}. ID: ${game.id}, Title: ${game.title}`)
      })

      // 为缺少game_id的记录生成game_id
      console.log('\n🔧 为缺少game_id的记录生成标识符...')
      for (const game of missingGameId) {
        // 根据标题生成game_id
        const gameId = game.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')

        console.log(`   为 "${game.title}" 生成 game_id: "${gameId}"`)

        const { error: updateError } = await supabase
          .from('games')
          .update({ game_id: gameId })
          .eq('id', game.id)

        if (updateError) {
          console.error(`   ❌ 更新失败:`, updateError.message)
        } else {
          console.log(`   ✅ 更新成功`)
        }
      }
    } else {
      console.log('✅ 所有games记录都有game_id')
    }

    console.log('\n🎉 数据一致性检查完成！')

  } catch (error) {
    console.error('❌ 修复过程出错:', error.message)
  }
}

fixDataConsistency() 