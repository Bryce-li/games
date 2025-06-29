#!/usr/bin/env node

/**
 * Excel游戏数据导入脚本
 * 将Excel文件中的游戏数据导入到数据库
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：请确保在.env.local文件中设置了Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Excel文件路径
const excelFilePath = path.join(__dirname, '../src/lib/游戏数据gamedistribution.com.xlsx');

// 预设的游戏分类
const validCategories = [
  'action', 'adventure', 'casual', 'puzzle', 'sports', 'shooting', 
  'basketball', 'beauty', 'bike', 'car', 'card', 'clicker', 
  'controller', 'dressUp', 'driving', 'escape', 'flash', 'fps', 
  'horror', 'io', 'mahjong', 'minecraft', 'pool', 'soccer', 
  'stickman', 'towerDefense'
];

/**
 * 字段映射配置 - 根据分析结果调整
 */
const fieldMapping = {
  0: 'title',           // 游戏名
  1: 'embed_url',       // embed
  2: 'category',        // 分类
  3: 'tags',           // 标签
  4: 'image_url',      // 图片地址
  5: 'thumbnail_url',  // 缩略图地址
  6: 'description',    // 描述
  7: 'instructions',   // 说明
  8: 'publish_date',   // 发布时间
  9: 'last_updated',   // 更新时间
  // 跳过列索引 10, 11, 12 (加入时间、游戏链接、是否更新)
};

/**
 * 读取Excel数据
 */
function readExcelData() {
  try {
    console.log('📖 读取Excel文件...');
    
    if (!fs.existsSync(excelFilePath)) {
      throw new Error('Excel文件不存在');
    }
    
    const workbook = XLSX.readFile(excelFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // 移除表头行
    const dataRows = rawData.slice(1);
    
    console.log(`✅ 成功读取 ${dataRows.length} 行游戏数据`);
    return dataRows;
    
  } catch (error) {
    console.error('❌ 读取Excel文件失败:', error.message);
    throw error;
  }
}

/**
 * 转换中文日期格式为ISO格式
 */
function convertChineseDate(chineseDate) {
  if (!chineseDate || typeof chineseDate !== 'string') {
    return null;
  }
  
  try {
    // 匹配格式: "2025年06月27日 15:22:46"
    const match = chineseDate.match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [_, year, month, day, hour, minute, second] = match;
      const isoDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      return isoDate.toISOString();
    }
    
    // 如果无法解析，返回null
    return null;
  } catch (error) {
    console.warn(`⚠️ 无法解析日期: ${chineseDate}`);
    return null;
  }
}

/**
 * 验证分类是否有效
 */
function validateCategory(category) {
  if (!category || typeof category !== 'string') {
    return 'casual'; // 默认分类
  }
  
  const normalizedCategory = category.toLowerCase().trim();
  
  // 检查是否在预设分类中
  if (validCategories.includes(normalizedCategory)) {
    return normalizedCategory;
  }
  
  // 尝试模糊匹配
  for (const validCat of validCategories) {
    if (normalizedCategory.includes(validCat) || validCat.includes(normalizedCategory)) {
      console.log(`🔄 分类映射: "${category}" -> "${validCat}"`);
      return validCat;
    }
  }
  
  console.warn(`⚠️ 未知分类: "${category}"，使用默认分类: casual`);
  return 'casual';
}

/**
 * 解析标签字符串
 */
function parseTags(tagsString) {
  if (!tagsString || typeof tagsString !== 'string') {
    return [];
  }
  
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && tag.length <= 50); // 过滤空标签和过长标签
}

/**
 * 转换单行数据为数据库格式
 */
function transformRowToGameData(row, rowIndex) {
  try {
    const gameData = {};
    
    // 处理基本字段
    for (const [colIndex, fieldName] of Object.entries(fieldMapping)) {
      const cellValue = row[parseInt(colIndex)];
      
      switch (fieldName) {
        case 'title':
          gameData.title = cellValue || `Game ${rowIndex + 1}`;
          break;
          
        case 'embed_url':
          if (!cellValue || typeof cellValue !== 'string' || !cellValue.startsWith('http')) {
            console.warn(`⚠️ 第${rowIndex + 1}行: 无效的嵌入URL`);
            return null; // 跳过没有有效URL的游戏
          }
          gameData.embed_url = cellValue;
          break;
          
        case 'category':
          gameData.category = validateCategory(cellValue);
          break;
          
        case 'tags':
          gameData.parsedTags = parseTags(cellValue);
          break;
          
        case 'image_url':
        case 'thumbnail_url':
          if (cellValue && typeof cellValue === 'string' && cellValue.startsWith('http')) {
            gameData[fieldName] = cellValue;
          }
          break;
          
        case 'description':
        case 'instructions':
          gameData[fieldName] = cellValue || '';
          break;
          
        case 'publish_date':
        case 'last_updated':
          gameData[fieldName] = convertChineseDate(cellValue);
          break;
      }
    }
    
    // 验证必填字段
    if (!gameData.title || !gameData.embed_url) {
      console.warn(`⚠️ 第${rowIndex + 1}行: 缺少必填字段，跳过`);
      return null;
    }
    
    return gameData;
    
  } catch (error) {
    console.error(`❌ 第${rowIndex + 1}行数据转换失败:`, error.message);
    return null;
  }
}

