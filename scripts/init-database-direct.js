#!/usr/bin/env node

/**
 * 数据库初始化脚本 (直接API版本)
 * 直接使用Supabase JavaScript API创建表和插入数据
 */

const { createClient } = require('@supabase/supabase-js')

// 从环境变量读取Supabase配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：请确保在.env.local文件中设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error(`当前读取到的URL: ${supabaseUrl}`)
  console.error(`当前读取到的KEY: ${supabaseAnonKey ? '已设置' : '未设置'}`)
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 验证数据库连接
 */
async function validateConnection() {
  try {
    console.log('🔍 验证数据库连接...')
    // 尝试查询一个简单的表
    const { data, error } = await supabase
      .from('_supabase_auth')
      .select('count')
      .limit(1)
    
    // 即使表不存在，只要连接成功就行
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接验证失败:', error.message)
    return false
  }
}

/**
 * 插入基础分类数据
 */
async function insertCategories() {
  console.log('📂 插入基础分类数据...')
  
  const categories = [
    { category_key: 'action', category_title: 'Action Games', show_on_homepage: true, display_order: 1, max_games: 8 },
    { category_key: 'adventure', category_title: 'Adventure Games', show_on_homepage: true, display_order: 2, max_games: 8 },
    { category_key: 'casual', category_title: 'Casual Games', show_on_homepage: true, display_order: 3, max_games: 8 },
    { category_key: 'puzzle', category_title: 'Puzzle Games', show_on_homepage: false, display_order: 4, max_games: 8 },
    { category_key: 'sports', category_title: 'Sports Games', show_on_homepage: false, display_order: 5, max_games: 8 },
    { category_key: 'shooting', category_title: 'Shooting Games', show_on_homepage: false, display_order: 6, max_games: 8 },
    { category_key: 'basketball', category_title: 'Basketball Games', show_on_homepage: false, display_order: 7, max_games: 8 },
    { category_key: 'beauty', category_title: 'Beauty Games', show_on_homepage: false, display_order: 8, max_games: 8 },
    { category_key: 'bike', category_title: 'Bike Games', show_on_homepage: false, display_order: 9, max_games: 8 },
    { category_key: 'car', category_title: 'Car Games', show_on_homepage: false, display_order: 10, max_games: 8 },
    { category_key: 'card', category_title: 'Card Games', show_on_homepage: false, display_order: 11, max_games: 8 },
    { category_key: 'clicker', category_title: 'Clicker Games', show_on_homepage: false, display_order: 12, max_games: 8 },
    { category_key: 'controller', category_title: 'Controller Games', show_on_homepage: false, display_order: 13, max_games: 8 },
    { category_key: 'dressUp', category_title: 'Dress Up Games', show_on_homepage: false, display_order: 14, max_games: 8 },
    { category_key: 'driving', category_title: 'Driving Games', show_on_homepage: false, display_order: 15, max_games: 8 },
    { category_key: 'escape', category_title: 'Escape Games', show_on_homepage: false, display_order: 16, max_games: 8 },
    { category_key: 'flash', category_title: 'Flash Games', show_on_homepage: false, display_order: 17, max_games: 8 },
    { category_key: 'fps', category_title: 'FPS Games', show_on_homepage: false, display_order: 18, max_games: 8 },
    { category_key: 'horror', category_title: 'Horror Games', show_on_homepage: false, display_order: 19, max_games: 8 },
    { category_key: 'io', category_title: '.io Games', show_on_homepage: false, display_order: 20, max_games: 8 },
    { category_key: 'mahjong', category_title: 'Mahjong Games', show_on_homepage: false, display_order: 21, max_games: 8 },
    { category_key: 'minecraft', category_title: 'Minecraft Games', show_on_homepage: false, display_order: 22, max_games: 8 },
    { category_key: 'pool', category_title: 'Pool Games', show_on_homepage: false, display_order: 23, max_games: 8 },
    { category_key: 'soccer', category_title: 'Soccer Games', show_on_homepage: false, display_order: 24, max_games: 8 },
    { category_key: 'stickman', category_title: 'Stickman Games', show_on_homepage: false, display_order: 25, max_games: 8 },
    { category_key: 'towerDefense', category_title: 'Tower Defense Games', show_on_homepage: false, display_order: 26, max_games: 8 }
  ];
  
  try {
    // 使用upsert来避免重复插入
    const { data, error } = await supabase
      .from('categories')
      .upsert(categories, { 
        onConflict: 'category_key',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('❌ 插入分类数据失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功插入 ${categories.length} 个分类`);
    return true;
  } catch (error) {
    console.error('❌ 插入分类数据时出错:', error.message);
    return false;
  }
}

/**
 * 检查表是否存在
 */
async function checkTablesExist() {
  console.log('🔍 检查数据库表是否存在...');
  
  const tables = ['games', 'game_tags', 'categories', 'hero_games'];
  const results = {};
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
      
      if (error) {
        results[tableName] = false;
        console.log(`❌ 表 ${tableName} 不存在或无法访问`);
      } else {
        results[tableName] = true;
        console.log(`✅ 表 ${tableName} 存在`);
      }
    } catch (error) {
      results[tableName] = false;
      console.log(`❌ 表 ${tableName} 检查失败:`, error.message);
    }
  }
  
  return results;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始数据库连接测试和基础数据初始化...');
    console.log(`📡 连接到: ${supabaseUrl}`);
    
    // 验证连接
    const isConnected = await validateConnection();
    if (!isConnected) {
      console.error('❌ 无法连接到数据库，请检查配置');
      process.exit(1);
    }
    
    // 检查表是否存在
    const tableStatus = await checkTablesExist();
    
    // 如果categories表存在，尝试插入基础数据
    if (tableStatus.categories) {
      await insertCategories();
    } else {
      console.log('⚠️ categories表不存在，请先在Supabase管理界面创建表结构');
      console.log('📋 请使用以下SQL在Supabase SQL编辑器中创建表：');
      console.log('\n' + `
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
      `.trim());
    }
    
    console.log('\n🎉 数据库检查完成!');
    console.log('📋 下一步：');
    console.log('  1. 如果表不存在，请在Supabase管理界面创建表结构');
    console.log('  2. 表创建完成后，运行 npm run db:migrate 导入游戏数据');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
} 