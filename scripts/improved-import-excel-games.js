#!/usr/bin/env node

/**
 * 改进的Excel游戏数据导入脚本
 * 包含智能分类映射、游戏ID生成、日期格式转换等功能
 */

const XLSX = require('xlsx')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// 从环境变量读取Supabase配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：请确保在.env.local文件中设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Excel文件路径
const EXCEL_FILE_PATH = path.join(__dirname, '../src/lib/游戏数据gamedistribution.com.xlsx')

// 字段映射配置（基于Excel列索引，已更新为新的14列结构）
const fieldMapping = {
  0: 'title',          // 游戏名
  1: 'game_id',        // 游戏id（新增列）
  2: 'embed_url',      // embed
  3: 'category',       // 分类  
  4: 'tags',           // 标签
  5: 'image_url',      // 图片地址
  6: 'thumbnail_url',  // 缩略图地址
  7: 'description',    // 描述
  8: 'instructions',   // 说明
  9: 'publish_date',   // 发布时间
  10: 'last_updated'   // 更新时间
  // 跳过：11-加入时间, 12-游戏链接, 13-是否更新
}

// 现有分类列表（从数据库获取）
let existingCategories = []

/**
 * 获取现有分类数据
 */
async function loadExistingCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('category_key, category_title')
      .order('category_key')
    
    if (error) {
      console.error('❌ 获取分类失败:', error.message)
      return false
    }
    
    existingCategories = data
    console.log(`✅ 已加载 ${existingCategories.length} 个现有分类`)
    return true
  } catch (error) {
    console.error('❌ 加载分类时出错:', error.message)
    return false
  }
}

/**
 * 生成游戏ID - 基于游戏标题创建URL友好的唯一标识符
 */
function generateGameId(title, index) {
  // 移除特殊字符，转换为小写，用连字符连接
  let gameId = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符合并为一个
    .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
  
  // 如果处理后为空，使用默认格式
  if (!gameId) {
    gameId = `game-${index + 1}`
  }
  
  // 限制长度并确保唯一性
  gameId = gameId.substring(0, 50)
  
  return gameId
}

/**
 * Excel数字日期转换为JavaScript日期
 * Excel日期是从1900年1月1日开始的天数
 */
function convertExcelDate(excelDate) {
  if (!excelDate || typeof excelDate !== 'number') {
    return null
  }
  
  try {
    // Excel日期基数：1900年1月1日（需要减去1，因为Excel错误地认为1900年是闰年）
    const excelEpoch = new Date(1900, 0, 1)
    const days = Math.floor(excelDate) - 2 // 减去2天修正Excel的错误
    const resultDate = new Date(excelEpoch.getTime() + (days * 24 * 60 * 60 * 1000))
    
    // 验证日期是否合理（2000-2030年之间）
    const year = resultDate.getFullYear()
    if (year >= 2000 && year <= 2030) {
      return resultDate.toISOString()
    }
    
    return null
  } catch (error) {
    console.warn(`⚠️ 日期转换失败: ${excelDate}`)
    return null
  }
}

/**
 * 智能分类映射 - 基于语义相似性，不基于字形相似性
 */
function mapCategoryIntelligently(originalCategory) {
  if (!originalCategory || typeof originalCategory !== 'string') {
    return 'casual'
  }
  
  const category = originalCategory.toLowerCase().trim()
  
  // 精确匹配
  const exactMatch = existingCategories.find(cat => 
    cat.category_key.toLowerCase() === category ||
    cat.category_title.toLowerCase() === category.toLowerCase()
  )
  if (exactMatch) {
    return exactMatch.category_key
  }
  
  // 语义映射规则（只基于意思相似性）
  const semanticMappings = {
    // 动作类游戏
    'agility': 'action',        // 敏捷 → 动作
    'battle': 'action',         // 战斗 → 动作
    'shooter': 'shooting',      // 射击 → 射击游戏
    'fighting': 'action',       // 格斗 → 动作
    
    // 休闲类游戏
    'merge': 'casual',          // 合并 → 休闲
    'match-3': 'puzzle',        // 三消 → 解谜
    'bubble shooter': 'puzzle', // 泡泡射击 → 解谜
    'jigsaw': 'puzzle',         // 拼图 → 解谜
    
    // 运动类游戏
    'football': 'soccer',       // 足球 → 足球游戏
    
    // 卡牌/麻将类游戏
    'mahjong & connect': 'mahjong',  // 麻将连接 → 麻将游戏
    'cards': 'card',            // 卡牌 → 卡牌游戏
    'boardgames': 'card',       // 桌游 → 卡牌游戏
    
    // 驾驶类游戏
    'racing & driving': 'driving',   // 赛车驾驶 → 驾驶游戏
    
    // 装扮类游戏
    'dress-up': 'dressUp',      // 装扮 → 装扮游戏
    'care': 'beauty',           // 护理 → 美容游戏
    
    // 教育/模拟类游戏
    'educational': 'puzzle',    // 教育 → 解谜
    'simulation': 'casual',     // 模拟 → 休闲
    'strategy': 'puzzle',       // 策略 → 解谜
    'quiz': 'puzzle',           // 问答 → 解谜
    'art': 'casual',            // 艺术 → 休闲
    
    // IO类游戏
    '.io': 'io'                 // .IO → IO游戏
  }
  
  // 查找语义映射
  const semanticMatch = semanticMappings[category]
  if (semanticMatch) {
    console.log(`🔄 智能分类映射: "${originalCategory}" -> "${semanticMatch}"`)
    return semanticMatch
  }
  
  // 如果没有找到匹配，使用默认分类
  console.warn(`⚠️ 未知分类: "${originalCategory}"，使用默认分类: casual`)
  return 'casual'
}

