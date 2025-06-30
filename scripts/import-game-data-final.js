/**
 * 最终游戏数据导入脚本
 * 整合了所有成功的导入逻辑，支持完整的游戏、分类、标签数据导入
 * 
 * 功能特性：
 * - 智能语义分类映射
 * - 多值分类和标签处理
 * - 冲突处理和去重
 * - 批量导入优化
 * - 详细进度和错误报告
 * - 数据验证和统计
 */

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 标签类型枚举
const TAG_TYPES = {
  CATEGORY: 1,  // 分类
  TAG: 2        // 标签
};

// 智能语义分类映射规则
const CATEGORY_MAPPING = {
  // 完全匹配映射
  'casual': 'casual',
  'puzzle': 'puzzle', 
  'adventure': 'adventure',
  'action': 'action',
  'sports': 'sports',
  'driving': 'driving',
  'shooting': 'shooting',
  'strategy': 'strategy',
  'simulation': 'simulation',
  'arcade': 'arcade',
  
  // 语义相似性映射
  'agility': 'action',
  'battle': 'action', 
  'educational': 'action',
  'care': 'action',
  'bubble shooter': 'action',
  'jigsaw': 'puzzle',
  'quiz': 'puzzle',
  'match-3': 'match3',
  'match3': 'match3',
  'mahjong': 'mahjong',
  'cards': 'card',
  'dress-up': 'dressUp',
  'football': 'soccer',
  'soccer': 'soccer',
  'racing': 'driving',
  'car': 'driving',
  'shooter': 'shooting',
  'gun': 'shooting',
  'war': 'shooting',
  'tower defense': 'strategy',
  'td': 'strategy',
  'tycoon': 'simulation',
  'cooking': 'simulation',
  'management': 'simulation',
  'idle': 'simulation',
  'clicker': 'simulation',
  
  // 特殊字符处理
  'racing & driving': 'driving',
  'mahjong & connect': 'mahjong',
  '.io': 'io',
  'io': 'io',
  
  // 新增分类
  'merge': 'merge',
  'art': 'art',
  'boardgames': 'boardgames',
  'music': 'music',
  'platformer': 'platformer',
  'rpg': 'rpg',
  'fighting': 'fighting',
  'horror': 'horror'
};

/**
 * 智能分类映射函数
 * @param {string} originalCategory - 原始分类名
 * @returns {string} - 映射后的分类名
 */
function mapCategory(originalCategory) {
  if (!originalCategory) return null;
  
  const normalized = originalCategory.toLowerCase().trim();
  
  // 直接匹配
  if (CATEGORY_MAPPING[normalized]) {
    return CATEGORY_MAPPING[normalized];
  }
  
  // 包含匹配
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // 清理特殊字符后返回
  return normalized.replace(/[^\w]/g, '').toLowerCase();
}

/**
 * 清理标签函数
 * @param {string} tag - 原始标签
 * @returns {string} - 清理后的标签
 */
function cleanTag(tag) {
  if (!tag) return null;
  return tag.replace(/[^\w\s\-]/g, '').trim().toLowerCase();
}

/**
 * 读取Excel文件数据
 */
