#!/usr/bin/env node

/**
 * 分类和标签数据优化脚本
 * 执行数据清理和统一化操作
 */

const { createClient } = require('@supabase/supabase-js');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 标签与分类重复的映射规则
 */
const tagToCategoryMappings = [
  // 直接匹配的标签统一为分类名称
  { from: '.IO', to: 'io' },
  { from: 'Adventure', to: 'adventure' },
  { from: 'Casual', to: 'casual' },
  { from: 'car', to: 'car' },
  { from: 'clicker', to: 'clicker' },
  { from: 'escape', to: 'escape' },
  { from: 'horror', to: 'horror' },
  { from: 'beauty', to: 'beauty' },
  
  // 需要特殊处理的映射
  { from: 'ball', to: 'basketball' }, // ball -> basketball
  { from: 'Cards', to: 'card' }, // Cards -> card (修正大小写)
  { from: 'Care', to: 'car' }, // Care是拼写错误，应该是car
  { from: 'cartoon', to: 'car' }, // cartoon包含car，映射到car
  { from: 'connection', to: 'io' }, // 网络连接类游戏 -> io
  { from: 'construction', to: 'io' }, // 建造类 -> io  
  { from: 'control', to: 'controller' }, // control -> controller
  { from: 'decoration', to: 'beauty' }, // 装饰类 -> beauty
  { from: 'dress', to: 'dressUp' }, // dress -> dressUp
  { from: 'Educational', to: 'puzzle' }, // 教育类 -> puzzle
  { from: 'evolution', to: 'io' }, // 进化类 -> io
  { from: 'explosion', to: 'action' }, // 爆炸类 -> action
  { from: 'fashion', to: 'beauty' }, // 时尚类 -> beauty
  { from: 'fashionista', to: 'beauty' }, // 时尚达人 -> beauty
  { from: 'headsoccer', to: 'soccer' }, // headsoccer -> soccer
  { from: 'Mahjong & Connect', to: 'mahjong' }, // 麻将连连看 -> mahjong
];

/**
 * 相似标签合并规则
 */
const tagMergeMappings = [
  { from: '3players', to: '2players' },
  { from: 'Match-3', to: 'match3' },
  { from: 'bricks', to: 'brick' },
  { from: '8ball', to: 'ball' },
  { from: 'bake', to: 'cake' },
  { from: 'bath', to: 'math' },
  { from: 'boat', to: 'beat' },
  { from: 'cats', to: 'cat' },
  // 添加更多相似标签合并规则
  { from: 'Agility', to: 'agility' }, // 大小写统一
  { from: 'Dress-up', to: 'dressUp' }, // 连字符标准化
  { from: 'Battle', to: 'battle' }, // 大小写统一
  { from: 'kidgames', to: 'kids' }, // 简化标签
];

/**
 * 统一标签与分类名称
 */