/**
 * 批量导入游戏数据
 */
async function importGamesData(gamesData) {
  console.log('\n📥 开始导入游戏数据到数据库...');
  
  const batchSize = 50; // 每批处理50条记录
  const totalBatches = Math.ceil(gamesData.length / batchSize);
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, gamesData.length);
    const batch = gamesData.slice(start, end);
    
    console.log(`🔄 处理第 ${i + 1}/${totalBatches} 批 (${start + 1}-${end})`);
    
    try {
      // 准备批量插入数据（移除tags字段）
      const batchToInsert = batch.map(game => {
        const { parsedTags, ...gameWithoutTags } = game;
        return gameWithoutTags;
      });
      
      // 批量插入到games表
      const { data: insertedGames, error: gamesError } = await supabase
        .from('games')
        .insert(batchToInsert)
        .select('id, title');
      
      if (gamesError) {
        console.error(`❌ 第${i + 1}批games数据插入失败:`, gamesError.message);
        errorCount += batch.length;
        continue;
      }
      
      console.log(`✅ 第${i + 1}批games数据插入成功: ${insertedGames.length} 条`);
      successCount += insertedGames.length;
      
      // 处理标签数据
      const tagsToInsert = [];
      insertedGames.forEach((game, index) => {
        const originalGame = batch[index];
        if (originalGame.parsedTags && originalGame.parsedTags.length > 0) {
          originalGame.parsedTags.forEach(tag => {
            tagsToInsert.push({
              game_id: game.id,
              tag: tag
            });
          });
        }
      });
      
      // 插入标签数据
      if (tagsToInsert.length > 0) {
        const { error: tagsError } = await supabase
          .from('game_tags')
          .insert(tagsToInsert);
        
        if (tagsError) {
          console.warn(`⚠️ 第${i + 1}批标签数据插入失败:`, tagsError.message);
        } else {
          console.log(`✅ 第${i + 1}批标签数据插入成功: ${tagsToInsert.length} 条`);
        }
      }
      
    } catch (error) {
      console.error(`❌ 第${i + 1}批数据处理失败:`, error.message);
      errorCount += batch.length;
    }
  }
  
  return { successCount, errorCount };
}

/**
 * 验证导入结果
 */
async function verifyImportResults() {
  console.log('\n🔍 验证导入结果...');
  
  try {
    // 检查games表记录数
    const { count: gamesCount, error: gamesCountError } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true });
    
    if (gamesCountError) {
      console.error('❌ 无法获取games表记录数:', gamesCountError.message);
    } else {
      console.log(`📊 games表总记录数: ${gamesCount}`);
    }
    
    // 检查game_tags表记录数
    const { count: tagsCount, error: tagsCountError } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true });
    
    if (tagsCountError) {
      console.error('❌ 无法获取game_tags表记录数:', tagsCountError.message);
    } else {
      console.log(`🏷️ game_tags表总记录数: ${tagsCount}`);
    }
    
    // 检查分类分布
    const { data: categoryStats, error: categoryError } = await supabase
      .from('games')
      .select('category')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const stats = {};
        data.forEach(game => {
          stats[game.category] = (stats[game.category] || 0) + 1;
        });
        
        return { data: stats, error: null };
      });
    
    if (categoryError) {
      console.error('❌ 无法获取分类统计:', categoryError.message);
    } else {
      console.log('📈 分类分布:');
      Object.entries(categoryStats || {}).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} 个游戏`);
      });
    }
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始Excel游戏数据导入流程...\n');
    
    // 1. 读取Excel数据
    const rawData = readExcelData();
    
    // 2. 数据转换和清洗
    console.log('\n🔄 转换和清洗数据...');
    const gamesData = [];
    let skippedCount = 0;
    
    for (let i = 0; i < rawData.length; i++) {
      const transformedGame = transformRowToGameData(rawData[i], i);
      if (transformedGame) {
        gamesData.push(transformedGame);
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ 成功转换 ${gamesData.length} 条游戏数据`);
    console.log(`⚠️ 跳过 ${skippedCount} 条无效数据`);
    
    if (gamesData.length === 0) {
      console.error('❌ 没有有效数据可以导入');
      process.exit(1);
    }
    
    // 3. 导入数据库
    const { successCount, errorCount } = await importGamesData(gamesData);
    
    // 4. 验证结果
    await verifyImportResults();
    
    // 5. 总结报告
    console.log('\n📋 ===== 导入完成报告 =====');
    console.log(`✅ 成功导入: ${successCount} 个游戏`);
    console.log(`❌ 导入失败: ${errorCount} 个游戏`);
    console.log(`📊 成功率: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
      console.log('\n🎉 数据导入完成！您的游戏网站现在拥有丰富的游戏内容了！');
      console.log('💡 建议下一步：');
      console.log('   1. 检查网站前端显示效果');
      console.log('   2. 配置hero_games表设置英雄区游戏');
      console.log('   3. 调整categories表的主页显示设置');
    }
    
  } catch (error) {
    console.error('❌ 导入过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  readExcelData,
  transformRowToGameData,
  importGamesData,
  verifyImportResults
}; 