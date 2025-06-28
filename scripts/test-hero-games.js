// 测试英雄区游戏功能
// 直接调用getHeroGames函数验证其工作状态

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

// 游戏分类映射
const gameCategories = {
  action: "Action",
  adventure: "Adventure", 
  basketball: "Basketball",
  beauty: "Beauty",
  bike: "Bike",
  car: "Car",
  card: "Card",
  casual: "Casual",
  clicker: "Clicker",
  controller: "Controller",
  dressUp: "Dress Up",
  driving: "Driving",
  escape: "Escape",
  flash: "Flash",
  fps: "FPS",
  horror: "Horror",
  io: ".io",
  mahjong: "Mahjong",
  minecraft: "Minecraft",
  pool: "Pool",
  puzzle: "Puzzle",
  shooting: "Shooting",
  soccer: "Soccer",
  sports: "Sports",
  stickman: "Stickman",
  towerDefense: "Tower Defense"
}

/**
 * 批量获取多个游戏的标签
 */
async function getBatchGameTags(gameIds) {
  if (gameIds.length === 0) return {}
  
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('game_id, tag')
      .in('game_id', gameIds)
    
    if (error) {
      console.error('批量获取游戏标签失败:', error.message)
      return {}
    }
    
    const tagsMap = {}
    data?.forEach(row => {
      if (!tagsMap[row.game_id]) {
        tagsMap[row.game_id] = []
      }
      tagsMap[row.game_id].push(row.tag)
    })
    
    return tagsMap
  } catch (error) {
    console.error('批量获取游戏标签时出错:', error)
    return {}
  }
}

/**
 * 测试版本的getHeroGames函数
 */
async function getHeroGames() {
  console.log('🎮 开始获取英雄区游戏...')
  
  try {
    // 第一步：获取英雄区配置
    console.log('步骤1: 获取英雄区配置...')
    const { data: heroData, error: heroError } = await supabase
      .from('hero_games')
      .select('game_id, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (heroError) {
      console.error('❌ 获取英雄区配置失败:', heroError.message)
      return []
    }
    
    console.log(`✅ 获取到 ${heroData?.length || 0} 个英雄区配置`)
    heroData?.forEach((hero, index) => {
      console.log(`  ${index + 1}. game_id: ${hero.game_id}, 显示顺序: ${hero.display_order}`)
    })
    
    if (!heroData || heroData.length === 0) {
      console.log('⚠️ 没有找到英雄区游戏配置')
      return []
    }
    
    // 第二步：获取对应的游戏数据
    console.log('\n步骤2: 获取对应的游戏数据...')
    const gameIds = heroData.map(hero => hero.game_id)
    console.log('要查询的游戏ID:', gameIds)
    
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .in('id', gameIds)
    
    if (gamesError) {
      console.error('❌ 获取英雄区游戏数据失败:', gamesError.message)
      return []
    }
    
    console.log(`✅ 获取到 ${gamesData?.length || 0} 个游戏数据`)
    gamesData?.forEach((game, index) => {
      console.log(`  ${index + 1}. ${game.title} (${game.id})`)
    })
    
    if (!gamesData || gamesData.length === 0) {
      console.log('❌ 没有找到对应的游戏数据')
      return []
    }
    
    // 第三步：批量获取标签
    console.log('\n步骤3: 获取游戏标签...')
    const tagsMap = await getBatchGameTags(gameIds)
    console.log('标签映射:', tagsMap)
    
    // 第四步：按照hero_games的顺序重新排列并转换数据
    console.log('\n步骤4: 构建最终结果...')
    const result = []
    
    for (const hero of heroData) {
      const gameData = gamesData.find(game => game.id === hero.game_id)
      if (gameData) {
        const heroGame = {
          id: gameData.id,
          title: gameData.title,
          description: gameData.description || '',
          image: gameData.image_url || gameData.thumbnail_url || '',
          category: gameCategories[gameData.category] || gameData.category,
          tags: tagsMap[gameData.id] || [],
          isOriginal: gameData.is_original,
          isNew: gameData.is_new,
          isHot: gameData.is_hot
        }
        result.push(heroGame)
        console.log(`✅ 添加英雄游戏: ${heroGame.title}`)
      } else {
        console.log(`⚠️ 未找到游戏ID ${hero.game_id} 对应的游戏数据`)
      }
    }
    
    console.log(`\n🎉 成功构建 ${result.length} 个英雄区游戏`)
    return result
  } catch (error) {
    console.error('❌ 获取英雄区游戏时出错:', error)
    return []
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 测试英雄区游戏功能...\n')
  
  try {
    // 测试数据库连接
    const { data, error } = await supabase.from('games').select('count').limit(1)
    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      process.exit(1)
    }
    console.log('✅ 数据库连接正常\n')
    
    // 调用getHeroGames函数
    const heroGames = await getHeroGames()
    
    if (heroGames.length > 0) {
      console.log('\n📋 英雄区游戏最终结果:')
      heroGames.forEach((game, index) => {
        console.log(`\n${index + 1}. ${game.title}`)
        console.log(`   ID: ${game.id}`)
        console.log(`   描述: ${game.description}`)
        console.log(`   分类: ${game.category}`)
        console.log(`   图片: ${game.image}`)
        console.log(`   标签: [${game.tags.join(', ')}]`)
        console.log(`   特殊标记: ${[
          game.isNew ? 'NEW' : '',
          game.isHot ? 'HOT' : '',
          game.isOriginal ? 'ORIGINAL' : ''
        ].filter(Boolean).join(', ') || '无'}`)
      })
      
      console.log('\n🎉 英雄区游戏功能测试成功！')
    } else {
      console.log('\n⚠️ 没有获取到英雄区游戏数据')
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
    process.exit(1)
  }
}

// 运行测试
main() 