const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function restoreFromBackup() {
  console.log('🔄 从备份恢复数据...')
  
  try {
    // 1. 查找最新的备份文件
    console.log('\n📂 查找最新备份文件...')
    const backupFiles = fs.readdirSync('backups').filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    
    if (backupFiles.length === 0) {
      console.error('❌ 未找到备份文件')
      return false
    }

    // 按文件名排序，获取最新的
    backupFiles.sort()
    const latestBackup = backupFiles[backupFiles.length - 1]
    const backupPath = `backups/${latestBackup}`
    
    console.log(`✅ 找到最新备份: ${latestBackup}`)

    // 2. 读取备份数据
    console.log('\n📖 读取备份数据...')
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    
    console.log(`✅ 备份数据:`)
    console.log(`   Games: ${backup.games?.length || 0} 条记录`)
    console.log(`   Tags: ${backup.game_tags?.length || 0} 条记录`)
    console.log(`   Heroes: ${backup.hero_games?.length || 0} 条记录`)
    console.log(`   Categories: ${backup.categories?.length || 0} 条记录`)

    // 3. 恢复标签数据（我们只丢失了这个）
    console.log('\n🏷️ 恢复标签数据...')
    
    if (backup.game_tags && backup.game_tags.length > 0) {
      // 先清空当前数据
      const { error: clearError } = await supabase
        .from('game_tags')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (clearError) {
        console.error('❌ 清空当前标签数据失败:', clearError.message)
        return false
      }

      // 插入备份数据
      const { error: insertError } = await supabase
        .from('game_tags')
        .insert(backup.game_tags)

      if (insertError) {
        console.error('❌ 恢复标签数据失败:', insertError.message)
        return false
      }

      console.log(`✅ 成功恢复 ${backup.game_tags.length} 个标签记录`)
    }

    // 4. 验证恢复结果
    console.log('\n🔍 验证恢复结果...')
    const { data: tags, error: verifyError } = await supabase
      .from('game_tags')
      .select('*')

    if (verifyError) {
      console.error('❌ 验证失败:', verifyError.message)
      return false
    }

    console.log(`✅ 验证成功: 当前有 ${tags.length} 个标签记录`)

    console.log('\n🎉 数据恢复完成！')
    return true

  } catch (error) {
    console.error('❌ 恢复过程出错:', error.message)
    return false
  }
}

restoreFromBackup() 