/**
 * 智能标签映射 - 将标签映射到现有分类或保持原样
 */
function mapTagsIntelligently(tagsString) {
  if (!tagsString || typeof tagsString !== 'string') {
    return []
  }
  
  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  const mappedTags = []
  
  for (const tag of tags) {
    // 先尝试映射到现有分类
    const mappedCategory = mapCategoryIntelligently(tag)
    
    // 如果映射结果不是默认的casual，说明找到了匹配的分类
    if (mappedCategory !== 'casual' || tag.toLowerCase() === 'casual') {
      mappedTags.push(mappedCategory)
    } else {
      // 保持原标签，但转换为小写并清理
      const cleanTag = tag.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
      if (cleanTag) {
        mappedTags.push(cleanTag)
      }
    }
  }
  
  // 去重
  return [...new Set(mappedTags)]
}

/**
 * 读取Excel文件数据
 */
function readExcelData() {
  try {
    console.log('📖 读取Excel文件...')
    
    const workbook = XLSX.readFile(EXCEL_FILE_PATH)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 转换为JSON数组，跳过表头行
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // 移除表头行
    const dataRows = rawData.slice(1)
    
    console.log(`✅ 成功读取 ${dataRows.length} 行游戏数据`)
    return dataRows
  } catch (error) {
    console.error('❌ 读取Excel文件失败:', error.message)
    process.exit(1)
  }
}

/**
 * 转换Excel行数据为游戏数据对象
 */
function transformRowToGameData(row, rowIndex) {
  try {
    const gameData = {}
    
    // 处理基本字段
    for (const [colIndex, fieldName] of Object.entries(fieldMapping)) {
      const cellValue = row[parseInt(colIndex)]
      
      switch (fieldName) {
        case 'title':
          gameData.title = cellValue || `Game ${rowIndex + 1}`
          break
          
        case 'game_id':
          // 使用Excel中的游戏ID，如果为空则自动生成
          gameData.game_id = cellValue || generateGameId(gameData.title || `Game ${rowIndex + 1}`, rowIndex)
          break
          
        case 'embed_url':
          if (!cellValue || typeof cellValue !== 'string' || !cellValue.startsWith('http')) {
            console.warn(`⚠️ 第${rowIndex + 1}行: 无效的嵌入URL`)
            return null
          }
          gameData.embed_url = cellValue
          break
          
        case 'category':
          gameData.category = mapCategoryIntelligently(cellValue)
          break
          
        case 'tags':
          gameData.parsedTags = mapTagsIntelligently(cellValue)
          break
          
        case 'image_url':
        case 'thumbnail_url':
          if (cellValue && typeof cellValue === 'string' && cellValue.startsWith('http')) {
            gameData[fieldName] = cellValue
          }
          break
          
        case 'description':
        case 'instructions':
          gameData[fieldName] = cellValue || ''
          break
          
        case 'publish_date':
        case 'last_updated':
          gameData[fieldName] = convertExcelDate(cellValue)
          break
      }
    }
    
    // 验证必填字段
    if (!gameData.title || !gameData.embed_url || !gameData.game_id) {
      console.warn(`⚠️ 第${rowIndex + 1}行: 缺少必填字段，跳过`)
      return null
    }
    
    return gameData
    
  } catch (error) {
    console.error(`❌ 第${rowIndex + 1}行数据转换失败:`, error.message)
    return null
  }
}

/**
 * 批量导入游戏数据
 */
