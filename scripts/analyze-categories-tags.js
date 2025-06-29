#!/usr/bin/env node

/**
 * 分析分类和标签数据的脚本
 * 找出相似的分类和标签，优化数据一致性
 */

const { createClient } = require('@supabase/supabase-js');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 预设的标准分类
const standardCategories = [
  'action', 'adventure', 'casual', 'puzzle', 'sports', 'shooting',
  'basketball', 'beauty', 'bike', 'car', 'card', 'clicker',
  'controller', 'dressUp', 'driving', 'escape', 'flash', 'fps',
  'horror', 'io', 'mahjong', 'minecraft', 'pool', 'soccer',
  'stickman', 'towerDefense'
];

/**
 * 获取数据库中的分类统计
 */
async function analyzeCategories() {
  console.log('📊 分析数据库中的分类数据...\n');
  
  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('category');
    
    if (error) {
      console.error('❌ 获取游戏分类失败:', error.message);
      return {};
    }
    
    // 统计分类使用情况
    const categoryStats = {};
    games.forEach(game => {
      categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
    });
    
    console.log('🎯 当前数据库中的分类统计:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        const isStandard = standardCategories.includes(category);
        console.log(`   ${isStandard ? '✅' : '❓'} ${category}: ${count} 个游戏`);
      });
    
    console.log('\n📋 分类分析:');
    console.log(`   总分类数: ${Object.keys(categoryStats).length}`);
    console.log(`   标准分类数: ${Object.keys(categoryStats).filter(cat => standardCategories.includes(cat)).length}`);
    console.log(`   非标准分类数: ${Object.keys(categoryStats).filter(cat => !standardCategories.includes(cat)).length}`);
    
    return categoryStats;
    
  } catch (error) {
    console.error('❌ 分析分类时出错:', error.message);
    return {};
  }
}

/**
 * 获取数据库中的标签统计
 */
async function analyzeTags() {
  console.log('\n🏷️ 分析数据库中的标签数据...\n');
  
  try {
    const { data: tags, error } = await supabase
      .from('game_tags')
      .select('tag');
    
    if (error) {
      console.error('❌ 获取游戏标签失败:', error.message);
      return {};
    }
    
    // 统计标签使用情况
    const tagStats = {};
    tags.forEach(tagRow => {
      tagStats[tagRow.tag] = (tagStats[tagRow.tag] || 0) + 1;
    });
    
    console.log('🔖 当前数据库中的标签统计 (按使用频率排序):');
    Object.entries(tagStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30) // 显示前30个最常用标签
      .forEach(([tag, count]) => {
        const isCategory = standardCategories.includes(tag);
        console.log(`   ${isCategory ? '🎯' : '📌'} ${tag}: ${count} 次`);
      });
    
    console.log('\n📈 标签分析:');
    console.log(`   总标签数: ${Object.keys(tagStats).length}`);
    console.log(`   总标签使用次数: ${tags.length}`);
    console.log(`   平均每个标签使用: ${(tags.length / Object.keys(tagStats).length).toFixed(1)} 次`);
    
    return tagStats;
    
  } catch (error) {
    console.error('❌ 分析标签时出错:', error.message);
    return {};
  }
}

/**
 * 找出相似的分类和标签
 */
function findSimilarCategoriesAndTags(categoryStats, tagStats) {
  console.log('\n🔍 查找相似的分类和标签...\n');
  
  const allCategories = Object.keys(categoryStats);
  const allTags = Object.keys(tagStats);
  
  // 分类映射建议
  const categoryMappings = [];
  
  // 标签到分类的映射建议
  const tagToCategoryMappings = [];
  
  // 相似标签合并建议
  const tagMergeMappings = [];
  
  // 1. 检查非标准分类是否应该映射到标准分类
  allCategories.forEach(category => {
    if (!standardCategories.includes(category)) {
      // 寻找最相似的标准分类
      const lowerCategory = category.toLowerCase();
      
      for (const standardCat of standardCategories) {
        // 完全包含匹配
        if (lowerCategory.includes(standardCat) || standardCat.includes(lowerCategory)) {
          categoryMappings.push({
            from: category,
            to: standardCat,
            reason: '包含匹配',
            count: categoryStats[category]
          });
          break;
        }
        
        // 模糊匹配
        if (calculateSimilarity(lowerCategory, standardCat) > 0.6) {
          categoryMappings.push({
            from: category,
            to: standardCat,
            reason: '相似匹配',
            count: categoryStats[category],
            similarity: calculateSimilarity(lowerCategory, standardCat)
          });
          break;
        }
      }
    }
  });
  
  // 2. 检查标签是否应该映射到分类
  allTags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    
    for (const standardCat of standardCategories) {
      if (lowerTag === standardCat || 
          lowerTag.includes(standardCat) || 
          standardCat.includes(lowerTag)) {
        tagToCategoryMappings.push({
          tag: tag,
          category: standardCat,
          reason: '标签与分类重复',
          count: tagStats[tag]
        });
        break;
      }
    }
  });
  
  // 3. 检查相似的标签
  const tagList = Object.keys(tagStats);
  for (let i = 0; i < tagList.length; i++) {
    for (let j = i + 1; j < tagList.length; j++) {
      const tag1 = tagList[i];
      const tag2 = tagList[j];
      const similarity = calculateSimilarity(tag1.toLowerCase(), tag2.toLowerCase());
      
      if (similarity > 0.7) {
        const count1 = tagStats[tag1];
        const count2 = tagStats[tag2];
        const primaryTag = count1 >= count2 ? tag1 : tag2;
        const secondaryTag = count1 >= count2 ? tag2 : tag1;
        
        tagMergeMappings.push({
          from: secondaryTag,
          to: primaryTag,
          reason: '相似标签合并',
          similarity: similarity,
          fromCount: count1 >= count2 ? count2 : count1,
          toCount: count1 >= count2 ? count1 : count2
        });
      }
    }
  }
  
  return { categoryMappings, tagToCategoryMappings, tagMergeMappings };
}

