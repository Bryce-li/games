const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 标签类型枚举
const TAG_TYPES = {
  CATEGORY: 1,  // 分类
  TAG: 2        // 标签
};

// 语义相似性映射规则 - 严格基于意思相似性，绝不基于字形
const SEMANTIC_MAPPING = {
  // 动作类游戏
  'agility': 'action',
  'battle': 'action', 
  'fighting': 'action',
  'combat': 'action',
  'warrior': 'action',
  
  // 射击类游戏
  'shooter': 'shooting',
  'gun': 'shooting',
  'sniper': 'shooting',
  'war': 'shooting',
  
  // 解谜类游戏
  'match-3': 'puzzle',
  'match3': 'puzzle',
  'jigsaw': 'puzzle',
  'brain': 'puzzle',
  'logic': 'puzzle',
  'quiz': 'puzzle',
  'educational': 'puzzle',
  'learning': 'puzzle',
  'memory': 'puzzle',
  'word': 'puzzle',
  'trivia': 'puzzle',
  
  // 运动类游戏
  'football': 'soccer',
  'sport': 'sports',
  'olympic': 'sports',
  'tennis': 'sports',
  'golf': 'sports',
  'baseball': 'sports',
  
  // 驾驶类游戏
  'racing': 'driving',
  'racing & driving': 'driving',
  'car racing': 'driving',
  'vehicle': 'driving',
  'truck': 'driving',
  'motorcycle': 'bike',
  
  // 装扮类游戏
  'dress-up': 'dressUp',
  'dress up': 'dressUp',
  'fashion': 'dressUp',
  'makeover': 'beauty',
  'care': 'beauty',
  'salon': 'beauty',
  'makeup': 'beauty',
  
  // 卡牌类游戏
  'cards': 'card',
  'solitaire': 'card',
  'poker': 'card',
  'blackjack': 'card',
  
  // 麻将类游戏
  'mahjong & connect': 'mahjong',
  'connect': 'mahjong',
  
  // IO类游戏
  '.io': 'io',
  'multiplayer': 'io',
  
  // 休闲类游戏
  'simulation': 'casual',
  'time management': 'casual',
  'idle': 'clicker',
  'clicker': 'clicker',
  'incremental': 'clicker',
  
  // 冒险类游戏
  'rpg': 'adventure',
  'quest': 'adventure',
  'exploration': 'adventure',
  
  // 恐怖类游戏
  'scary': 'horror',
  'ghost': 'horror',
  'zombie': 'horror',
  
  // 塔防类游戏
  'tower defense': 'towerDefense',
  'defense': 'towerDefense',
  'strategy': 'towerDefense',
  
  // FPS类游戏
  'first person': 'fps',
  'first-person': 'fps',
  
  // 逃脱类游戏
  'escape room': 'escape',
  'room escape': 'escape',
  
  // 台球类游戏
  'billiards': 'pool',
  '8 ball': 'pool',
  
  // Minecraft类游戏
  'block': 'minecraft',
  'sandbox': 'minecraft',
  'building': 'minecraft',
  
  // 火柴人类游戏
  'stick': 'stickman',
  'stick figure': 'stickman'
};

// 规范化字符串用于匹配
function normalizeString(str) {
  return str.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // 替换特殊字符为空格
    .replace(/\s+/g, ' ')      // 多个空格合并为一个
    .trim();
}

// 检查语义相似性
function findSemanticMatch(input, existingCategories) {
  const normalized = normalizeString(input);
  
  // 1. 首先检查精确匹配
  const exactMatch = existingCategories.find(cat => 
    normalizeString(cat.category_key) === normalized ||
    normalizeString(cat.category_title.replace(' Games', '')) === normalized
  );
  if (exactMatch) return exactMatch.category_key;
  
  // 2. 检查语义映射
  if (SEMANTIC_MAPPING[normalized]) {
    const mappedCategory = SEMANTIC_MAPPING[normalized];
    const exists = existingCategories.find(cat => cat.category_key === mappedCategory);
    if (exists) return mappedCategory;
  }
  
  // 3. 检查部分匹配（仅基于语义）
  for (const [key, value] of Object.entries(SEMANTIC_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const exists = existingCategories.find(cat => cat.category_key === value);
      if (exists) return value;
    }
  }
  
  return null; // 没有找到匹配
}