async function importGamesData(gamesData) {
  console.log('\n📥 开始导入游戏数据到数据库...')
  
  const batchSize = 50
  const totalBatches = Math.ceil(gamesData.length / batchSize)
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize
    const end = Math.min(start + batchSize, gamesData.length)
    const batch = gamesData.slice(start, end)
    
    console.log(`🔄 处理第 ${i + 1}/${totalBatches} 批 (${start + 1}-${end})`)
    
    try {
      // 准备批量插入数据（移除tags字段）
      const batchToInsert = batch.map(game => {
        const { parsedTags, ...gameWithoutTags } = game
        return gameWithoutTags
      })
      
      // 批量插入到games表
      const { data: insertedGames, error: gamesError } = await supabase
        .from('games')
        .insert(batchToInsert)
        .select('game_id, title')
      
      if (gamesError) {
        console.error(`❌ 第${i + 1}批games数据插入失败:`, gamesError.message)
        errorCount += batch.length
        continue
      }
      
      console.log(`✅ 第${i + 1}批games数据插入成功: ${insertedGames.length} 条`)
      successCount += insertedGames.length
      
      // 处理标签数据
      const tagsToInsert = []
      insertedGames.forEach((game, index) => {
        const originalGame = batch[index]
        if (originalGame.parsedTags && originalGame.parsedTags.length > 0) {
          originalGame.parsedTags.forEach(tag => {
            tagsToInsert.push({
              game_id: game.game_id, // 使用game_id而不是UUID
              tag: tag
            })
          })
        }
      })
      
      // 插入标签数据
      if (tagsToInsert.length > 0) {
        const { error: tagsError } = await supabase
          .from('game_tags')
          .insert(tagsToInsert)
        
        if (tagsError) {
          console.warn(`⚠️ 第${i + 1}批标签数据插入失败:`, tagsError.message)
        } else {
          console.log(`✅ 第${i + 1}批标签数据插入成功: ${tagsToInsert.length} 条`)
        }
      }
      
    } catch (error) {
      console.error(`❌ 第${i + 1}批数据处理失败:`, error.message)
      errorCount += batch.length
    }
  }
  
  return { successCount, errorCount }
}

/**
 * 验证导入结果
 */
async function verifyImportResults() {
  console.log('\n🔍 验证导入结果...')
  
  try {
    // 检查games表记录数
    const { count: gamesCount, error: gamesCountError } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
    
    if (gamesCountError) {
      console.error('❌ 无法获取games表记录数:', gamesCountError.message)
    } else {
      console.log(`📊 games表总记录数: ${gamesCount}`)
    }
    
    // 检查game_tags表记录数
    const { count: tagsCount, error: tagsCountError } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
    
    if (tagsCountError) {
      console.error('❌ 无法获取game_tags表记录数:', tagsCountError.message)
    } else {
      console.log(`🏷️ game_tags表总记录数: ${tagsCount}`)
    }
    
    // 检查分类分布
    const { data: categoryStats, error: categoryError } = await supabase
      .from('games')
      .select('category')
    
    if (categoryError) {
      console.error('❌ 无法获取分类统计:', categoryError.message)
    } else {
      const stats = {}
      categoryStats.forEach(game => {
        stats[game.category] = (stats[game.category] || 0) + 1
      })
      
      console.log('📈 分类分布:')
      Object.entries(stats).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} 个游戏`)
      })
    }
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message)
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始改进的Excel游戏数据导入流程...\n')
    
    // 1. 加载现有分类
    const categoriesLoaded = await loadExistingCategories()
    if (!categoriesLoaded) {
      console.error('❌ 无法加载分类数据，终止导入')
      process.exit(1)
    }
    
    // 2. 读取Excel数据
    const rawData = readExcelData()
    
    // 3. 数据转换和清洗
    console.log('\n🔄 转换和清洗数据...')
    const gamesData = []
    let skippedCount = 0
    
    for (let i = 0; i < rawData.length; i++) {
      const transformedGame = transformRowToGameData(rawData[i], i)
      if (transformedGame) {
        gamesData.push(transformedGame)
      } else {
        skippedCount++
      }
    }
    
    console.log(`✅ 成功转换 ${gamesData.length} 条游戏数据`)
    console.log(`⚠️ 跳过 ${skippedCount} 条无效数据`)
    
    if (gamesData.length === 0) {
      console.error('❌ 没有有效数据可以导入')
      process.exit(1)
    }
    
    // 4. 导入数据库
    const { successCount, errorCount } = await importGamesData(gamesData)
    
    // 5. 验证结果
    await verifyImportResults()
    
    // 6. 总结报告
    console.log('\n📋 ===== 导入完成报告 =====')
    console.log(`✅ 成功导入: ${successCount} 个游戏`)
    console.log(`❌ 导入失败: ${errorCount} 个游戏`)
    console.log(`📊 成功率: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 数据导入完成！')
      console.log('💡 改进要点：')
      console.log('   ✅ 智能分类映射（基于语义相似性）')
      console.log('   ✅ 自动生成游戏ID')
      console.log('   ✅ Excel日期格式转换')
      console.log('   ✅ 标签映射到现有分类')
    }
    
  } catch (error) {
    console.error('❌ 导入过程出错:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
} 