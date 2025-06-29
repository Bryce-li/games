const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

// 规范化字符串用于匹配 - 转小写，移除特殊字符
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
    normalizeString(cat.category_title) === normalized
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

// 创建新分类
async function createNewCategory(categoryName) {
  const categoryKey = categoryName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')  // 只保留字母数字
    .slice(0, 20);  // 限制长度
  
  const categoryTitle = categoryName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') + ' Games';
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        category_key: categoryKey,
        category_title: categoryTitle,
        category_icon: '🎮',
        is_visible: true,
        sort_order: 999
      })
      .select()
      .single();
    
    if (error) throw error;
    console.log(`✅ 创建新分类: ${categoryKey} (${categoryTitle})`);
    return categoryKey;
  } catch (error) {
    console.error(`❌ 创建分类失败 ${categoryName}:`, error.message);
    return null;
  }
}

async function reprocessCategoriesAndTags() {
  try {
    console.log('🚀 开始重新处理分类和标签数据...\n');
    
    // 1. 读取现有分类
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('category_key, category_title');
    
    console.log(`📂 现有分类 (${existingCategories.length} 个):`);
    existingCategories.forEach(cat => console.log(`  ${cat.category_key}: ${cat.category_title}`));
    
    // 2. 读取Excel文件
    const excelPath = path.join(__dirname, '..', 'src', 'lib', '游戏数据gamedistribution.com.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\n📊 Excel数据: ${jsonData.length - 1} 行游戏数据`);
    
    // 3. 字段映射（14列）
    const fieldMapping = {
      0: 'title',        // 游戏名
      1: 'game_id',      // 游戏id
      2: 'embed_url',    // embed
      3: 'category',     // 分类
      4: 'tags',         // 标签
      5: 'description',  // 游戏描述
      6: 'thumbnail',    // 图片地址
      7: 'width',        // 宽度
      8: 'height',       // 高度
      9: 'published_date', // 发布时间
      10: 'updated_date',  // 更新时间
      11: 'views',        // 查看次数
      12: 'rating',       // 评分
      13: 'mobile_ready'  // 移动端适配
    };
    
    // 4. 处理分类数据
    console.log('\n📋 第一步：处理分类数据');
    const categoryUpdates = new Map();
    const newCategories = new Set();
    
    // 收集所有需要处理的分类
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 14) continue;
      
      const originalCategory = row[3]?.toString().trim();
      if (!originalCategory) continue;
      
      const semanticMatch = findSemanticMatch(originalCategory, existingCategories);
      
      if (semanticMatch) {
        // 找到语义匹配，记录需要更新
        if (originalCategory !== semanticMatch) {
          categoryUpdates.set(originalCategory, semanticMatch);
          console.log(`  🔄 ${originalCategory} → ${semanticMatch}`);
        }
      } else {
        // 没找到匹配，需要创建新分类
        newCategories.add(originalCategory);
      }
    }
    
    // 创建新分类
    const createdCategories = new Map();
    for (const newCat of newCategories) {
      const newKey = await createNewCategory(newCat);
      if (newKey) {
        createdCategories.set(newCat, newKey);
      }
    }
    
    // 5. 更新游戏的分类
    console.log('\n🎮 更新游戏分类...');
    let categoryUpdateCount = 0;
    
    for (const [oldCategory, newCategory] of categoryUpdates) {
      const { error } = await supabase
        .from('games')
        .update({ category: newCategory })
        .eq('category', oldCategory);
      
      if (error) {
        console.error(`❌ 更新分类失败 ${oldCategory}:`, error.message);
      } else {
        categoryUpdateCount++;
        console.log(`  ✅ ${oldCategory} → ${newCategory}`);
      }
    }
    
    for (const [oldCategory, newCategory] of createdCategories) {
      const { error } = await supabase
        .from('games')
        .update({ category: newCategory })
        .eq('category', oldCategory);
      
      if (error) {
        console.error(`❌ 更新到新分类失败 ${oldCategory}:`, error.message);
      } else {
        categoryUpdateCount++;
        console.log(`  ✅ ${oldCategory} → ${newCategory} (新创建)`);
      }
    }
    
    // 6. 重新读取更新后的分类列表
    const { data: updatedCategories } = await supabase
      .from('categories')
      .select('category_key, category_title');
    
    // 7. 处理标签数据
    console.log('\n🏷️  第二步：处理标签数据');
    
    // 先清空现有标签
    await supabase.from('game_tags').delete().neq('id', 0);
    console.log('  🗑️  清空现有标签数据');
    
    let tagInsertCount = 0;
    let tagMappingCount = 0;
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 14) continue;
      
      const gameId = row[1]?.toString().trim();
      const tagsString = row[4]?.toString().trim();
      
      if (!gameId || !tagsString) continue;
      
      // 分割标签
      const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      for (const originalTag of tags) {
        let finalTag = originalTag;
        
        // 检查标签是否与分类表中的分类相似
        const categoryMatch = findSemanticMatch(originalTag, updatedCategories);
        
        if (categoryMatch) {
          finalTag = categoryMatch;
          tagMappingCount++;
          console.log(`    🔄 标签映射: ${originalTag} → ${finalTag}`);
        }
        
        // 插入标签
        const { error } = await supabase
          .from('game_tags')
          .insert({
            game_id: gameId,
            tag: finalTag
          });
        
        if (error) {
          console.error(`❌ 插入标签失败 ${gameId}-${finalTag}:`, error.message);
        } else {
          tagInsertCount++;
        }
      }
    }
    
    // 8. 生成报告
    console.log('\n📊 处理完成统计:');
    console.log(`  🔄 分类更新: ${categoryUpdateCount} 个游戏`);
    console.log(`  🆕 新建分类: ${createdCategories.size} 个`);
    console.log(`  🏷️  标签插入: ${tagInsertCount} 个`);
    console.log(`  🔄 标签映射: ${tagMappingCount} 个`);
    
    // 9. 最终验证
    const { count: finalGamesCount } = await supabase.from('games').select('*', { count: 'exact', head: true });
    const { count: finalTagsCount } = await supabase.from('game_tags').select('*', { count: 'exact', head: true });
    const { count: finalCategoriesCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    
    console.log('\n✅ 最终状态:');
    console.log(`  游戏数: ${finalGamesCount}`);
    console.log(`  标签数: ${finalTagsCount}`);
    console.log(`  分类数: ${finalCategoriesCount}`);
    
  } catch (error) {
    console.error('❌ 处理失败:', error.message);
    console.error(error.stack);
  }
}

// 运行处理
reprocessCategoriesAndTags(); 