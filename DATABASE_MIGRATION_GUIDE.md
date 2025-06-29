# 数据库结构迁移指南

## 📋 概述

将游戏分类从 `games` 表迁移到 `game_tags` 表，实现分类和标签的统一存储管理。

## 🔄 新数据结构

### 修改前
```sql
-- games表包含category字段
games: {
  game_id: string,
  title: string,
  category: string,  -- 分类字段
  ...
}

-- game_tags表只存储标签
game_tags: {
  id: bigint,
  game_id: string,
  tag: string
}
```

### 修改后
```sql
-- games表不再包含category字段
games: {
  game_id: string,
  title: string,
  -- category字段已删除
  ...
}

-- game_tags表统一存储分类和标签
game_tags: {
  id: bigint,
  game_id: string,
  tag: string,
  tag_type: integer  -- 1=分类, 2=标签
}
```

## 📝 迁移步骤

### 第一步：数据库结构迁移
```bash
node scripts/migrate-category-structure.js
```

**需要手动执行的SQL：**
```sql
-- 添加tag_type字段
ALTER TABLE game_tags 
ADD COLUMN IF NOT EXISTS tag_type INTEGER DEFAULT 2;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_game_tags_type ON game_tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_game_tags_game_type ON game_tags(game_id, tag_type);

-- 删除games表的category字段（在数据迁移完成后）
ALTER TABLE games 
DROP COLUMN IF EXISTS category;
```

### 第二步：重新导入数据
```bash
node scripts/reimport-tags-and-categories.js
```

## 🎯 标签类型定义

```javascript
const TAG_TYPES = {
  CATEGORY: 1,  // 分类
  TAG: 2        // 标签
};
```

## 📊 查询示例

### 查询游戏的分类
```sql
SELECT tag 
FROM game_tags 
WHERE game_id = 'game-id' AND tag_type = 1;
```

### 查询游戏的标签
```sql
SELECT tag 
FROM game_tags 
WHERE game_id = 'game-id' AND tag_type = 2;
```

### 查询某分类下的所有游戏
```sql
SELECT g.* 
FROM games g
JOIN game_tags gt ON g.game_id = gt.game_id
WHERE gt.tag = 'casual' AND gt.tag_type = 1;
```

### 统计各分类游戏数量
```sql
SELECT tag, COUNT(*) as game_count
FROM game_tags 
WHERE tag_type = 1
GROUP BY tag
ORDER BY game_count DESC;
```

## 🔧 语义映射规则

系统会自动进行语义相似性匹配，将Excel中的分类和标签映射到现有的分类系统：

### 分类映射示例
- `"Agility"` → `"action"`
- `"Shooter"` → `"shooting"`
- `"Match-3"` → `"puzzle"`
- `"Dress-up"` → `"dressUp"`
- `"Racing & Driving"` → `"driving"`

### 标签映射示例
- 如果标签与现有分类语义相似，会被映射为分类名
- 例如：标签 `"puzzle"` 会被映射为分类 `"puzzle"`

## ⚠️ 注意事项

1. **语义匹配**：只基于意思相似性，不基于字形相似性
2. **数据备份**：在执行迁移前建议备份数据库
3. **索引优化**：新增的索引会提高查询性能
4. **应用代码**：需要更新前端查询逻辑以适应新结构

## 🚀 优势

1. **统一管理**：分类和标签统一存储在一张表中
2. **灵活扩展**：可以轻松添加新的标签类型
3. **查询效率**：通过索引优化查询性能
4. **数据一致性**：减少数据冗余，提高一致性

## 📈 预期结果

- **games表**：约300个游戏记录（无category字段）
- **game_tags表**：约300个分类记录 + 约1500个标签记录
- **categories表**：26个分类配置（用于关联和显示）

## 🔍 验证方法

```bash
# 检查数据迁移结果
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function verify() {
  const { count: categories } = await supabase.from('game_tags').select('*', { count: 'exact', head: true }).eq('tag_type', 1);
  const { count: tags } = await supabase.from('game_tags').select('*', { count: 'exact', head: true }).eq('tag_type', 2);
  console.log('分类记录:', categories);
  console.log('标签记录:', tags);
}
verify();
"
``` 