async function reimportTagsAndCategories() {
  try {
    console.log('🚀 开始重新导入标签和分类数据...\n');
    
    // 1. 读取现有分类配置
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('category_key, category_title');
    
    console.log(`📂 现有分类配置 (${existingCategories.length} 个):`);
    existingCategories.forEach(cat => console.log(`  ${cat.category_key}: ${cat.category_title}`));
    
    // 2. 读取Excel文件
    const excelPath = path.join(__dirname, '..', 'src', 'lib', '游戏数据gamedistribution.com.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\n📊 Excel数据: ${jsonData.length - 1} 行游戏数据`);
    
    // 3. 清空现有game_tags数据
    console.log('\n🗑️  清空现有game_tags数据...');
    const { error: deleteError } = await supabase
      .from('game_tags')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.error('❌ 清空失败:', deleteError.message);
      return;
    }
    console.log('✅ 已清空现有标签数据');
    
    // 4. 处理每个游戏的分类和标签
    console.log('\n📋 开始处理游戏数据...');
    
    let processedGames = 0;
    let categoryInserts = 0;
    let tagInserts = 0;
    let skippedRows = 0;
    const categoryMappings = new Map();
    const tagMappings = new Map();
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 14) {
        skippedRows++;
        continue;
      }
      
      const gameId = row[1]?.toString().trim();
      const originalCategory = row[3]?.toString().trim();
      const tagsString = row[4]?.toString().trim();
      
      if (!gameId) {
        skippedRows++;
        continue;
      }
      
      const gameTagsToInsert = [];
      
      // 处理分类数据
      if (originalCategory) {
        let finalCategory = originalCategory;
        const semanticMatch = findSemanticMatch(originalCategory, existingCategories);
        
        if (semanticMatch) {
          finalCategory = semanticMatch;
          if (originalCategory !== semanticMatch) {
            categoryMappings.set(originalCategory, semanticMatch);
          }
        }
        
        gameTagsToInsert.push({
          game_id: gameId,
          tag: finalCategory,
          tag_type: TAG_TYPES.CATEGORY
        });
        categoryInserts++;
      }
      
      // 处理标签数据
      if (tagsString) {
        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        for (const originalTag of tags) {
          let finalTag = originalTag;
          
          // 检查标签是否与分类表中的分类相似
          const categoryMatch = findSemanticMatch(originalTag, existingCategories);
          
          if (categoryMatch) {
            finalTag = categoryMatch;
            tagMappings.set(originalTag, categoryMatch);
          }
          
          gameTagsToInsert.push({
            game_id: gameId,
            tag: finalTag,
            tag_type: TAG_TYPES.TAG
          });
          tagInserts++;
        }
      }
      
      // 批量插入当前游戏的标签和分类
      if (gameTagsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('game_tags')
          .insert(gameTagsToInsert);
        
        if (insertError) {
          console.error(`❌ 游戏 ${gameId} 数据插入失败:`, insertError.message);
        } else {
          processedGames++;
          if (processedGames % 50 === 0) {
            console.log(`✅ 已处理 ${processedGames} 个游戏...`);
          }
        }
      }
    }
    
    // 5. 生成统计报告
    console.log('\n📊 导入完成统计:');
    console.log(`  🎮 处理游戏: ${processedGames} 个`);
    console.log(`  📂 分类记录: ${categoryInserts} 个`);
    console.log(`  🏷️  标签记录: ${tagInserts} 个`);
    console.log(`  ⏭️  跳过行数: ${skippedRows} 行`);
    
    // 显示分类映射
    if (categoryMappings.size > 0) {
      console.log('\n🔄 分类语义映射:');
      categoryMappings.forEach((newCat, oldCat) => {
        console.log(`  ${oldCat} → ${newCat}`);
      });
    }
    
    // 显示标签映射
    if (tagMappings.size > 0) {
      console.log('\n🔄 标签到分类映射 (前10个):');
      let count = 0;
      tagMappings.forEach((newTag, oldTag) => {
        if (count < 10) {
          console.log(`  ${oldTag} → ${newTag}`);
          count++;
        }
      });
      if (tagMappings.size > 10) {
        console.log(`  ... 共 ${tagMappings.size} 个标签被映射为分类`);
      }
    }
    
    // 6. 验证最终结果
    console.log('\n🔍 验证最终结果:');
    
    const { count: finalCategoryCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_type', TAG_TYPES.CATEGORY);
    
    const { count: finalTagCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_type', TAG_TYPES.TAG);
    
    console.log(`  📂 分类记录: ${finalCategoryCount} 个`);
    console.log(`  🏷️  标签记录: ${finalTagCount} 个`);
    console.log(`  📋 总记录: ${(finalCategoryCount || 0) + (finalTagCount || 0)} 个`);
    
    // 显示分类分布
    const { data: categoryDistribution } = await supabase
      .from('game_tags')
      .select('tag')
      .eq('tag_type', TAG_TYPES.CATEGORY);
    
    if (categoryDistribution && categoryDistribution.length > 0) {
      const catCounts = {};
      categoryDistribution.forEach(item => {
        catCounts[item.tag] = (catCounts[item.tag] || 0) + 1;
      });
      
      console.log('\n📂 分类分布:');
      Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => console.log(`  ${cat}: ${count} 个游戏`));
    }
    
    console.log('\n✅ 标签和分类数据重新导入完成！');
    console.log('\n📝 新的数据结构说明:');
    console.log('  - game_tags表统一存储分类和标签');
    console.log('  - tag_type = 1: 游戏分类');
    console.log('  - tag_type = 2: 游戏标签');
    console.log('  - 查询游戏分类: SELECT tag FROM game_tags WHERE game_id = ? AND tag_type = 1');
    console.log('  - 查询游戏标签: SELECT tag FROM game_tags WHERE game_id = ? AND tag_type = 2');
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    console.error(error.stack);
  }
}

// 运行重新导入
reimportTagsAndCategories(); 