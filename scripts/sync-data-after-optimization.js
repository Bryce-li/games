// 数据库结构优化后的数据同步脚本
// 适应新结构：games表移除game_id，使用UUID主键关联

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

// 全局变量存储游戏标题到ID的映射
let gameTitleToIdMap = {}

// 游戏基础数据 - 移除game_id字段
const gamesData = [
  {
    title: 'Count Masters',
    description: 'A fun counting and crowd-running game where you collect stickmen and multiply your army through gates.',
    embed_url: 'https://html5.gamemonetize.com/1mp5c87af0psjqv41rv4tc57ixpby81u/',
    image_url: 'https://img.gamemonetize.com/1mp5c87af0psjqv41rv4tc57ixpby81u/512x384.jpg',
    thumbnail_url: 'https://img.gamemonetize.com/1mp5c87af0psjqv41rv4tc57ixpby81u/256x192.jpg',
    category: 'action',
    is_original: false,
    is_new: true,
    is_hot: false,
    publish_date: '2024-01-15',
    last_updated: '2024-01-15',
    instructions: 'Drag to move your character and collect people. Pass through the correct gates to multiply your army and reach the finish line with the largest crowd possible.'
  },
  {
    title: 'Stone Grass',
    description: 'A strategic puzzle game where you navigate through different terrains using unique movement mechanics.',
    embed_url: 'https://html5.gamemonetize.com/stone-grass-demo/',
    image_url: 'https://example.com/stone-grass.jpg',
    thumbnail_url: 'https://example.com/stone-grass-thumb.jpg',
    category: 'puzzle',
    is_original: true,
    is_new: true,
    is_hot: true,
    publish_date: '2024-01-10',
    last_updated: '2024-01-20',
    instructions: 'Use arrow keys to move. Plan your path carefully to solve each level efficiently.'
  },
  {
    title: 'Ragdoll Archers',
    description: 'Physics-based archery game with ragdoll characters. Aim and shoot to defeat your enemies.',
    embed_url: 'https://html5.gamemonetize.com/ragdoll-archers-demo/',
    image_url: 'https://example.com/ragdoll-archers.jpg',
    thumbnail_url: 'https://example.com/ragdoll-archers-thumb.jpg',
    category: 'action',
    is_original: false,
    is_new: true,
    is_hot: false,
    publish_date: '2024-01-12',
    last_updated: '2024-01-18',
    instructions: 'Click and drag to aim your bow. Release to shoot arrows at your enemies. Use physics to your advantage.'
  },
  {
    title: 'Zombie Horde',
    description: 'Survive waves of zombies in this intense action game. Collect weapons and power-ups to stay alive.',
    embed_url: 'https://html5.gamemonetize.com/zombie-horde-demo/',
    image_url: 'https://example.com/zombie-horde.jpg',
    thumbnail_url: 'https://example.com/zombie-horde-thumb.jpg',
    category: 'action',
    is_original: false,
    is_new: false,
    is_hot: true,
    publish_date: '2024-01-08',
    last_updated: '2024-01-16',
    instructions: 'Use WASD to move and mouse to aim and shoot. Collect health packs and weapons to survive longer.'
  },
  {
    title: 'Leap and Avoid 2',
    description: 'A challenging platformer where timing and precision are key to avoiding obstacles and reaching the end.',
    embed_url: 'https://html5.gamemonetize.com/leap-avoid-2-demo/',
    image_url: 'https://example.com/leap-avoid-2.jpg',
    thumbnail_url: 'https://example.com/leap-avoid-2-thumb.jpg',
    category: 'adventure',
    is_original: true,
    is_new: true,
    is_hot: false,
    publish_date: '2024-01-14',
    last_updated: '2024-01-19',
    instructions: 'Press SPACE to jump and use arrow keys to move. Time your jumps carefully to avoid obstacles.'
  },
  {
    title: 'Cat Mini Restaurant',
    description: 'Manage a cute cat restaurant, serve customers, and grow your business in this adorable management game.',
    embed_url: 'https://html5.gamemonetize.com/cat-restaurant-demo/',
    image_url: 'https://example.com/cat-restaurant.jpg',
    thumbnail_url: 'https://example.com/cat-restaurant-thumb.jpg',
    category: 'casual',
    is_original: false,
    is_new: true,
    is_hot: false,
    publish_date: '2024-01-11',
    last_updated: '2024-01-17',
    instructions: 'Click on customers to take orders, then click on food items to serve them. Upgrade your restaurant with earned coins.'
  },
  {
    title: 'Br Br Patapim',
    description: 'A rhythm-based game with catchy music and colorful visuals. Hit the beats perfectly to score high.',
    embed_url: 'https://html5.gamemonetize.com/br-br-patapim-demo/',
    image_url: 'https://example.com/br-br-patapim.jpg',
    thumbnail_url: 'https://example.com/br-br-patapim-thumb.jpg',
    category: 'casual',
    is_original: true,
    is_new: false,
    is_hot: false,
    publish_date: '2024-01-09',
    last_updated: '2024-01-15',
    instructions: 'Press the corresponding keys when the beats reach the target area. Perfect timing gives higher scores.'
  }
]