async function readExcelData() {
  try {
    const excelPath = path.join(__dirname, '..', 'src', 'lib', '游戏数据gamedistribution.com.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Excel文件读取成功: ${jsonData.length - 1} 行数据`);
    return jsonData;
  } catch (error) {
    throw new Error(`Excel文件读取失败: ${error.message}`);
  }
}

/**
 * 检查和创建分类
 */
async function ensureCategories(categoryNames) {
  const uniqueCategories = [...new Set(categoryNames.filter(name => name))];
  console.log(`📂 需要确保的分类: ${uniqueCategories.length} 个`);
  
  // 获取现有分类
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('category_key');
  
  const existingCategoryNames = new Set(
    existingCategories?.map(cat => cat.category_key) || []
  );
  
  // 找出需要创建的新分类
  const newCategories = uniqueCategories.filter(name => 
    !existingCategoryNames.has(name)
  );
  
  if (newCategories.length > 0) {
    console.log(`🆕 创建新分类: ${newCategories.join(', ')}`);
    
    const categoriesData = newCategories.map(name => ({
      category_key: name,
      category_title: name.charAt(0).toUpperCase() + name.slice(1),
      show_on_homepage: false,
      display_order: 999
    }));
    
    const { error } = await supabase
      .from('categories')
      .insert(categoriesData);
    
    if (error) {
      console.warn(`⚠️  部分分类创建失败: ${error.message}`);
    }
  }
}

/**
 * 导入游戏数据
 */
async function importGames(jsonData) {
  console.log('\n🎮 开始导入游戏数据...');
  
  const games = [];
  let processedCount = 0;
  let skippedCount = 0;
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length < 14) {
      skippedCount++;
      continue;
    }
    
          const gameData = {
        game_id: row[1]?.toString().trim(),
        title: row[2]?.toString().trim(),
        description: row[5]?.toString().trim() || '',
        thumbnail_url: row[6]?.toString().trim() || '',
        embed_url: row[7]?.toString().trim() || '',
        instructions: row[10]?.toString().trim() || '',
      
              // 处理发布日期
        publish_date: (() => {
          const dateValue = row[11];
          if (!dateValue) return new Date().toISOString();
          
          if (typeof dateValue === 'number') {
            // Excel日期序列号转换
            const excelEpoch = new Date(1900, 0, 1);
            const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
            return date.toISOString();
          }
          
          if (typeof dateValue === 'string') {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
          }
          
          return new Date().toISOString();
        })()
    };
    
          if (gameData.game_id && gameData.title) {
      games.push(gameData);
      processedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log(`📊 游戏数据处理完成: ${processedCount} 个有效, ${skippedCount} 个跳过`);
  
  // 批量导入游戏
  if (games.length > 0) {
    console.log('🚀 批量导入游戏到数据库...');
    
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('games')
          .upsert(batch, { 
            onConflict: 'game_id',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.log(`⚠️  批次 ${Math.floor(i/batchSize) + 1} 部分失败: ${error.message}`);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      } catch (err) {
        console.log(`❌ 批次 ${Math.floor(i/batchSize) + 1} 异常: ${err.message}`);
        errorCount += batch.length;
      }
      
      // 进度显示
      if ((i + batchSize) % 100 === 0 || i + batchSize >= games.length) {
        console.log(`   📊 进度: ${Math.min(i + batchSize, games.length)}/${games.length}`);
      }
    }
    
    console.log(`✅ 游戏导入完成: 成功 ${successCount}, 失败 ${errorCount}`);
  }
  
  return games;
}

/**
 * 导入分类和标签数据
 */
async function importCategoriesAndTags(jsonData) {
  console.log('\n🏷️  开始导入分类和标签数据...');
  
  // 收集所有分类和标签
  const allCategories = new Set();
  const recordsToInsert = [];
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length < 14) continue;
    
    const gameId = row[1]?.toString().trim();
    const categoriesString = row[3]?.toString().trim();
    const tagsString = row[4]?.toString().trim();
    
    if (!gameId) continue;
    
    // 处理分类
    if (categoriesString) {
      const categories = categoriesString.split(',').map(cat => cat.trim()).filter(cat => cat);
      
      for (const originalCategory of categories) {
        const mappedCategory = mapCategory(originalCategory);
        if (mappedCategory) {
          allCategories.add(mappedCategory);
          recordsToInsert.push({
            game_id: gameId,
            tag: mappedCategory,
            tag_type: TAG_TYPES.CATEGORY
          });
        }
      }
    }
    
    // 处理标签
    if (tagsString) {
      const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      for (const tag of tags) {
        const cleanedTag = cleanTag(tag);
        if (cleanedTag) {
          recordsToInsert.push({
            game_id: gameId,
            tag: cleanedTag,
            tag_type: TAG_TYPES.TAG
          });
        }
      }
    }
  }
  
  // 确保分类存在
  await ensureCategories(Array.from(allCategories));
  
  // 去重处理
  const uniqueRecords = [];
  const seenKeys = new Set();
  
  for (const record of recordsToInsert) {
    const key = `${record.game_id}|${record.tag}|${record.tag_type}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueRecords.push(record);
    }
  }
  
  console.log(`📊 标签数据统计:`);
  console.log(`  原始记录: ${recordsToInsert.length}`);
  console.log(`  去重后: ${uniqueRecords.length}`);
  console.log(`  分类记录: ${uniqueRecords.filter(r => r.tag_type === TAG_TYPES.CATEGORY).length}`);
  console.log(`  标签记录: ${uniqueRecords.filter(r => r.tag_type === TAG_TYPES.TAG).length}`);
  
  // 批量导入标签数据
  if (uniqueRecords.length > 0) {
    console.log('\n🚀 批量导入分类和标签...');
    
    const batchSize = 50;
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < uniqueRecords.length; i += batchSize) {
      const batch = uniqueRecords.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(uniqueRecords.length / batchSize);
      
      try {
        const { data, error } = await supabase
          .from('game_tags')
          .insert(batch);
        
        if (error) {
          // 如果批量插入失败，尝试逐条插入
          for (const record of batch) {
            try {
              const { error: singleError } = await supabase
                .from('game_tags')
                .insert([record]);
              
              if (singleError) {
                if (singleError.message.includes('duplicate') || singleError.message.includes('unique')) {
                  duplicateCount++;
                } else {
                  errorCount++;
                }
              } else {
                successCount++;
              }
            } catch (singleErr) {
              errorCount++;
            }
          }
        } else {
          successCount += batch.length;
        }
      } catch (batchError) {
        errorCount += batch.length;
      }
      
      // 进度显示
      if (batchNumber % 10 === 0 || batchNumber === totalBatches) {
        console.log(`   📊 批次进度: ${batchNumber}/${totalBatches} | 成功: ${successCount} | 重复: ${duplicateCount} | 错误: ${errorCount}`);
      }
      
      // 控制请求频率
      if (i + batchSize < uniqueRecords.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ 分类标签导入完成:`);
    console.log(`  ✅ 成功插入: ${successCount}`);
    console.log(`  🔄 重复跳过: ${duplicateCount}`);
    console.log(`  ❌ 插入失败: ${errorCount}`);
    console.log(`  📈 成功率: ${((successCount + duplicateCount) / uniqueRecords.length * 100).toFixed(2)}%`);
  }
  
  return uniqueRecords;
}

