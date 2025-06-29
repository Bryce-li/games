#!/usr/bin/env node

/**
 * Excel文件分析脚本
 * 用于读取和分析游戏数据Excel文件的结构和内容
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Excel文件路径
const excelFilePath = path.join(__dirname, '../src/lib/游戏数据gamedistribution.com.xlsx');

/**
 * 分析Excel文件结构
 */
function analyzeExcelStructure() {
  try {
    console.log('📊 开始分析Excel文件结构...\n');
    console.log(`📁 文件路径: ${excelFilePath}`);
    
    // 检查文件是否存在
    if (!fs.existsSync(excelFilePath)) {
      console.error('❌ 文件不存在！');
      return false;
    }
    
    // 读取Excel文件
    const workbook = XLSX.readFile(excelFilePath);
    console.log(`✅ 成功读取Excel文件`);
    
    // 获取工作表名称
    const sheetNames = workbook.SheetNames;
    console.log(`📋 工作表数量: ${sheetNames.length}`);
    console.log(`📝 工作表名称: ${sheetNames.join(', ')}\n`);
    
    // 分析每个工作表
    sheetNames.forEach((sheetName, index) => {
      console.log(`\n🔍 ===== 分析工作表 ${index + 1}: "${sheetName}" =====`);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // 将工作表转换为JSON数据
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        console.log('⚠️ 工作表为空');
        return;
      }
      
      console.log(`📊 总行数: ${jsonData.length}`);
      
      // 分析第一行（表头）
      const headers = jsonData[0];
      console.log(`📋 表头列数: ${headers.length}`);
      console.log('📝 表头字段:');
      headers.forEach((header, colIndex) => {
        console.log(`   ${colIndex + 1}. ${header || '(空列)'}`);
      });
      
      // 显示前5行数据样例
      console.log('\n📊 数据样例（前5行）:');
      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        console.log(`第${i + 1}行:`, jsonData[i]);
      }
      
      // 分析数据类型
      if (jsonData.length > 1) {
        console.log('\n🔍 字段类型分析:');
        const dataRow = jsonData[1]; // 第二行作为数据样例
        headers.forEach((header, colIndex) => {
          const value = dataRow[colIndex];
          const valueType = typeof value;
          const isEmpty = value === undefined || value === null || value === '';
          console.log(`   ${header || `列${colIndex + 1}`}: ${isEmpty ? '(空值)' : `"${value}" (${valueType})`}`);
        });
      }
      
      // 分析与数据库字段的对应关系
      console.log('\n🗄️ 推测的数据库字段对应关系:');
      analyzeFieldMapping(headers);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ 分析Excel文件时出错:', error.message);
    return false;
  }
}

/**
 * 分析字段与数据库的映射关系
 */
function analyzeFieldMapping(headers) {
  const fieldMappings = {
    // 游戏基本信息
    'title': ['title', 'name', 'game_name', '游戏名称', '标题', '游戏标题'],
    'description': ['description', 'desc', '描述', '游戏描述', '说明'],
    'embed_url': ['embed_url', 'url', 'game_url', 'src', '游戏链接', '嵌入链接', 'iframe_url'],
    'image_url': ['image_url', 'image', 'picture', 'img', '图片', '主图', '游戏图片'],
    'thumbnail_url': ['thumbnail_url', 'thumbnail', 'thumb', '缩略图', '小图'],
    'category': ['category', 'type', 'genre', '分类', '类型', '游戏类型'],
    'instructions': ['instructions', 'how_to_play', 'controls', '操作说明', '玩法', '控制'],
    
    // 游戏标记
    'is_new': ['is_new', 'new', 'is_latest', '是否新游戏', '新游戏'],
    'is_hot': ['is_hot', 'hot', 'popular', 'featured', '是否热门', '热门'],
    'is_original': ['is_original', 'original', '是否原创', '原创'],
    
    // 时间字段
    'publish_date': ['publish_date', 'date', 'created', 'published', '发布日期', '创建日期'],
    'last_updated': ['last_updated', 'updated', 'modified', '更新日期', '修改日期'],
    
    // 标签和其他
    'tags': ['tags', 'keywords', 'labels', '标签', '关键词'],
    'game_id': ['game_id', 'id', 'slug', 'identifier', '游戏ID', '标识符']
  };
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerLower = header.toLowerCase().trim();
    let matchedField = null;
    let confidence = 0;
    
    // 查找最佳匹配
    for (const [dbField, keywords] of Object.entries(fieldMappings)) {
      for (const keyword of keywords) {
        if (headerLower === keyword.toLowerCase()) {
          matchedField = dbField;
          confidence = 100;
          break;
        } else if (headerLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(headerLower)) {
          if (confidence < 80) {
            matchedField = dbField;
            confidence = 80;
          }
        }
      }
      if (confidence === 100) break;
    }
    
    if (matchedField) {
      console.log(`   ✅ "${header}" -> games.${matchedField} (置信度: ${confidence}%)`);
    } else {
      console.log(`   ❓ "${header}" -> 未匹配到数据库字段`);
    }
  });
}

/**
 * 生成数据导入建议
 */
function generateImportSuggestions() {
  console.log('\n\n📋 ===== 数据导入建议 =====');
  
  console.log(`
🔧 建议的导入流程:

1. 📊 数据预处理:
   - 清理空行和无效数据
   - 验证必填字段（title, embed_url, category）
   - 标准化布尔值（true/false, 1/0, yes/no）
   - 格式化日期字段

2. 🗄️ 数据库字段映射:
   - 将Excel列名映射到数据库字段
   - 处理多值字段（如tags，用逗号分隔）
   - 验证分类是否在预设列表中

3. 📥 分批导入:
   - 先导入games表数据
   - 再处理game_tags表（标签关联）
   - 最后配置hero_games表（可选）

4. ✅ 数据验证:
   - 检查导入成功的记录数
   - 验证外键关联完整性
   - 测试查询功能

🎯 预设的游戏分类:
action, adventure, casual, puzzle, sports, shooting, basketball, 
beauty, bike, car, card, clicker, controller, dressUp, driving, 
escape, flash, fps, horror, io, mahjong, minecraft, pool, 
soccer, stickman, towerDefense

⚠️ 注意事项:
- embed_url是必填字段，确保每个游戏都有有效的播放链接
- category必须是预设分类之一，否则需要先添加到categories表
- 如果Excel中有标签字段，需要解析并插入到game_tags表
- UUID会自动生成，无需在Excel中提供
  `);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 Excel数据分析工具启动...\n');
  
  const success = analyzeExcelStructure();
  
  if (success) {
    generateImportSuggestions();
    console.log('\n🎉 Excel文件分析完成！');
    console.log('💡 请查看上述分析结果，确认字段映射关系后再进行数据导入。');
  } else {
    console.log('\n❌ Excel文件分析失败。');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  analyzeExcelStructure,
  analyzeFieldMapping,
  generateImportSuggestions
}; 