-- ================================
-- 数据库结构优化脚本
-- 优化目标：将外键关联从game_id改为使用主键id，删除冗余的game_id字段
-- ================================

-- 第一步：备份当前关联数据
CREATE TEMP TABLE temp_game_tags_backup AS 
SELECT gt.id, gt.tag, g.id as games_id, gt.created_at
FROM game_tags gt
JOIN games g ON gt.game_id = g.game_id;

CREATE TEMP TABLE temp_hero_games_backup AS 
SELECT hg.id, hg.display_order, hg.is_active, g.id as games_id, hg.created_at, hg.updated_at
FROM hero_games hg
JOIN games g ON hg.game_id = g.game_id;

-- 第二步：删除现有外键约束和索引
DROP INDEX IF EXISTS idx_game_tags_unique;
DROP INDEX IF EXISTS idx_hero_games_active;

-- 第三步：重建game_tags表结构
DROP TABLE IF EXISTS game_tags CASCADE;
CREATE TABLE game_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,  -- 现在引用主键id
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 第四步：重建hero_games表结构  
DROP TABLE IF EXISTS hero_games CASCADE;
CREATE TABLE hero_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,  -- 现在引用主键id
  display_order INTEGER DEFAULT 999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 第五步：恢复数据（使用games表的主键id）
INSERT INTO game_tags (tag, game_id, created_at)
SELECT tag, games_id, created_at
FROM temp_game_tags_backup;

INSERT INTO hero_games (display_order, is_active, game_id, created_at, updated_at)
SELECT display_order, is_active, games_id, created_at, updated_at
FROM temp_hero_games_backup;

-- 第六步：重建索引
CREATE INDEX idx_game_tags_tag ON game_tags(tag);
CREATE UNIQUE INDEX idx_game_tags_unique ON game_tags(game_id, tag);
CREATE INDEX idx_hero_games_active ON hero_games(is_active, display_order) WHERE is_active = true;

-- 第七步：重新添加触发器
CREATE TRIGGER update_hero_games_updated_at BEFORE UPDATE ON hero_games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 第八步：现在可以安全删除games表的冗余game_id字段
-- 注意：这会删除原来的game_id字段，确保没有其他依赖后再执行
-- ALTER TABLE games DROP COLUMN game_id;

-- 验证优化结果
SELECT 'Games table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'games' 
ORDER BY ordinal_position;

SELECT 'Game tags table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'game_tags' 
ORDER BY ordinal_position;

SELECT 'Hero games table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hero_games' 
ORDER BY ordinal_position;

-- 验证数据完整性
SELECT 'Data integrity check:' as info;
SELECT 
  (SELECT COUNT(*) FROM games) as games_count,
  (SELECT COUNT(*) FROM game_tags) as tags_count,
  (SELECT COUNT(*) FROM hero_games) as hero_count;

-- 验证外键关联是否正常
SELECT 'Foreign key validation:' as info;
SELECT COUNT(*) as valid_game_tags 
FROM game_tags gt 
JOIN games g ON gt.game_id = g.id;

SELECT COUNT(*) as valid_hero_games 
FROM hero_games hg 
JOIN games g ON hg.game_id = g.id; 