/**
 * 验证导入结果
 */
async function validateImportResults() {
  console.log('\n🔍 验证导入结果...');
  
  try {
    // 检查游戏数量
    const { count: gamesCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true });
    
    // 检查分类数量
    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    // 检查标签总数
    const { count: totalTagsCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true });
    
    // 检查分类标签数
    const { count: categoryTagsCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_type', TAG_TYPES.CATEGORY);
    
    // 检查普通标签数
    const { count: normalTagsCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_type', TAG_TYPES.TAG);
    
    // 检查有标签的游戏数量
    const { data: gamesWithTags } = await supabase
      .from('game_tags')
      .select('game_id')
      .neq('game_id', null);
    
    const uniqueGamesWithTags = new Set(gamesWithTags?.map(g => g.game_id) || []).size;
    
    console.log('📊 导入结果统计:');
    console.log(`  🎮 游戏总数: ${gamesCount}`);
    console.log(`  📂 分类总数: ${categoriesCount}`);
    console.log(`  🏷️  标签记录总数: ${totalTagsCount}`);
    console.log(`    └── 分类标签: ${categoryTagsCount}`);
    console.log(`    └── 普通标签: ${normalTagsCount}`);
    console.log(`  📈 有标签的游戏: ${uniqueGamesWithTags}/${gamesCount} (${((uniqueGamesWithTags/gamesCount)*100).toFixed(1)}%)`);
    
    // 检查热门分类
    const { data: topCategories } = await supabase
      .from('game_tags')
      .select('tag')
      .eq('tag_type', TAG_TYPES.CATEGORY);
    
    const categoryCounts = {};
    topCategories?.forEach(item => {
      categoryCounts[item.tag] = (categoryCounts[item.tag] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    console.log('\n🏆 热门分类TOP5:');
    sortedCategories.forEach(([category, count], index) => {
      console.log(`  ${index + 1}. ${category}: ${count}个游戏`);
    });
    
    return {
      gamesCount,
      categoriesCount,
      totalTagsCount,
      categoryTagsCount,
      normalTagsCount,
      uniqueGamesWithTags,
      coverage: ((uniqueGamesWithTags/gamesCount)*100).toFixed(1)
    };
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    return null;
  }
}

/**
 * 主导入函数
 */
async function importGameDataFinal() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 开始游戏数据最终导入...\n');
    console.log('=' .repeat(60));
    
    // 1. 读取Excel数据
    const jsonData = await readExcelData();
    
    // 2. 导入游戏数据
    const games = await importGames(jsonData);
    
    // 3. 导入分类和标签
    const tags = await importCategoriesAndTags(jsonData);
    
    // 4. 验证结果
    const results = await validateImportResults();
    
    // 5. 最终总结
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 游戏数据导入完成！');
    console.log(`⏱️  总耗时: ${duration} 秒`);
    
    if (results) {
      console.log(`📊 最终统计:`);
      console.log(`  🎮 游戏: ${results.gamesCount} 个`);
      console.log(`  📂 分类: ${results.categoriesCount} 个`);
      console.log(`  🏷️  标签: ${results.totalTagsCount} 条`);
      console.log(`  📈 数据覆盖率: ${results.coverage}%`);
      
      if (results.coverage >= 95) {
        console.log('🌟 优秀！数据覆盖率超过95%');
      } else if (results.coverage >= 90) {
        console.log('✅ 良好！数据覆盖率超过90%');
      }
    }
    
    console.log('\n✨ 导入任务圆满完成！');
    
  } catch (error) {
    console.error('💥 导入失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行导入
if (require.main === module) {
  importGameDataFinal();
}

module.exports = {
  importGameDataFinal,
  mapCategory,
  cleanTag,
  TAG_TYPES
}; 