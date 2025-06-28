#!/usr/bin/env node

/**
 * 数据迁移脚本
 * 将现有的games.ts数据导入到Supabase数据库
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// 从环境变量读取Supabase配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：请确保在.env.local文件中设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error(`当前读取到的URL: ${supabaseUrl}`)
  console.error(`当前读取到的KEY: ${supabaseAnonKey ? '已设置' : '未设置'}`)
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 现有的游戏数据（从games.ts复制）
const gamesData = {
  "count-masters-stickman-games": {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    description: "A fast-paced running game where you gather a growing army of stickmen to clash against rival crowds. Navigate through obstacles, choose the best paths to multiply your numbers, and lead your team to victory.",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    embedUrl: "https://games.crazygames.com/en_US/count-masters-stickman-games/index.html",
    thumbnail: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "action",
    tags: ["running", "stickman", "action", "multiplayer"],
    isHot: true,
    publishDate: "2025-01-10",
    lastUpdated: "2025-01-15",
    instructions: "Use the left and right arrow keys to move your character. You can also move by moving the mouse left or right. Press space or left-click to select actions and navigate through obstacles while gathering your stickman army."
  },
  "stone-grass-mowing-simulator": {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    description: "A relaxed and enjoyable lawn mowing simulator. Constantly upgrade your lawn mowing machine and create the perfect lawn!",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    embedUrl: "https://games.crazygames.com/en_US/stone-grass-mowing-simulator/index.html",
    thumbnail: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual",
    tags: ["simulation", "casual", "relaxing"],
    isNew: true,
    publishDate: "2025-01-18",
    lastUpdated: "2025-01-19",
    instructions: "Use your mouse to control the mowing direction, or use WASD or arrow keys to move around. Simply guide your lawn mowing machine across the grass to create the perfect lawn while enjoying this relaxing simulator."
  },
  "ragdoll-archers": {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    description: "A physics-based archery game with ragdoll characters. Aim and shoot to defeat your opponents in this hilarious battle!",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    embedUrl: "https://games.crazygames.com/en_US/ragdoll-archers/index.html",
    thumbnail: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    category: "action",
    tags: ["archery", "physics", "ragdoll", "shooting"],
    isHot: true,
    publishDate: "2024-12-01",
    lastUpdated: "2025-01-16",
    instructions: "Click and drag with your mouse to aim your bow, then release to shoot arrows at your ragdoll opponents. Use arrow keys for fine-tuned aiming adjustments. Master the physics-based mechanics to defeat all challengers!"
  },
  "zombie-horde-build-survive": {
    id: "zombie-horde-build-survive",
    title: "Zombie Horde: Build & Survive",
    description: "Build your base and survive waves of zombies in this intense survival game!",
    image: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    embedUrl: "https://games.crazygames.com/en_US/zombie-horde-build-survive/index.html",
    thumbnail: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    category: "action",
    tags: ["survival", "zombie", "building", "strategy"],
    isNew: true,
    instructions: "Use WASD keys to move your character around the map. Click with your mouse to build structures and interact with objects. Use number keys (1-9) for quick building shortcuts. Gather resources, build defenses, and survive against endless waves of zombies!"
  },
  "leap-and-avoid-2": {
    id: "leap-and-avoid-2",
    title: "Leap and Avoid 2",
    description: "Jump and avoid obstacles in this challenging platformer sequel!",
    image: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    embedUrl: "https://games.crazygames.com/en_US/leap-and-avoid-2/index.html?v=1.332",
    thumbnail: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    category: "casual",
    tags: ["platformer", "jumping", "obstacles", "arcade"],
    isNew: true,
    instructions: "Press the Spacebar or Up arrow key to make your character jump over obstacles. You can also click with your mouse to jump. Time your jumps carefully to avoid obstacles and achieve the highest score possible in this challenging platformer!"
  },
  "cat-mini-restaurant": {
    id: "cat-mini-restaurant",
    title: "Cat Mini Restaurant",
    description: "In this heartwarming and healing simulation management game \"Meow Flavor Restaurant\", you will become a little cat owner who loves cooking and personally create your own dream restaurant. Starting from a small cat house kitchen, gradually upgrading equipment, developing new recipes, recruiting cute cat employees, until becoming the most popular internet celebrity restaurant in the city! More than 30 cats with different personalities and skills are waiting for you to collect!",
    image: "/images/game-thumbnails/stone-grass-mowing-simulator_16x9-cover.jpg",
    embedUrl: "https://html5.gamedistribution.com/196df99b32324438b39a4dcf18f0f838/?gd_sdk_referrer_url=https://www.miniplaygame.online/games/cat-mini-restaurant",
    thumbnail: "/images/game-thumbnails/stone-grass-mowing-simulator_16x9-cover.jpg",
    category: "casual",
    tags: ["simulation", "restaurant", "management", "cute", "cats"],
    isNew: true,
    publishDate: "2025-01-20",
    lastUpdated: "2025-01-21",
    instructions: "Use your mouse to click and interact with various objects, ingredients, and cat employees in your restaurant. Manage your kitchen, take customer orders, cook delicious meals, and expand your restaurant empire with the help of adorable cat staff!"
  },
  "br-br-patapim-obby-challenge": {
    id: "br-br-patapim-obby-challenge",
    title: "Br Br Patapim: Obby Challenge",
    description: "Br Br Patapim: Obby Challenge is a wild meme-fueled obby game where you'll jump, fall, and laugh your way through chaos! Inspired by the viral spirit of Italian Brainrot Animals of TikTok trends, this game turns parkour madness into pure comedy. Take control of the legendary Brr Brr Patapim and conquer ridiculous levels full of traps, platforms, and meme-powered surprises.",
    image: "/images/game-thumbnails/br-br-patapim-obby-challenge.jpg",
    embedUrl: "https://html5.gamedistribution.com/c2c539077905410bb2114297cf24255b/?gd_sdk_referrer_url=https://www.miniplaygame.online/games",
    thumbnail: "/images/game-thumbnails/br-br-patapim-obby-challenge.jpg",
    category: "adventure",
    tags: ["Agility","animal","obstacle","parkour","platformer","roblox"],
    isNew: true,
    publishDate: "2025-06-01",
    lastUpdated: "2025-06-01",
    instructions: "Controls: W, A, S, D – Move Spacebar – Jump Shift - Run Mouse – Look Around"
  }
}

// 英雄区游戏数据
const heroGamesData = [
  "count-masters-stickman-games",
  "stone-grass-mowing-simulator", 
  "ragdoll-archers"
]

/**
 * 清空现有数据（可选）
 */