// 游戏标签数据 - 将使用game id作为外键关联
const gameTagsData = [
  // Count Masters 标签
  { gameTitle: 'Count Masters', tags: ['running', 'crowd', 'collect', 'multiply'] },
  // Stone Grass 标签  
  { gameTitle: 'Stone Grass', tags: ['puzzle', 'strategy', 'logic', 'brain-teaser'] },
  // Ragdoll Archers 标签
  { gameTitle: 'Ragdoll Archers', tags: ['archery', 'physics', 'ragdoll', 'shooting'] },
  // Zombie Horde 标签
  { gameTitle: 'Zombie Horde', tags: ['zombie', 'survival', 'shooter', 'horror'] },
  // Leap and Avoid 2 标签
  { gameTitle: 'Leap and Avoid 2', tags: ['platformer', 'jumping', 'obstacles', 'timing'] },
  // Cat Mini Restaurant 标签
  { gameTitle: 'Cat Mini Restaurant', tags: ['management', 'restaurant', 'cats', 'cute'] },
  // Br Br Patapim 标签
  { gameTitle: 'Br Br Patapim', tags: ['rhythm', 'music', 'beat', 'colorful'] }
]

// 英雄区游戏配置 - 将使用game id作为外键关联
const heroGamesConfig = [
  { gameTitle: 'Stone Grass', display_order: 1 },
  { gameTitle: 'Count Masters', display_order: 2 },
  { gameTitle: 'Leap and Avoid 2', display_order: 3 }
]

/**
 * 清空并重新插入games表数据
 */
async function syncGamesData() {
  console.log('🎮 开始同步games表数据...')
  
  try {
    // 清空现有数据
    const { error: deleteError } = await supabase
      .from('games')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有记录
    
    if (deleteError) {
      console.error('❌ 清空games表失败:', deleteError.message)
      return false
    }
    
    console.log('✅ 已清空games表现有数据')
    
    // 插入新数据
    const { data, error } = await supabase
      .from('games')
      .insert(gamesData)
      .select('id, title') // 返回插入的记录的ID和标题
    
    if (error) {
      console.error('❌ 插入games数据失败:', error.message)
      return false
    }
    
    if (!data || data.length === 0) {
      console.error('❌ 插入games数据失败: 没有返回数据')
      return false
    }
    
    console.log(`✅ 成功插入 ${data.length} 个游戏记录`)
    
    // 创建标题到ID的映射，供后续使用
    gameTitleToIdMap = {}
    data.forEach(game => {
      gameTitleToIdMap[game.title] = game.id
    })
    
    console.log('📝 游戏ID映射已创建:')
    Object.entries(gameTitleToIdMap).forEach(([title, id]) => {
      console.log(`  ${title}: ${id}`)
    })
    
    return true
  } catch (error) {
    console.error('❌ 同步games数据时出错:', error)
    return false
  }
}

