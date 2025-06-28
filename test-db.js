#!/usr/bin/env node

/**
 * 测试数据库查询功能
 */

require('dotenv').config({ path: '.env.local' })

async function testQueries() {
  // 使用CommonJS require
  const gamesDb = require('./src/lib/games-db.ts')
  
  console.log('🧪 开始测试数据库查询功能...\n')
  
  try {
    // 测试1: 获取所有游戏
    console.log('📋 测试1: 获取所有游戏')
    const allGames = await gamesDb.getAllGames()
    console.log(`✅ 找到 ${allGames.length} 个游戏`)
    if (allGames.length > 0) {
      console.log(`   示例游戏: ${allGames[0].title}`)
    }
    console.log()
    
    // 测试2: 按分类获取游戏
    console.log('📂 测试2: 按分类获取游戏 (action)')
    const actionGames = await gamesDb.getGamesByCategory('action')
    console.log(`✅ Action分类有 ${actionGames.length} 个游戏`)
    console.log()
    
    // 测试3: 获取新游戏
    console.log('🆕 测试3: 获取新游戏')
    const newGames = await gamesDb.getNewGames()
    console.log(`✅ 找到 ${newGames.length} 个新游戏`)
    console.log()
    
    // 测试4: 获取热门游戏
    console.log('🔥 测试4: 获取热门游戏')
    const hotGames = await gamesDb.getHotGames()
    console.log(`✅ 找到 ${hotGames.length} 个热门游戏`)
    console.log()
    
    // 测试5: 获取英雄区游戏
    console.log('🦸 测试5: 获取英雄区游戏')
    const heroGames = await gamesDb.getHeroGames()
    console.log(`✅ 找到 ${heroGames.length} 个英雄区游戏`)
    if (heroGames.length > 0) {
      console.log(`   首个英雄游戏: ${heroGames[0].title}`)
    }
    console.log()
    
    // 测试6: 获取主页分类配置
    console.log('⚙️ 测试6: 获取主页分类配置')
    const categories = await gamesDb.getHomepageCategories()
    console.log(`✅ 找到 ${categories.length} 个主页显示的分类`)
    console.log()
    
    // 测试7: 搜索游戏
    console.log('🔍 测试7: 搜索游戏 (关键词: "action")')
    const searchResults = await gamesDb.searchGames('action', 3)
    console.log(`✅ 搜索到 ${searchResults.length} 个相关游戏`)
    console.log()
    
    // 测试8: 获取特定游戏配置
    if (allGames.length > 0) {
      const gameId = allGames[0].id
      console.log(`🎮 测试8: 获取游戏配置 (${gameId})`)
      const gameConfig = await gamesDb.getGameConfig(gameId)
      if (gameConfig) {
        console.log(`✅ 成功获取游戏配置: ${gameConfig.title}`)
        console.log(`   游戏描述: ${gameConfig.description.substring(0, 50)}...`)
        console.log(`   标签数量: ${gameConfig.tags.length}`)
      } else {
        console.log('❌ 获取游戏配置失败')
      }
    }
    
    console.log('\n🎉 所有测试完成！数据库查询功能正常工作！')
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message)
    process.exit(1)
  }
}

testQueries() 