async function clearExistingData() {
  console.log('🧹 清空现有数据...')
  
  try {
    // 清空英雄区游戏
    await supabase.from('hero_games').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // 清空游戏标签
    await supabase.from('game_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // 清空游戏数据
    await supabase.from('games').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    console.log('✅ 现有数据清空完成')
  } catch (error) {
    console.error('❌ 清空数据时出错:', error.message)
    throw error
  }
}

/**
 * 插入游戏数据
 */
async function insertGames() {
  console.log('📥 开始插入游戏数据...')
  
  const gamesList = Object.values(gamesData)
  console.log(`📊 准备插入 ${gamesList.length} 个游戏`)
  
  for (let i = 0; i < gamesList.length; i++) {
    const game = gamesList[i]
    console.log(`🎮 插入游戏 ${i + 1}/${gamesList.length}: ${game.title}`)
    
    try {
      // 插入游戏主数据
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          game_id: game.id,
          title: game.title,
          description: game.description,
          embed_url: game.embedUrl,
          image_url: game.image,
          thumbnail_url: game.thumbnail,
          category: game.category,
          is_new: game.isNew || false,
          is_hot: game.isHot || false,
          is_original: game.isOriginal || false,
          instructions: game.instructions,
          publish_date: game.publishDate ? new Date(game.publishDate).toISOString() : null,
          last_updated: game.lastUpdated ? new Date(game.lastUpdated).toISOString() : null
        })
      
      if (gameError) {
        console.error(`❌ 插入游戏 ${game.title} 失败:`, gameError.message)
        continue
      }
      
      // 插入游戏标签
      if (game.tags && game.tags.length > 0) {
        const tagInserts = game.tags.map(tag => ({
          game_id: game.id,
          tag: tag
        }))
        
        const { error: tagError } = await supabase
          .from('game_tags')
          .insert(tagInserts)
        
        if (tagError) {
          console.error(`❌ 插入游戏 ${game.title} 的标签失败:`, tagError.message)
        } else {
          console.log(`  ✅ 插入了 ${game.tags.length} 个标签`)
        }
      }
      
      console.log(`  ✅ 游戏 ${game.title} 插入成功`)
      
    } catch (error) {
      console.error(`❌ 处理游戏 ${game.title} 时出错:`, error.message)
    }
  }
  
  console.log('✅ 游戏数据插入完成')
}