/**
 * 清空并重新插入game_tags表数据
 */
async function syncGameTagsData() {
  console.log('🏷️ 开始同步game_tags表数据...')
  
  try {
    // 清空现有数据
    const { error: deleteError } = await supabase
      .from('game_tags')
      .delete()
      .neq('game_id', '00000000-0000-0000-0000-000000000000') // 删除所有记录
    
    if (deleteError) {
      console.error('❌ 清空game_tags表失败:', deleteError.message)
      return false
    }
    
    console.log('✅ 已清空game_tags表现有数据')
    
    // 构建标签关联数据
    const tagInsertData = []
    
    for (const gameTagData of gameTagsData) {
      const gameId = gameTitleToIdMap[gameTagData.gameTitle]
      
      if (!gameId) {
        console.warn(`⚠️ 未找到游戏 "${gameTagData.gameTitle}" 的ID，跳过其标签`)
        continue
      }
      
      for (const tag of gameTagData.tags) {
        tagInsertData.push({
          game_id: gameId, // 使用UUID外键
          tag: tag
        })
      }
    }
    
    if (tagInsertData.length === 0) {
      console.error('❌ 没有有效的标签数据可插入')
      return false
    }
    
    // 批量插入标签数据
    const { error } = await supabase
      .from('game_tags')
      .insert(tagInsertData)
    
    if (error) {
      console.error('❌ 插入game_tags数据失败:', error.message)
      return false
    }
    
    console.log(`✅ 成功插入 ${tagInsertData.length} 条标签关联记录`)
    
    // 显示每个游戏的标签统计
    for (const gameTagData of gameTagsData) {
      const gameId = gameTitleToIdMap[gameTagData.gameTitle]
      if (gameId) {
        console.log(`  📌 ${gameTagData.gameTitle}: ${gameTagData.tags.length} 个标签`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ 同步game_tags数据时出错:', error)
    return false
  }
}

/**
 * 清空并重新插入hero_games表数据
 */
async function syncHeroGamesData() {
  console.log('🦸 开始同步hero_games表数据...')
  
  try {
    // 清空现有数据
    const { error: deleteError } = await supabase
      .from('hero_games')
      .delete()
      .neq('game_id', '00000000-0000-0000-0000-000000000000') // 删除所有记录
    
    if (deleteError) {
      console.error('❌ 清空hero_games表失败:', deleteError.message)
      return false
    }
    
    console.log('✅ 已清空hero_games表现有数据')
    
    // 构建英雄游戏关联数据
    const heroInsertData = []
    
    for (const heroConfig of heroGamesConfig) {
      const gameId = gameTitleToIdMap[heroConfig.gameTitle]
      
      if (!gameId) {
        console.warn(`⚠️ 未找到游戏 "${heroConfig.gameTitle}" 的ID，跳过英雄区配置`)
        continue
      }
      
      heroInsertData.push({
        game_id: gameId, // 使用UUID外键
        display_order: heroConfig.display_order,
        is_active: true
      })
    }
    
    if (heroInsertData.length === 0) {
      console.error('❌ 没有有效的英雄游戏数据可插入')
      return false
    }
    
    // 批量插入英雄游戏数据
    const { error } = await supabase
      .from('hero_games')
      .insert(heroInsertData)
    
    if (error) {
      console.error('❌ 插入hero_games数据失败:', error.message)
      return false
    }
    
    console.log(`✅ 成功插入 ${heroInsertData.length} 条英雄游戏记录`)
    
    // 显示英雄游戏配置
    for (const heroConfig of heroGamesConfig) {
      const gameId = gameTitleToIdMap[heroConfig.gameTitle]
      if (gameId) {
        console.log(`  🎯 位置 ${heroConfig.display_order}: ${heroConfig.gameTitle}`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ 同步hero_games数据时出错:', error)
    return false
  }
}

/**
 * 验证数据同步结果
 */
async function verifyDataSync() {
  console.log('🔍 验证数据同步结果...')
  
  try {
    // 检查games表
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('id, title, category, is_new, is_hot, is_original')
    
    if (gamesError) {
      console.error('❌ 查询games表失败:', gamesError.message)
      return false
    }
    
    console.log(`✅ games表: ${gamesData?.length || 0} 条记录`)
    
    // 检查game_tags表
    const { data: tagsData, error: tagsError } = await supabase
      .from('game_tags')
      .select('game_id, tag')
    
    if (tagsError) {
      console.error('❌ 查询game_tags表失败:', tagsError.message)
      return false
    }
    
    console.log(`✅ game_tags表: ${tagsData?.length || 0} 条记录`)
    
    // 检查hero_games表
    const { data: heroData, error: heroError } = await supabase
      .from('hero_games')
      .select('game_id, display_order')
      .eq('is_active', true)
      .order('display_order')
    
    if (heroError) {
      console.error('❌ 查询hero_games表失败:', heroError.message)
      return false
    }
    
    console.log(`✅ hero_games表: ${heroData?.length || 0} 条记录`)
    
    // 显示详细统计
    console.log('\n📊 详细统计:')
    
    // 分类统计
    const categoryStats = {}
    gamesData?.forEach(game => {
      categoryStats[game.category] = (categoryStats[game.category] || 0) + 1
    })
    
    console.log('分类分布:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个游戏`)
    })
    
    // 特殊标记统计
    const newGamesCount = gamesData?.filter(game => game.is_new).length || 0
    const hotGamesCount = gamesData?.filter(game => game.is_hot).length || 0
    const originalGamesCount = gamesData?.filter(game => game.is_original).length || 0
    
    console.log('特殊标记:')
    console.log(`  新游戏: ${newGamesCount} 个`)
    console.log(`  热门游戏: ${hotGamesCount} 个`)
    console.log(`  原创游戏: ${originalGamesCount} 个`)
    
    // 英雄区配置
    console.log('英雄区游戏:')
    heroData?.forEach((hero, index) => {
      // 通过game_id查找游戏标题
      const gameTitle = Object.keys(gameTitleToIdMap).find(title => gameTitleToIdMap[title] === hero.game_id) || '未知游戏'
      console.log(`  ${index + 1}. ${gameTitle} (位置: ${hero.display_order})`)
    })
    
    return true
  } catch (error) {
    console.error('❌ 验证数据同步时出错:', error)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始执行数据库结构优化后的数据同步...')
  console.log('🔧 新结构特点: games表使用UUID主键，移除game_id字段\n')
  
  try {
    // 测试数据库连接
    const { data, error } = await supabase.from('games').select('count').limit(1)
    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      process.exit(1)
    }
    console.log('✅ 数据库连接正常\n')
    
    // 按顺序执行同步步骤
    const step1 = await syncGamesData()
    if (!step1) {
      console.error('❌ games表同步失败，终止执行')
      process.exit(1)
    }
    
    console.log() // 空行分隔
    
    const step2 = await syncGameTagsData()
    if (!step2) {
      console.error('❌ game_tags表同步失败，终止执行')
      process.exit(1)
    }
    
    console.log() // 空行分隔
    
    const step3 = await syncHeroGamesData()
    if (!step3) {
      console.error('❌ hero_games表同步失败，终止执行')
      process.exit(1)
    }
    
    console.log() // 空行分隔
    
    const verified = await verifyDataSync()
    if (!verified) {
      console.error('❌ 数据验证失败')
      process.exit(1)
    }
    
    console.log('\n🎉 数据同步完成！所有表数据已成功更新到新的数据库结构。')
    console.log('🔄 新结构优化: 使用UUID主键关联，简化了数据库设计。')
    
  } catch (error) {
    console.error('❌ 执行过程中出现错误:', error)
    process.exit(1)
  }
}

// 运行主函数
main() 