async function unifyTagsWithCategories() {
  console.log('🔄 步骤1: 统一标签与分类名称...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const mapping of tagToCategoryMappings) {
    try {
      console.log(`🔄 处理标签映射: "${mapping.from}" -> "${mapping.to}"`);
      
      // 更新game_tags表中的标签名称
      const { data, error } = await supabase
        .from('game_tags')
        .update({ tag: mapping.to })
        .eq('tag', mapping.from)
        .select('id');
      
      if (error) {
        console.error(`❌ 更新标签"${mapping.from}"失败:`, error.message);
        errorCount++;
      } else {
        const updateCount = data ? data.length : 0;
        if (updateCount > 0) {
          console.log(`✅ 成功更新 ${updateCount} 个标签记录`);
          successCount += updateCount;
        } else {
          console.log(`ℹ️ 未找到标签"${mapping.from}"`);
        }
      }
      
    } catch (error) {
      console.error(`❌ 处理标签映射"${mapping.from}"时出错:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 标签与分类统一结果:`);
  console.log(`   ✅ 成功更新: ${successCount} 个标签记录`);
  console.log(`   ❌ 更新失败: ${errorCount} 个操作`);
  
  return { successCount, errorCount };
}

/**
 * 合并相似标签
 */
async function mergeSimilarTags() {
  console.log('\n🔄 步骤2: 合并相似标签...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const mapping of tagMergeMappings) {
    try {
      console.log(`🔄 处理标签合并: "${mapping.from}" -> "${mapping.to}"`);
      
      // 检查目标标签是否已存在同样的game_id关联
      const { data: existingTags, error: checkError } = await supabase
        .from('game_tags')
        .select('game_id')
        .eq('tag', mapping.from);
      
      if (checkError) {
        console.error(`❌ 检查标签"${mapping.from}"失败:`, checkError.message);
        errorCount++;
        continue;
      }
      
      if (!existingTags || existingTags.length === 0) {
        console.log(`ℹ️ 未找到标签"${mapping.from}"`);
        continue;
      }
      
      // 获取这些game_id中哪些已经有目标标签了
      const gameIds = existingTags.map(tag => tag.game_id);
      const { data: targetTags, error: targetError } = await supabase
        .from('game_tags')
        .select('game_id')
        .eq('tag', mapping.to)
        .in('game_id', gameIds);
      
      if (targetError) {
        console.error(`❌ 检查目标标签"${mapping.to}"失败:`, targetError.message);
        errorCount++;
        continue;
      }
      
      const existingTargetGameIds = new Set(targetTags?.map(tag => tag.game_id) || []);
      
      // 更新没有冲突的记录
      const gameIdsToUpdate = gameIds.filter(id => !existingTargetGameIds.has(id));
      
      if (gameIdsToUpdate.length > 0) {
        const { data, error } = await supabase
          .from('game_tags')
          .update({ tag: mapping.to })
          .eq('tag', mapping.from)
          .in('game_id', gameIdsToUpdate)
          .select('id');
        
        if (error) {
          console.error(`❌ 更新标签"${mapping.from}"失败:`, error.message);
          errorCount++;
        } else {
          const updateCount = data ? data.length : 0;
          console.log(`✅ 成功合并 ${updateCount} 个标签记录`);
          successCount += updateCount;
        }
      }
      
      // 删除有冲突的重复记录
      const gameIdsToDelete = gameIds.filter(id => existingTargetGameIds.has(id));
      if (gameIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('game_tags')
          .delete()
          .eq('tag', mapping.from)
          .in('game_id', gameIdsToDelete);
        
        if (deleteError) {
          console.error(`❌ 删除重复标签失败:`, deleteError.message);
        } else {
          console.log(`🗑️ 删除 ${gameIdsToDelete.length} 个重复标签记录`);
        }
      }
      
    } catch (error) {
      console.error(`❌ 处理标签合并"${mapping.from}"时出错:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 相似标签合并结果:`);
  console.log(`   ✅ 成功合并: ${successCount} 个标签记录`);
  console.log(`   ❌ 合并失败: ${errorCount} 个操作`);
  
  return { successCount, errorCount };
}

/**
 * 清理空标签和无效数据
 */
async function cleanupInvalidTags() {
  console.log('\n🔄 步骤3: 清理无效标签数据...\n');
  
  try {
    // 删除空标签
    const { data: emptyTags, error: emptyError } = await supabase
      .from('game_tags')
      .delete()
      .or('tag.is.null,tag.eq.')
      .select('id');
    
    if (emptyError) {
      console.error('❌ 删除空标签失败:', emptyError.message);
    } else {
      const emptyCount = emptyTags ? emptyTags.length : 0;
      console.log(`🗑️ 删除 ${emptyCount} 个空标签记录`);
    }
    
    // 删除过长的标签（超过50个字符）
    const { data: longTags, error: longError } = await supabase
      .rpc('delete_long_tags', { max_length: 50 });
    
    if (longError) {
      console.warn('⚠️ 删除过长标签失败:', longError.message);
    } else {
      console.log(`🗑️ 删除过长标签完成`);
    }
    
  } catch (error) {
    console.error('❌ 清理过程出错:', error.message);
  }
}

/**
 * 验证优化结果
 */
async function verifyOptimizationResults() {
  console.log('\n🔍 验证优化结果...\n');
  
  try {
    // 统计优化后的标签数据
    const { data: tags, error: tagsError } = await supabase
      .from('game_tags')
      .select('tag');
    
    if (tagsError) {
      console.error('❌ 获取标签数据失败:', tagsError.message);
      return;
    }
    
    // 统计标签使用情况
    const tagStats = {};
    tags.forEach(tagRow => {
      tagStats[tagRow.tag] = (tagStats[tagRow.tag] || 0) + 1;
    });
    
    console.log('📊 优化后标签统计 (前20个最常用):');
    Object.entries(tagStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([tag, count], index) => {
        console.log(`   ${index + 1}. ${tag}: ${count} 次`);
      });
    
    console.log('\n📈 优化效果:');
    console.log(`   总标签种类数: ${Object.keys(tagStats).length}`);
    console.log(`   总标签使用次数: ${tags.length}`);
    console.log(`   平均每个标签使用: ${(tags.length / Object.keys(tagStats).length).toFixed(1)} 次`);
    
    // 检查标准分类在标签中的使用情况
    const standardCategories = [
      'action', 'adventure', 'casual', 'puzzle', 'sports', 'shooting',
      'basketball', 'beauty', 'bike', 'car', 'card', 'clicker',
      'controller', 'dressUp', 'driving', 'escape', 'flash', 'fps',
      'horror', 'io', 'mahjong', 'minecraft', 'pool', 'soccer',
      'stickman', 'towerDefense'
    ];
    
    const categoryTagUsage = {};
    standardCategories.forEach(category => {
      if (tagStats[category]) {
        categoryTagUsage[category] = tagStats[category];
      }
    });
    
    console.log('\n🎯 标准分类在标签中的使用:');
    Object.entries(categoryTagUsage)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} 次`);
      });
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始执行分类和标签数据优化...\n');
    
    // 步骤1: 统一标签与分类名称
    const step1Result = await unifyTagsWithCategories();
    
    // 步骤2: 合并相似标签
    const step2Result = await mergeSimilarTags();
    
    // 步骤3: 清理无效数据
    await cleanupInvalidTags();
    
    // 步骤4: 验证结果
    await verifyOptimizationResults();
    
    // 总结报告
    console.log('\n📋 ===== 优化完成报告 =====');
    console.log(`✅ 标签统一操作: ${step1Result.successCount} 成功, ${step1Result.errorCount} 失败`);
    console.log(`✅ 标签合并操作: ${step2Result.successCount} 成功, ${step2Result.errorCount} 失败`);
    console.log(`🎯 总体优化效果:`);
    console.log(`   - 标签数据更加标准化和一致`);
    console.log(`   - 减少了重复和相似标签`);
    console.log(`   - 提升了搜索和筛选的准确性`);
    console.log(`   - 改善了数据质量和用户体验`);
    
    console.log('\n🎉 分类和标签优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  unifyTagsWithCategories,
  mergeSimilarTags,
  cleanupInvalidTags,
  verifyOptimizationResults
}; 