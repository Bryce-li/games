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

async function backupData() {
  console.log('📦 开始备份数据...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  const backup = {
    timestamp: new Date().toISOString(),
    games: [],
    game_tags: [],
    hero_games: [],
    categories: []
  }

  try {
    // 1. 备份games表
    console.log('\n📊 备份games表...')
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')

    if (gamesError) {
      console.error('❌ 备份games表失败:', gamesError.message)
      return false
    }

    backup.games = games
    console.log(`✅ 已备份 ${games.length} 个游戏记录`)

    // 2. 备份game_tags表
    console.log('\n🏷️ 备份game_tags表...')
    const { data: tags, error: tagsError } = await supabase
      .from('game_tags')
      .select('*')

    if (tagsError) {
      console.error('❌ 备份game_tags表失败:', tagsError.message)
      return false
    }

    backup.game_tags = tags
    console.log(`✅ 已备份 ${tags.length} 个标签记录`)

    // 3. 备份hero_games表
    console.log('\n🌟 备份hero_games表...')
    const { data: heroes, error: heroError } = await supabase
      .from('hero_games')
      .select('*')

    if (heroError) {
      console.error('❌ 备份hero_games表失败:', heroError.message)
      return false
    }

    backup.hero_games = heroes
    console.log(`✅ 已备份 ${heroes.length} 个英雄游戏记录`)

    // 4. 备份categories表
    console.log('\n📂 备份categories表...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')

    if (categoriesError) {
      console.error('❌ 备份categories表失败:', categoriesError.message)
      return false
    }

    backup.categories = categories
    console.log(`✅ 已备份 ${categories.length} 个分类记录`)

    // 5. 保存备份文件
    const backupFileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const backupPath = `backups/${backupFileName}`
    
    // 确保backups目录存在
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups')
    }

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
    console.log(`\n💾 备份已保存到: ${backupPath}`)

    // 6. 验证备份完整性
    console.log('\n🔍 验证备份完整性...')
    const savedBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    console.log(`✅ Games: ${savedBackup.games.length} 条记录`)
    console.log(`✅ Tags: ${savedBackup.game_tags.length} 条记录`)
    console.log(`✅ Heroes: ${savedBackup.hero_games.length} 条记录`)
    console.log(`✅ Categories: ${savedBackup.categories.length} 条记录`)

    console.log('\n🎉 数据备份完成！可以安全进行优化。')
    return true

  } catch (error) {
    console.error('❌ 备份过程出错:', error.message)
    return false
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  backupData().then(success => {
    if (!success) {
      process.exit(1)
    }
  })
}

module.exports = { backupData } 