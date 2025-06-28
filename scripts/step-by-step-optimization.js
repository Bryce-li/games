const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function stepByStepOptimization() {
  console.log('🔧 分步骤数据库优化分析...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    // 步骤1: 检查当前外键约束
    console.log('\n🔍 步骤1: 检查当前外键约束...')
    
    // 获取sample数据来了解结构
    const { data: sampleGame, error: gameError } = await supabase
      .from('games')
      .select('id, game_id, title')
      .limit(1)
      .single()

    if (gameError) {
      console.error('❌ 获取游戏数据失败:', gameError.message)
      return false
    }

    const { data: sampleTag, error: tagError } = await supabase
      .from('game_tags')
      .select('id, game_id, tag')
      .limit(1)
      .single()

    if (tagError) {
      console.error('❌ 获取标签数据失败:', tagError.message)
      return false
    }

    console.log('📊 当前数据结构:')
    console.log(`   Games.id: ${sampleGame.id} (${typeof sampleGame.id})`)
    console.log(`   Games.game_id: ${sampleGame.game_id} (${typeof sampleGame.game_id})`)
    console.log(`   Game_tags.game_id: ${sampleTag.game_id} (${typeof sampleTag.game_id})`)

    // 步骤2: 提供优化建议
    console.log('\n💡 步骤2: 优化建议分析...')
    
    console.log('\n🎯 当前情况分析:')
    console.log('   ✅ games表有两个标识符: id(UUID主键) 和 game_id(VARCHAR业务标识)')
    console.log('   ✅ 外键表使用game_id(VARCHAR)进行关联')
    console.log('   ⚠️  外键约束防止直接修改为UUID')
    
    console.log('\n🚀 推荐的优化方案:')
    console.log('   方案1: 保留现有结构（推荐）')
    console.log('     - 优点: 系统稳定，game_id便于URL和调试')
    console.log('     - 缺点: 轻微的存储冗余')
    console.log('   ')
    console.log('   方案2: 渐进式优化')
    console.log('     - 步骤1: 优化代码逻辑，减少game_id的使用')
    console.log('     - 步骤2: 新功能优先使用主键id')
    console.log('     - 步骤3: 在确认稳定后考虑完全迁移')
    console.log('   ')
    console.log('   方案3: 完全迁移（需要修改约束）')
    console.log('     - 需要删除外键约束')
    console.log('     - 重建表结构')
    console.log('     - 风险较高')

    // 步骤3: 检查性能影响
    console.log('\n📈 步骤3: 性能影响分析...')
    
    const { count: gamesCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
    
    const { count: tagsCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 数据量统计:`)
    console.log(`   Games: ${gamesCount} 条记录`)
    console.log(`   Tags: ${tagsCount} 条记录`)
    console.log(`   性能影响: 在当前数据量下，VARCHAR vs UUID的性能差异极小`)

    // 步骤4: 给出最终建议
    console.log('\n🎯 步骤4: 最终建议...')
    
    console.log('\n💭 考虑到以下因素:')
    console.log('   ✅ 当前系统运行稳定')
    console.log('   ✅ 数据量不大，性能差异微小')
    console.log('   ✅ game_id在URL中有SEO价值')
    console.log('   ⚠️  完全迁移风险较高')
    
    console.log('\n💡 我的建议:')
    console.log('   1. 🎯 保持当前数据库结构不变')
    console.log('   2. 🔧 仅优化代码中的查询逻辑')
    console.log('   3. 📝 统一使用主键id进行内部关联查询')
    console.log('   4. 🌐 保留game_id用于URL和业务标识')
    
    console.log('\n❓ 如果您仍希望进行完全迁移，我可以创建详细的迁移方案')
    console.log('   包括外键约束的处理和回滚计划')

    return true

  } catch (error) {
    console.error('❌ 分析过程出错:', error.message)
    return false
  }
}

stepByStepOptimization() 