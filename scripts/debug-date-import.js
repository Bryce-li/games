#!/usr/bin/env node

/**
 * 调试日期导入问题的脚本
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Excel文件路径
const excelFilePath = path.join(__dirname, '../src/lib/游戏数据gamedistribution.com.xlsx');

/**
 * 转换中文日期格式为ISO格式
 */
function convertChineseDate(chineseDate) {
  if (!chineseDate || typeof chineseDate !== 'string') {
    return null;
  }
  
  console.log(`🔍 尝试转换日期: "${chineseDate}" (类型: ${typeof chineseDate})`);
  
  try {
    // 匹配格式: "2025年06月27日 15:22:46"
    const match = chineseDate.match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [_, year, month, day, hour, minute, second] = match;
      const isoDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      const result = isoDate.toISOString();
      console.log(`✅ 转换成功: "${chineseDate}" -> "${result}"`);
      return result;
    } else {
      console.log(`❌ 正则匹配失败: "${chineseDate}"`);
    }
    
    return null;
  } catch (error) {
    console.warn(`⚠️ 无法解析日期: ${chineseDate}`, error.message);
    return null;
  }
}

/**
 * 调试Excel数据读取
 */
function debugExcelData() {
  console.log('🔍 调试Excel数据读取...\n');
  
  const workbook = XLSX.readFile(excelFilePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // 检查表头
  const headers = rawData[0];
  console.log('📋 表头:', headers);
  console.log('📍 发布时间列索引:', headers.indexOf('发布时间'));
  console.log('📍 更新时间列索引:', headers.indexOf('更新时间'));
  
  // 检查前5行的日期数据
  console.log('\n📊 前5行日期数据样例:');
  for (let i = 1; i <= Math.min(5, rawData.length - 1); i++) {
    const row = rawData[i];
    console.log(`第${i}行:`);
    console.log(`  发布时间 (列8): "${row[8]}" (类型: ${typeof row[8]})`);
    console.log(`  更新时间 (列9): "${row[9]}" (类型: ${typeof row[9]})`);
    
    // 测试转换
    if (row[8]) {
      const convertedPublish = convertChineseDate(row[8]);
      console.log(`  转换后发布时间: ${convertedPublish}`);
    }
    
    if (row[9]) {
      const convertedUpdate = convertChineseDate(row[9]);
      console.log(`  转换后更新时间: ${convertedUpdate}`);
    }
    console.log('');
  }
}

/**
 * 检查数据库中的日期字段
 */
async function checkDatabaseDates() {
  console.log('🔍 检查数据库中的日期字段...\n');
  
  try {
    // 查询最近导入的几个游戏的日期字段
    const { data: games, error } = await supabase
      .from('games')
      .select('id, title, publish_date, last_updated, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }
    
    console.log(`📊 最近的${games.length}个游戏的日期字段:`);
    games.forEach((game, index) => {
      console.log(`${index + 1}. ${game.title}:`);
      console.log(`   publish_date: ${game.publish_date || '(null)'}`);
      console.log(`   last_updated: ${game.last_updated || '(null)'}`);
      console.log(`   created_at: ${game.created_at}`);
      console.log(`   updated_at: ${game.updated_at}`);
      console.log('');
    });
    
    // 统计日期字段的null值情况
    const { data: stats, error: statsError } = await supabase
      .from('games')
      .select('publish_date, last_updated')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const publishNullCount = data.filter(g => !g.publish_date).length;
        const updateNullCount = data.filter(g => !g.last_updated).length;
        
        return {
          data: {
            total: data.length,
            publishNullCount,
            updateNullCount,
            publishValidCount: data.length - publishNullCount,
            updateValidCount: data.length - updateNullCount
          },
          error: null
        };
      });
    
    if (statsError) {
      console.error('❌ 统计失败:', statsError.message);
    } else {
      console.log('📈 日期字段统计:');
      console.log(`   总游戏数: ${stats.total}`);
      console.log(`   publish_date有效: ${stats.publishValidCount} | null: ${stats.publishNullCount}`);
      console.log(`   last_updated有效: ${stats.updateValidCount} | null: ${stats.updateNullCount}`);
    }
    
  } catch (error) {
    console.error('❌ 检查数据库时出错:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始调试日期导入问题...\n');
  
  try {
    // 1. 调试Excel数据读取
    debugExcelData();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. 检查数据库现状
    await checkDatabaseDates();
    
  } catch (error) {
    console.error('❌ 调试过程出错:', error.message);
  }
}

// 运行脚本
if (require.main === module) {
  main();
} 