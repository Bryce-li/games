#!/usr/bin/env node

/**
 * 数据库重建脚本 - 重新创建所有数据库表并插入初始数据
 */

const { createClient } = require('@supabase/supabase-js')

// 从环境变量读取Supabase配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：请确保在.env.local文件中设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const createTablesSQL = `
-- 创建游戏主表
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  embed_url TEXT NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  category VARCHAR(100) NOT NULL,
  is_new BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  is_original BOOLEAN DEFAULT false,
  instructions TEXT,
  publish_date TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建游戏标签关联表
CREATE TABLE IF NOT EXISTS game_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR(255) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建分类配置表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_key VARCHAR(100) UNIQUE NOT NULL,
  category_title VARCHAR(255) NOT NULL,
  show_on_homepage BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 999,
  max_games INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建英雄区游戏配置表
CREATE TABLE IF NOT EXISTS hero_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR(255) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_is_new ON games(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_games_is_hot ON games(is_hot) WHERE is_hot = true;
CREATE INDEX IF NOT EXISTS idx_games_publish_date ON games(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_games_last_updated ON games(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_game_tags_tag ON game_tags(tag);
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_tags_unique ON game_tags(game_id, tag);
CREATE INDEX IF NOT EXISTS idx_categories_homepage ON categories(show_on_homepage, display_order) WHERE show_on_homepage = true;
CREATE INDEX IF NOT EXISTS idx_hero_games_active ON hero_games(is_active, display_order) WHERE is_active = true;
`;

async function main() {
  console.log('🚀 数据库重建指导')
  console.log(`📡 目标数据库: ${supabaseUrl}`)
  
  console.log('\n📋 请在Supabase SQL编辑器中执行以下SQL：')
  console.log('=====================================')
  console.log(createTablesSQL)
  console.log('=====================================\n')
  
  console.log('⚠️  操作步骤：')
  console.log('1. 登录Supabase管理界面')
  console.log('2. 进入SQL编辑器')
  console.log('3. 复制粘贴上面的SQL并执行')
  console.log('4. 确认所有表都创建成功')
  console.log('\n表创建完成后，运行：')
  console.log('  node scripts/init-database-direct.js  # 插入基础分类数据')
  console.log('  node scripts/import-excel-games.js    # 导入游戏数据')
}

if (require.main === module) {
  main()
}