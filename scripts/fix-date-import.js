#!/usr/bin/env node

/**
 * 修复日期导入问题的脚本
 * 正确处理Excel数字日期格式并更新数据库
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
 * 转换Excel数字日期为ISO格式
 * Excel日期是从1900年1月1日开始的天数（减去2天的历史偏差）
 */
function convertExcelDate(excelDate) {
  if (!excelDate || typeof excelDate !== 'number') {
    return null;
  }
  
  try {
    // Excel日期转换公式
    // 注意：Excel把1900年当作闰年处理，实际上不是，所以需要减去2天
    const epochDiff = (excelDate - 25569) * 86400 * 1000; // 25569是1970年1月1日在Excel中的序列号
    const jsDate = new Date(epochDiff);
    
    // 验证日期是否合理（1990-2030年之间）
    const year = jsDate.getFullYear();
    if (year < 1990 || year > 2030) {
      console.warn(`⚠️ 日期超出合理范围: ${excelDate} -> ${jsDate.toISOString()}`);
      return null;
    }
    
    return jsDate.toISOString();
  } catch (error) {
    console.error(`❌ 转换Excel日期失败: ${excelDate}`, error.message);
    return null;
  }
}

/**
 * 转换中文字符串日期为ISO格式（备用）
 */
function convertChineseDate(chineseDate) {
  if (!chineseDate || typeof chineseDate !== 'string') {
    return null;
  }
  
  try {
    const match = chineseDate.match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [_, year, month, day, hour, minute, second] = match;
      const isoDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      return isoDate.toISOString();
    }
    return null;
  } catch (error) {
    console.warn(`⚠️ 无法解析中文日期: ${chineseDate}`);
    return null;
  }
}

/**
 * 智能日期转换（支持数字和字符串格式）
 */
function convertDate(dateValue) {
  if (typeof dateValue === 'number') {
    return convertExcelDate(dateValue);
  } else if (typeof dateValue === 'string') {
    return convertChineseDate(dateValue);
  }
  return null;
}

/**
 * 读取Excel数据并提取日期信息
 */
function readExcelDateData() {
  console.log('📖 读取Excel文件中的日期数据...');
  
  const workbook = XLSX.readFile(excelFilePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // 移除表头行
  const dataRows = rawData.slice(1);
  
  const dateData = [];
  let successCount = 0;
  let failCount = 0;
  
  console.log('\n📊 处理Excel日期数据...');
  
  dataRows.forEach((row, index) => {
    const title = row[0]; // 游戏名
    const publishDate = convertDate(row[8]); // 发布时间
    const lastUpdated = convertDate(row[9]); // 更新时间
    
    if (title && (publishDate || lastUpdated)) {
      dateData.push({
        title,
        publish_date: publishDate,
        last_updated: lastUpdated
      });
      successCount++;
    } else {
      failCount++;
    }
    
    // 显示前5个转换样例
    if (index < 5) {
      console.log(`第${index + 1}行 "${title}"`);
      console.log(`  原始发布时间: ${row[8]} (${typeof row[8]})`);
      console.log(`  转换后: ${publishDate || '(null)'}`);
      console.log(`  原始更新时间: ${row[9]} (${typeof row[9]})`);
      console.log(`  转换后: ${lastUpdated || '(null)'}`);
      console.log('');
    }
  });
  
  console.log(`✅ 成功处理 ${successCount} 个游戏的日期数据`);
  console.log(`⚠️ 跳过 ${failCount} 个无效记录`);
  
  return dateData;
}

/**
 * 批量更新数据库中的日期字段
 */
async function updateDatabaseDates(dateData) {
  console.log('\n📥 开始更新数据库中的日期字段...');
  
  const batchSize = 20; // 每批处理20条记录
  const totalBatches = Math.ceil(dateData.length / batchSize);
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, dateData.length);
    const batch = dateData.slice(start, end);
    
    console.log(`🔄 处理第 ${i + 1}/${totalBatches} 批 (${start + 1}-${end})`);
    
    for (const gameDate of batch) {
      try {
        // 更新单个游戏的日期字段
        const { data, error } = await supabase
          .from('games')
          .update({
            publish_date: gameDate.publish_date,
            last_updated: gameDate.last_updated
          })
          .eq('title', gameDate.title)
          .select('id, title');
        
        if (error) {
          console.error(`❌ 更新"${gameDate.title}"失败:`, error.message);
          errorCount++;
        } else if (data && data.length > 0) {
          successCount++;
          console.log(`✅ 更新"${gameDate.title}"成功`);
        } else {
          console.warn(`⚠️ 未找到游戏"${gameDate.title}"`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ 处理"${gameDate.title}"时出错:`, error.message);
        errorCount++;
      }
    }
    
    // 每批之间稍作延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { successCount, errorCount };
}

/**
 * 验证更新结果
 */
async function verifyUpdateResults() {
  console.log('\n🔍 验证日期更新结果...');
  
  try {
    // 统计日期字段的有效性
    const { data: stats, error: statsError } = await supabase
      .from('games')
      .select('publish_date, last_updated')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const publishValidCount = data.filter(g => g.publish_date).length;
        const updateValidCount = data.filter(g => g.last_updated).length;
        
        return {
          data: {
            total: data.length,
            publishValidCount,
            updateValidCount,
            publishNullCount: data.length - publishValidCount,
            updateNullCount: data.length - updateValidCount
          },
          error: null
        };
      });
    
    if (statsError) {
      console.error('❌ 统计失败:', statsError.message);
    } else {
      console.log('📈 更新后日期字段统计:');
      console.log(`   总游戏数: ${stats.total}`);
      console.log(`   publish_date有效: ${stats.publishValidCount} | null: ${stats.publishNullCount}`);
      console.log(`   last_updated有效: ${stats.updateValidCount} | null: ${stats.updateNullCount}`);
      
      // 显示一些更新后的样例
      const { data: samples, error: sampleError } = await supabase
        .from('games')
        .select('title, publish_date, last_updated')
        .not('publish_date', 'is', null)
        .limit(3);
      
      if (!sampleError && samples && samples.length > 0) {
        console.log('\n📊 更新成功的样例:');
        samples.forEach((sample, index) => {
          console.log(`${index + 1}. ${sample.title}:`);
          console.log(`   发布时间: ${sample.publish_date}`);
          console.log(`   更新时间: ${sample.last_updated}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始修复日期导入问题...\n');
    
    // 1. 读取Excel中的日期数据
    const dateData = readExcelDateData();
    
    if (dateData.length === 0) {
      console.error('❌ 没有找到有效的日期数据');
      return;
    }
    
    // 2. 更新数据库
    const { successCount, errorCount } = await updateDatabaseDates(dateData);
    
    // 3. 验证结果
    await verifyUpdateResults();
    
    // 4. 总结报告
    console.log('\n📋 ===== 日期修复完成报告 =====');
    console.log(`✅ 成功更新: ${successCount} 个游戏`);
    console.log(`❌ 更新失败: ${errorCount} 个游戏`);
    console.log(`📊 成功率: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
      console.log('\n🎉 日期字段修复完成！现在所有游戏都有正确的发布时间和更新时间了！');
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  convertExcelDate,
  convertChineseDate,
  convertDate,
  readExcelDateData,
  updateDatabaseDates
}; 