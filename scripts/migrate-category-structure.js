const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 标签类型枚举
const TAG_TYPES = {
  CATEGORY: 1,  // 分类
  TAG: 2        // 标签
};

async function migrateCategoryStructure() {
  try {
    console.log('🚀 开始数据结构迁移...\n');

    // 第一步：给game_tags表添加tag_type字段
    console.log('📝 第一步：修改game_tags表结构');
    
    // 生成SQL语句来添加tag_type字段
    const addColumnSQL = `
-- 添加tag_type字段（数字类型，1=分类，2=标签）
ALTER TABLE game_tags 
ADD COLUMN IF NOT EXISTS tag_type INTEGER DEFAULT 2;

-- 添加索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_tags_type ON game_tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_game_tags_game_type ON game_tags(game_id, tag_type);
    `.trim();
    
    console.log('请在Supabase中执行以下SQL：');
    console.log('=' .repeat(50));
    console.log(addColumnSQL);
    console.log('=' .repeat(50));
    
    // 等待用户确认
    console.log('\n⏳ 请先在Supabase中执行上述SQL，然后按任意键继续...');
    
    // 检查字段是否已添加
    let fieldExists = false;
    while (!fieldExists) {
      try {
        // 尝试查询tag_type字段来检查是否存在
        const { data, error } = await supabase
          .from('game_tags')
          .select('tag_type')
          .limit(1);
        
        if (!error) {
          fieldExists = true;
          console.log('✅ 检测到tag_type字段已添加');
        } else {
          console.log('⏳ 等待字段添加...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (err) {
        console.log('⏳ 等待字段添加...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 第二步：将现有games表中的分类数据迁移到game_tags表
    console.log('\n📊 第二步：迁移分类数据到game_tags表');
    
    // 获取所有游戏的分类信息
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('game_id, category')
      .not('category', 'is', null);
    
    if (gamesError) {
      throw new Error('获取游戏数据失败: ' + gamesError.message);
    }
    
    console.log(`📋 找到 ${games.length} 个游戏需要迁移分类数据`);
    
    // 批量插入分类数据到game_tags表
    let migratedCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      
      const categoryTags = batch.map(game => ({
        game_id: game.game_id,
        tag: game.category,
        tag_type: TAG_TYPES.CATEGORY
      }));
      
      const { error: insertError } = await supabase
        .from('game_tags')
        .insert(categoryTags);
      
      if (insertError) {
        console.error(`❌ 批次 ${Math.floor(i/batchSize) + 1} 插入失败:`, insertError.message);
      } else {
        migratedCount += batch.length;
        console.log(`✅ 已迁移 ${migratedCount}/${games.length} 个游戏的分类数据`);
      }
    }
    
    // 第三步：生成删除games表category字段的SQL
    console.log('\n🗑️  第三步：删除games表中的category字段');
    
    const dropColumnSQL = `
-- 删除games表中的category字段
ALTER TABLE games 
DROP COLUMN IF EXISTS category;
    `.trim();
    
    console.log('请在Supabase中执行以下SQL：');
    console.log('=' .repeat(50));
    console.log(dropColumnSQL);
    console.log('=' .repeat(50));
    
    // 第四步：验证迁移结果
    console.log('\n🔍 第四步：验证迁移结果');
    
    // 统计各类型的记录数
    const { data: categoryCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_type', TAG_TYPES.CATEGORY);
    
    const { data: tagCount } = await supabase
      .from('game_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_type', TAG_TYPES.TAG);
    
    console.log('\n📊 迁移统计:');
    console.log(`  🏷️  分类记录: ${categoryCount?.count || 0} 个`);
    console.log(`  🏷️  标签记录: ${tagCount?.count || 0} 个`);
    console.log(`  📋 总记录: ${(categoryCount?.count || 0) + (tagCount?.count || 0)} 个`);
    
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
    
    console.log('\n✅ 数据结构迁移完成！');
    console.log('\n📝 迁移后的数据结构:');
    console.log('  - games表: 不再包含category字段');
    console.log('  - game_tags表: 统一存储分类和标签');
    console.log('    * tag_type = 1: 分类');
    console.log('    * tag_type = 2: 标签');
    console.log('  - categories表: 可通过category_key关联game_tags中的分类数据');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    console.error(error.stack);
  }
}

// 运行迁移
migrateCategoryStructure(); 