-- ================================
-- 小游戏网站数据库表创建脚本
-- ================================

-- 1. 创建游戏主表
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR(255) UNIQUE NOT NULL,  -- 游戏唯一标识符，如"cat-mini-restaurant"
  title VARCHAR(255) NOT NULL,           -- 游戏标题
  description TEXT,                      -- 游戏描述
  embed_url TEXT NOT NULL,              -- 游戏嵌入URL
  image_url TEXT,                       -- 主图片URL
  thumbnail_url TEXT,                   -- 缩略图URL
  category VARCHAR(100) NOT NULL,       -- 游戏分类（小写存储）
  is_new BOOLEAN DEFAULT false,         -- 是否为新游戏
  is_hot BOOLEAN DEFAULT false,         -- 是否为热门游戏
  is_original BOOLEAN DEFAULT false,    -- 是否为原创游戏
  instructions TEXT,                    -- 游戏操作说明
  publish_date TIMESTAMP WITH TIME ZONE,    -- 发布日期
  last_updated TIMESTAMP WITH TIME ZONE,   -- 最后更新日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建游戏标签关联表
CREATE TABLE IF NOT EXISTS game_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR(255) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建分类配置表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_key VARCHAR(100) UNIQUE NOT NULL,  -- 分类键值，如"casual", "action"
  category_title VARCHAR(255) NOT NULL,       -- 显示标题，如"Casual Games"
  show_on_homepage BOOLEAN DEFAULT true,      -- 是否在主页显示
  display_order INTEGER DEFAULT 999,          -- 显示顺序
  max_games INTEGER DEFAULT 8,               -- 最大显示游戏数量
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建英雄区游戏配置表
CREATE TABLE IF NOT EXISTS hero_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR(255) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 999,          -- 显示顺序
  is_active BOOLEAN DEFAULT true,             -- 是否激活显示
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 创建索引以优化查询性能
-- ================================

-- 游戏表索引
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_is_new ON games(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_games_is_hot ON games(is_hot) WHERE is_hot = true;
CREATE INDEX IF NOT EXISTS idx_games_publish_date ON games(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_games_last_updated ON games(last_updated DESC);

-- 标签表索引
CREATE INDEX IF NOT EXISTS idx_game_tags_tag ON game_tags(tag);
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_tags_unique ON game_tags(game_id, tag);

-- 分类表索引
CREATE INDEX IF NOT EXISTS idx_categories_homepage ON categories(show_on_homepage, display_order) WHERE show_on_homepage = true;

-- 英雄区表索引
CREATE INDEX IF NOT EXISTS idx_hero_games_active ON hero_games(is_active, display_order) WHERE is_active = true;

-- ================================
-- 创建更新时间自动更新触发器
-- ================================

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_games_updated_at BEFORE UPDATE ON hero_games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 插入基础分类数据
-- ================================

INSERT INTO categories (category_key, category_title, show_on_homepage, display_order, max_games) VALUES
('action', 'Action Games', true, 1, 8),
('adventure', 'Adventure Games', true, 2, 8),
('casual', 'Casual Games', true, 3, 8),
('puzzle', 'Puzzle Games', false, 4, 8),
('sports', 'Sports Games', false, 5, 8),
('shooting', 'Shooting Games', false, 6, 8),
('basketball', 'Basketball Games', false, 7, 8),
('beauty', 'Beauty Games', false, 8, 8),
('bike', 'Bike Games', false, 9, 8),
('car', 'Car Games', false, 10, 8),
('card', 'Card Games', false, 11, 8),
('clicker', 'Clicker Games', false, 12, 8),
('controller', 'Controller Games', false, 13, 8),
('dressUp', 'Dress Up Games', false, 14, 8),
('driving', 'Driving Games', false, 15, 8),
('escape', 'Escape Games', false, 16, 8),
('flash', 'Flash Games', false, 17, 8),
('fps', 'FPS Games', false, 18, 8),
('horror', 'Horror Games', false, 19, 8),
('io', '.io Games', false, 20, 8),
('mahjong', 'Mahjong Games', false, 21, 8),
('minecraft', 'Minecraft Games', false, 22, 8),
('pool', 'Pool Games', false, 23, 8),
('soccer', 'Soccer Games', false, 24, 8),
('stickman', 'Stickman Games', false, 25, 8),
('towerDefense', 'Tower Defense Games', false, 26, 8)
ON CONFLICT (category_key) DO NOTHING;

-- ================================
-- 验证数据库创建结果
-- ================================

-- 检查表是否创建成功
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('games', 'game_tags', 'categories', 'hero_games');

-- 检查索引是否创建成功
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('games', 'game_tags', 'categories', 'hero_games');

-- 检查分类数据是否插入成功
SELECT category_key, category_title, show_on_homepage FROM categories ORDER BY display_order; 