/**
 * 计算字符串相似度
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * 计算编辑距离
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * 显示优化建议
 */
function displayOptimizationSuggestions(categoryMappings, tagToCategoryMappings, tagMergeMappings) {
  console.log('\n💡 ===== 数据优化建议 =====\n');
  
  // 分类映射建议
  if (categoryMappings.length > 0) {
    console.log('🎯 分类优化建议:');
    categoryMappings.forEach((mapping, index) => {
      console.log(`${index + 1}. "${mapping.from}" -> "${mapping.to}"`);
      console.log(`   原因: ${mapping.reason} | 影响游戏数: ${mapping.count}`);
      if (mapping.similarity) {
        console.log(`   相似度: ${(mapping.similarity * 100).toFixed(1)}%`);
      }
    });
    console.log('');
  }
  
  // 标签到分类映射建议
  if (tagToCategoryMappings.length > 0) {
    console.log('🏷️ 标签优化建议 (标签与分类重复):');
    tagToCategoryMappings.forEach((mapping, index) => {
      console.log(`${index + 1}. 标签"${mapping.tag}" 与分类"${mapping.category}"重复`);
      console.log(`   建议: 保留分类，统一标签名称 | 使用次数: ${mapping.count}`);
    });
    console.log('');
  }
  
  // 相似标签合并建议
  if (tagMergeMappings.length > 0 && tagMergeMappings.length <= 20) {
    console.log('🔗 相似标签合并建议:');
    tagMergeMappings
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10) // 只显示前10个最相似的
      .forEach((mapping, index) => {
        console.log(`${index + 1}. "${mapping.from}" -> "${mapping.to}"`);
        console.log(`   相似度: ${(mapping.similarity * 100).toFixed(1)}% | 使用次数: ${mapping.fromCount} -> ${mapping.toCount}`);
      });
    console.log('');
  }
}

/**
 * 生成优化方案
 */
function generateOptimizationPlan(categoryMappings, tagToCategoryMappings, tagMergeMappings) {
  console.log('📋 ===== 优化执行计划 =====\n');
  
  let stepCount = 1;
  
  console.log('🔄 建议的执行步骤:\n');
  
  if (categoryMappings.length > 0) {
    console.log(`步骤${stepCount++}: 优化游戏分类`);
    console.log('   - 将非标准分类映射到标准分类');
    console.log(`   - 影响游戏数: ${categoryMappings.reduce((sum, m) => sum + m.count, 0)}`);
    console.log('');
  }
  
  if (tagToCategoryMappings.length > 0) {
    console.log(`步骤${stepCount++}: 统一标签与分类名称`);
    console.log('   - 将与分类重复的标签名称统一为分类名称');
    console.log(`   - 影响标签数: ${tagToCategoryMappings.length}`);
    console.log('');
  }
  
  if (tagMergeMappings.length > 0) {
    console.log(`步骤${stepCount++}: 合并相似标签`);
    console.log('   - 将相似的标签合并为使用频率更高的标签');
    console.log(`   - 建议合并对数: ${Math.min(tagMergeMappings.length, 10)}`);
    console.log('');
  }
  
  console.log('✅ 执行后预期效果:');
  console.log('   - 分类更加标准化和一致');
  console.log('   - 标签去重，减少冗余');
  console.log('   - 提升搜索和筛选的准确性');
  console.log('   - 改善用户体验');
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始分析分类和标签数据...\n');
    
    // 1. 分析分类
    const categoryStats = await analyzeCategories();
    
    // 2. 分析标签
    const tagStats = await analyzeTags();
    
    // 3. 找出相似项
    const { categoryMappings, tagToCategoryMappings, tagMergeMappings } = 
      findSimilarCategoriesAndTags(categoryStats, tagStats);
    
    // 4. 显示建议
    displayOptimizationSuggestions(categoryMappings, tagToCategoryMappings, tagMergeMappings);
    
    // 5. 生成执行计划
    generateOptimizationPlan(categoryMappings, tagToCategoryMappings, tagMergeMappings);
    
    return {
      categoryStats,
      tagStats,
      optimizations: {
        categoryMappings,
        tagToCategoryMappings,
        tagMergeMappings
      }
    };
    
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  analyzeCategories,
  analyzeTags,
  findSimilarCategoriesAndTags,
  calculateSimilarity
}; 