/**
 * 插入英雄区游戏配置
 */
async function insertHeroGames() {
  console.log('🦸 开始插入英雄区游戏配置...')
  
  for (let i = 0; i < heroGamesData.length; i++) {
    const gameId = heroGamesData[i]
    console.log(`🌟 配置英雄区游戏 ${i + 1}/${heroGamesData.length}: ${gameId}`)
    
    try {
      const { error } = await supabase
        .from('hero_games')
        .insert({
          game_id: gameId,
          display_order: i + 1,
          is_active: true
        })
      
      if (error) {
        console.error(`❌ 插入英雄区游戏 ${gameId} 失败:`, error.message)
      } else {
        console.log(`  ✅ 英雄区游戏 ${gameId} 配置成功`)
      }
    } catch (error) {
      console.error(`❌ 处理英雄区游戏 ${gameId} 时出错:`, error.message)
    }
  }
  
  console.log('✅ 英雄区游戏配置完成')
}

/**
 * 验证数据迁移结果
 */
async function validateMigration() {
  console.log('🔍 验证数据迁移结果...')
  
  try {
    // 检查游戏数量
    const { count: gamesCount, error: gamesError } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
    
    if (gamesError) {
      console.error('❌ 查询游戏数量失败:', gamesError.message)
    } else {
      console.log(`📊 游戏数量: ${gamesCount}`)
    }
    
    // 检查标签数量
    const { count: tagsCount, error: tagsError } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
    
    if (tagsError) {
      console.error('❌ 查询标签数量失败:', tagsError.message)
    } else {
      console.log(`🏷️ 标签数量: ${tagsCount}`)
    }
    
    // 检查英雄区游戏数量
    const { count: heroCount, error: heroError } = await supabase
      .from('hero_games')
      .select('*', { count: 'exact', head: true })
    
    if (heroError) {
      console.error('❌ 查询英雄区游戏数量失败:', heroError.message)
    } else {
      console.log(`🌟 英雄区游戏数量: ${heroCount}`)
    }
    
    // 检查分类数量
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
    
    if (categoriesError) {
      console.error('❌ 查询分类数量失败:', categoriesError.message)
    } else {
      console.log(`📂 分类数量: ${categoriesCount}`)
    }
    
    console.log('✅ 数据验证完成')
    
  } catch (error) {
    console.error('❌ 验证数据时出错:', error.message)
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始数据迁移...')
    console.log(`📡 连接到: ${supabaseUrl}`)
    
    // 询问是否清空现有数据
    const shouldClear = process.argv.includes('--clear')
    if (shouldClear) {
      await clearExistingData()
    }
    
    // 执行数据迁移
    await insertGames()
    await insertHeroGames()
    
    // 验证迁移结果
    await validateMigration()
    
    console.log('🎉 数据迁移完成!')
    console.log('📋 下一步: 更新代码以使用数据库查询')
    
  } catch (error) {
    console.error('❌ 数据迁移失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
} 