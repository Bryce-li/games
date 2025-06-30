const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Supabase配置
const supabaseUrl = 'https://mtaxixqtzgpbqgklvuxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10YXhpeHF0emdwYnFna2x2dXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5MDU4NjksImV4cCI6MjA1MjQ4MTg2OX0.MbqVmKGGOJONWTRvCOe8z4kXvCYKMhp8rXpMHrK2wXo';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Excel游戏数据上传器类
 * 基于设计文档实现的完整上传解决方案
 */
class ExcelGameDataUploader {
  constructor(config = {}) {
    // 配置参数
    this.batchSize = config.batchSize || 10; // 每批游戏数量
    this.maxRetries = config.maxRetries || 3; // 最大重试次数
    this.retryDelay = config.retryDelay || 1000; // 重试延迟(ms)
    this.batchDelay = config.batchDelay || 100; // 批次间延迟(ms)
    this.validateData = config.validateData !== false; // 数据验证开关
    this.enableProgressLog = config.enableProgressLog !== false; // 进度日志开关
    this.logLevel = config.logLevel || 'info'; // 日志级别
    
    // 智能分类映射配置 (继承现有逻辑)
    this.categoryMapping = {
      // 直接映射
      'action': 'action',
      'adventure': 'adventure', 
      'puzzle': 'puzzle',
      'strategy': 'strategy',
      'sports': 'sports',
      'racing': 'racing',
      'shooting': 'shooting',
      'platformer': 'platformer',
      'rpg': 'rpg',
      'simulation': 'simulation',
      'arcade': 'arcade',
      'casual': 'casual',
      'multiplayer': 'multiplayer',
      'card': 'card',
      'board': 'board',
      'educational': 'educational',
      'music': 'music',
      'horror': 'horror',
      
      // 语义映射
      'car': 'racing',
      'cars': 'racing',
      'drive': 'racing',
      'driving': 'racing',
      'race': 'racing',
      'basketball': 'sports',
      'football': 'sports',
      'soccer': 'sports',
      'bike': 'racing',
      'motorcycle': 'racing',
      'fps': 'shooting',
      'gun': 'shooting',
      'shoot': 'shooting',
      'war': 'action',
      'fight': 'action',
      'fighting': 'action',
      'run': 'platformer',
      'jump': 'platformer',
      'logic': 'puzzle',
      'brain': 'puzzle',
      'thinking': 'puzzle',
      'cooking': 'simulation',
      'dress up': 'casual',
      'beauty': 'casual',
      'makeover': 'casual'
    };
    
    // 进度状态
    this.progressState = {
      phase: 'idle',
      totalPhases: 4,
      currentPhase: 0,
      current: { processed: 0, total: 0, errors: 0, skipped: 0 },
      overall: { startTime: null, estimatedEndTime: null, percentComplete: 0 },
      statistics: {
        games: { processed: 0, errors: 0, skipped: 0 },
        categories: { processed: 0, errors: 0 },
        tags: { processed: 0, errors: 0 }
      }
    };
  }

  /**
   * 主上传函数 - 完整流程
   */
  async uploadFromFile(filePath) {
    try {
      this.log('info', '🚀 开始Excel游戏数据上传流程...');
      this.progressState.overall.startTime = Date.now();
      
      // 阶段1: 文件解析
      this.updatePhase('parsing', 1);
      const parseResult = await this.parseExcelFile(filePath);
      
      // 阶段2: 数据预处理
      this.updatePhase('preprocessing', 2);
      const preprocessResult = await this.preprocessData(parseResult.data);
      
      // 阶段3: 事务批量处理
      this.updatePhase('uploading', 3);
      const uploadResult = await this.processBatchesWithTransaction(preprocessResult);
      
      // 阶段4: 验证和统计
      this.updatePhase('validating', 4);
      const validationResult = await this.validateUploadResults(parseResult, uploadResult);
      
      // 生成最终报告
      const finalReport = this.generateFinalReport(parseResult, preprocessResult, uploadResult, validationResult);
      
      this.log('info', '✅ Excel游戏数据上传完成！');
      return finalReport;
      
    } catch (error) {
      this.log('error', `❌ 上传过程发生错误: ${error.message}`);
      throw error;
    }
  }

  /**
   * 阶段1: 解析Excel文件
   */
  async parseExcelFile(filePath) {
    this.log('info', `📂 开始解析Excel文件: ${filePath}`);
    
    // 验证文件存在性
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel文件不存在: ${filePath}`);
    }
    
    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // 验证表头结构
    const expectedHeaders = ['游戏名', '游戏id', 'embed', '分类', '标签', '图片地址', '缩略图地址', '描述', '说明', '发布时间', '更新时间', '加入时间', '游戏链接', '是否更新'];
    this.validateHeaders(jsonData[0], expectedHeaders);
    
    // 统计数据
    const totalRows = jsonData.length - 1; // 除表头外的数据行
    const validRows = jsonData.slice(1).filter(row => this.isValidGameRow(row));
    const updateRows = validRows.filter(row => row[13]?.toString().trim() === '是'); // 需要更新的行
    
    this.log('info', `📊 文件解析完成:`);
    this.log('info', `  - 总行数: ${totalRows}`);
    this.log('info', `  - 有效行数: ${validRows.length}`);
    this.log('info', `  - 需要更新: ${updateRows.length}`);
    this.log('info', `  - 跳过行数: ${totalRows - validRows.length}`);
    
    return {
      totalRows,
      validRows: validRows.length,
      updateRows: updateRows.length,
      invalidRows: totalRows - validRows.length,
      data: jsonData,
      estimatedGames: updateRows.length,
      estimatedCategories: this.calculateUniqueCategories(updateRows),
      estimatedTags: this.calculateUniqueTags(updateRows)
    };
  }

  /**
   * 阶段2: 数据预处理
   */
  async preprocessData(rawData) {
    this.log('info', '🔄 开始数据预处理...');
    
    const processedGames = [];
    const categoryTags = [];
    const normalTags = [];
    const errors = [];
    
    for (let i = 1; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        
        // 基础数据验证
        if (!this.isValidGameRow(row)) {
          continue;
        }
        
        // 检查是否需要更新（第13列：是否更新）
        const shouldUpdate = row[13]?.toString().trim() === '是';
        if (!shouldUpdate) {
          continue; // 跳过不需要更新的行
        }
        
        // 游戏数据处理
        const gameData = {
          id: uuidv4(),
          game_id: this.cleanGameId(row[1]),
          title: this.cleanText(row[0]),
          embed_url: this.cleanUrl(row[2]),
          image_url: this.cleanUrl(row[5]),
          thumbnail_url: this.cleanUrl(row[6]),
          description: this.cleanText(row[7]),
          instructions: this.cleanText(row[8]),
          publish_date: this.parseChineseDateFirst(row[10]) || this.convertExcelDate(row[9]),
          last_updated: this.parseChineseDateFirst(row[10]) || this.convertExcelDate(row[9]),
          is_new: false,
          is_hot: false,
          is_original: false,
          created_at: new Date().toISOString()
        };
        
        processedGames.push(gameData);
        
        // 分类处理
        if (row[3]) {
          const categories = row[3].split(',').map(cat => cat.trim()).filter(cat => cat);
          categories.forEach(category => {
            const mappedCategory = this.mapCategory(category);
            if (mappedCategory) {
              categoryTags.push({
                id: uuidv4(),
                game_id: gameData.id, // 使用游戏的UUID
                tag: mappedCategory,
                tag_type: 1 // 1=分类
              });
            }
          });
        }
        
        // 标签处理
        if (row[4]) {
          const tags = row[4].split(',').map(tag => tag.trim()).filter(tag => tag);
          tags.forEach(tag => {
            const cleanedTag = this.cleanTag(tag);
            if (cleanedTag) {
              normalTags.push({
                id: uuidv4(),
                game_id: gameData.id, // 使用游戏的UUID
                tag: cleanedTag,
                tag_type: 2 // 2=标签
              });
            }
          });
        }
        
      } catch (error) {
        errors.push({ row: i, error: error.message, data: row });
      }
    }
    
    this.log('info', `✅ 数据预处理完成:`);
    this.log('info', `  - 处理游戏: ${processedGames.length}`);
    this.log('info', `  - 分类数据: ${categoryTags.length}`);
    this.log('info', `  - 标签数据: ${normalTags.length}`);
    this.log('info', `  - 处理错误: ${errors.length}`);
    
    return {
      games: processedGames,
      categoryTags: categoryTags,
      normalTags: normalTags,
      errors: errors,
      statistics: {
        totalProcessed: processedGames.length,
        totalCategories: categoryTags.length,
        totalTags: normalTags.length,
        totalErrors: errors.length
      }
    };
  }

  /**
   * 阶段3: 事务批量处理 - 以游戏为单位进行批次处理
   */
  async processBatchesWithTransaction(data) {
    const { games, categoryTags, normalTags } = data;
    
    let processedGamesCount = 0;
    let errorGamesCount = 0;
    let skippedGamesCount = 0;
    let totalTagsProcessed = 0;
    let totalTagsErrors = 0;
    
    this.log('info', `📦 开始批量处理游戏数据 (批次大小: ${this.batchSize}个游戏/批)`);
    const gameBatches = this.chunkArray(games, this.batchSize);
    
    for (let i = 0; i < gameBatches.length; i++) {
      const gameBatch = gameBatches[i];
      const batchNumber = i + 1;
      
      try {
        // 为当前批次的游戏收集对应的分类和标签
        const batchGameIds = gameBatch.map(game => game.id);
        const batchCategoryTags = categoryTags.filter(tag => batchGameIds.includes(tag.game_id));
        const batchNormalTags = normalTags.filter(tag => batchGameIds.includes(tag.game_id));
        const batchAllTags = [...batchCategoryTags, ...batchNormalTags];
        
        this.log('info', `📦 批次 ${batchNumber}: ${gameBatch.length}个游戏, ${batchAllTags.length}条标签数据`);
        
        // 开启事务处理：游戏数据 + 对应标签数据
        const result = await this.processBatchWithRetry(
          () => this.insertGameBatchWithTags(gameBatch, batchAllTags),
          this.maxRetries,
          this.retryDelay
        );
        
        processedGamesCount += result.games.success;
        errorGamesCount += result.games.errors;
        skippedGamesCount += result.games.skipped;
        totalTagsProcessed += result.tags.success;
        totalTagsErrors += result.tags.errors;
        
        // 更新进度
        this.updateProgress('games', batchNumber, gameBatches.length, {
          processed: processedGamesCount,
          errors: errorGamesCount,
          skipped: skippedGamesCount,
          tagsProcessed: totalTagsProcessed,
          tagsErrors: totalTagsErrors
        });
        
      } catch (error) {
        this.log('error', `❌ 批次 ${batchNumber} 处理失败: ${error.message}`);
        errorGamesCount += gameBatch.length;
        
        // 统计这批失败的标签数量
        const failedGameIds = gameBatch.map(game => game.id);
        const failedTagsCount = [...categoryTags, ...normalTags]
          .filter(tag => failedGameIds.includes(tag.game_id)).length;
        totalTagsErrors += failedTagsCount;
      }
      
      // 控制处理频率
      if (i < gameBatches.length - 1) {
        await this.sleep(this.batchDelay);
      }
    }
    
    this.log('info', `✅ 批量处理完成:`);
    this.log('info', `  - 成功游戏: ${processedGamesCount}`);
    this.log('info', `  - 失败游戏: ${errorGamesCount}`);
    this.log('info', `  - 成功标签: ${totalTagsProcessed}`);
    this.log('info', `  - 失败标签: ${totalTagsErrors}`);
    
    return {
      games: {
        processed: processedGamesCount,
        errors: errorGamesCount,
        skipped: skippedGamesCount
      },
      tags: {
        processed: totalTagsProcessed,
        errors: totalTagsErrors
      }
    };
  }

  /**
   * 插入游戏批次及其对应的标签数据 - 作为单个事务
   */
  async insertGameBatchWithTags(games, tags) {
    // 插入游戏数据
    const { data: gamesResult, error: gamesError } = await supabase
      .from('games')
      .insert(games);
    
    if (gamesError) {
      throw new Error(`游戏数据插入失败: ${gamesError.message}`);
    }
    
    let tagsSuccess = 0;
    let tagsErrors = 0;
    
    // 插入对应的标签数据
    if (tags.length > 0) {
      // 按小批次插入标签，避免单次插入过多
      const tagBatchSize = 50;
      for (let i = 0; i < tags.length; i += tagBatchSize) {
        const tagsBatch = tags.slice(i, i + tagBatchSize);
        
        try {
          const { error: tagsError } = await supabase
            .from('game_tags')
            .insert(tagsBatch);
          
          if (tagsError) {
            // 如果批量插入失败，尝试逐条插入
            for (const tag of tagsBatch) {
              try {
                await supabase.from('game_tags').insert([tag]);
                tagsSuccess++;
              } catch (singleError) {
                tagsErrors++;
                this.log('warn', `标签插入失败: ${tag.game_id} - ${tag.tag}`);
              }
            }
          } else {
            tagsSuccess += tagsBatch.length;
          }
        } catch (batchError) {
          tagsErrors += tagsBatch.length;
          this.log('warn', `标签批次插入失败: ${batchError.message}`);
        }
      }
    }
    
    return {
      games: {
        success: games.length,
        errors: 0,
        skipped: 0
      },
      tags: {
        success: tagsSuccess,
        errors: tagsErrors
      }
    };
  }

  /**
   * 阶段4: 数据验证
   */
  async validateUploadResults(parseResult, uploadResult) {
    this.log('info', '🔍 开始验证上传结果...');
    
    try {
      // 查询实际数据库记录
      const [
        { count: actualGamesCount },
        { count: actualCategoriesCount },
        { count: actualTagsCount }
      ] = await Promise.all([
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('game_tags').select('*', { count: 'exact', head: true }).eq('tag_type', 1),
        supabase.from('game_tags').select('*', { count: 'exact', head: true }).eq('tag_type', 2)
      ]);
      
      const validationReport = {
        success: true,
        details: {
          games: {
            expected: parseResult.estimatedGames,
            processed: uploadResult.games.processed,
            errors: uploadResult.games.errors,
            status: uploadResult.games.errors === 0 ? '✅ 成功' : `⚠️ 部分失败: ${uploadResult.games.errors}个`
          },
          categories: {
            expected: parseResult.estimatedCategories,
            processed: uploadResult.tags.processed,
            errors: uploadResult.tags.errors,
            status: uploadResult.tags.errors === 0 ? '✅ 成功' : `⚠️ 部分失败: ${uploadResult.tags.errors}个`
          },
          database: {
            totalGames: actualGamesCount,
            totalCategories: actualCategoriesCount,
            totalTags: actualTagsCount
          }
        },
        recommendations: []
      };
      
      // 添加建议
      if (uploadResult.games.errors > 0) {
        validationReport.recommendations.push(`${uploadResult.games.errors}个游戏上传失败，建议检查错误日志`);
        validationReport.success = false;
      }
      
      if (uploadResult.tags.errors > 0) {
        validationReport.recommendations.push(`${uploadResult.tags.errors}个标签上传失败，建议检查数据格式`);
      }
      
      this.log('info', '✅ 验证完成');
      return validationReport;
      
    } catch (error) {
      this.log('error', `验证过程出错: ${error.message}`);
      return {
        success: false,
        error: error.message,
        recommendations: ['验证失败，建议手动检查数据库状态']
      };
    }
  }

  // ===== 工具函数 =====

  /**
   * 智能分类映射 - 继承现有逻辑
   */
  mapCategory(category) {
    if (!category) return null;
    
    const lowerCategory = category.toLowerCase().trim();
    
    // 直接映射
    if (this.categoryMapping[lowerCategory]) {
      return this.categoryMapping[lowerCategory];
    }
    
    // 模糊匹配
    for (const [key, value] of Object.entries(this.categoryMapping)) {
      if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
        return value;
      }
    }
    
    // 默认返回原值
    return lowerCategory;
  }

  /**
   * 优先解析中文日期格式
   */
  parseChineseDateFirst(chineseDateStr) {
    if (!chineseDateStr || typeof chineseDateStr !== 'string') {
      return null;
    }
    
    try {
      // 匹配中文日期格式: "2025年06月27日 15:22:46"
      const chinesePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{1,2}):(\d{1,2})/;
      const match = chineseDateStr.match(chinesePattern);
      
      if (match) {
        const [, year, month, day, hour, minute, second] = match;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        );
        
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
      
      // 如果中文格式解析失败，尝试其他常见格式
      const date = new Date(chineseDateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      
    } catch (error) {
      this.log('warn', `中文日期解析失败: ${chineseDateStr}`);
    }
    
    return null;
  }

  /**
   * Excel序列号日期转换
   */
  convertExcelDate(dateValue) {
    if (!dateValue || typeof dateValue !== 'number') {
      return null;
    }
    
    try {
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
      
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (error) {
      this.log('warn', `Excel日期转换失败: ${dateValue}`);
    }
    
    return null;
  }

  // ===== 验证和工具函数 =====
  
  validateHeaders(actualHeaders, expectedHeaders) {
    if (!actualHeaders || actualHeaders.length === 0) {
      throw new Error('Excel文件表头为空');
    }
    // 简化验证，只要有基本字段即可
    const requiredFields = ['游戏名', '游戏id', 'embed'];
    const missing = requiredFields.filter(field => !actualHeaders.includes(field));
    if (missing.length > 0) {
      throw new Error(`缺少必需字段: ${missing.join(', ')}`);
    }
  }

  isValidGameRow(row) {
    return row && row.length >= 3 && row[0] && row[1] && row[2]; // 至少有游戏名、ID、embed
  }

  cleanGameId(gameId) {
    return gameId ? gameId.toString().trim().toLowerCase() : '';
  }

  cleanText(text) {
    return text ? text.toString().trim() : '';
  }

  cleanUrl(url) {
    return url ? url.toString().trim() : '';
  }

  cleanTag(tag) {
    return tag ? tag.toString().trim().toLowerCase() : '';
  }

  calculateUniqueCategories(rows) {
    const categories = new Set();
    rows.forEach(row => {
      if (row[3]) {
        row[3].split(',').forEach(cat => categories.add(cat.trim()));
      }
    });
    return categories.size;
  }

  calculateUniqueTags(rows) {
    const tags = new Set();
    rows.forEach(row => {
      if (row[4]) {
        row[4].split(',').forEach(tag => tags.add(tag.trim()));
      }
    });
    return tags.size;
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async processBatchWithRetry(operation, maxRetries, delay) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        this.log('warn', `操作失败，第${attempt}次重试: ${error.message}`);
        await this.sleep(delay * Math.pow(2, attempt - 1)); // 指数退避
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== 进度和日志管理 =====

  updatePhase(phaseName, phaseNumber) {
    this.progressState.phase = phaseName;
    this.progressState.currentPhase = phaseNumber;
    this.log('info', `📋 阶段 ${phaseNumber}: ${phaseName}`);
  }

  updateProgress(type, current, total, stats = {}) {
    this.progressState.current.processed = current;
    this.progressState.current.total = total;
    
    if (this.enableProgressLog) {
      const percentage = ((current / total) * 100).toFixed(1);
      this.log('info', `📊 ${type} 进度: ${current}/${total} (${percentage}%)`);
      
      if (stats.errors > 0) {
        this.log('warn', `⚠️ 错误: ${stats.errors}, 跳过: ${stats.skipped || 0}`);
      }
    }
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  /**
   * 生成最终报告
   */
  generateFinalReport(parseResult, preprocessResult, uploadResult, validationResult) {
    const endTime = Date.now();
    const duration = endTime - this.progressState.overall.startTime;
    
    return {
      summary: {
        status: validationResult.success ? 'success' : 'partial_success',
        startTime: new Date(this.progressState.overall.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: `${Math.round(duration / 1000)}秒`,
        totalProcessed: uploadResult.games.processed,
        totalErrors: uploadResult.games.errors + uploadResult.tags.errors,
        successRate: `${((uploadResult.games.processed / parseResult.estimatedGames) * 100).toFixed(2)}%`
      },
      
      details: {
        parsing: {
          totalRows: parseResult.totalRows,
          validRows: parseResult.validRows,
          updateRows: parseResult.updateRows,
          estimatedGames: parseResult.estimatedGames,
          estimatedCategories: parseResult.estimatedCategories,
          estimatedTags: parseResult.estimatedTags
        },
        
        uploading: {
          games: uploadResult.games,
          tags: uploadResult.tags
        },
        
        validation: validationResult
      },
      
      recommendations: validationResult.recommendations || []
    };
  }
}

module.exports = { ExcelGameDataUploader };

// 如果直接运行此脚本
if (require.main === module) {
  const defaultExcelPath = path.join(__dirname, '../src/lib/游戏数据gamedistribution.com.xlsx');
  
  const uploader = new ExcelGameDataUploader({
    batchSize: 10,
    maxRetries: 3,
    enableProgressLog: true
  });
  
  uploader.uploadFromFile(defaultExcelPath)
    .then(report => {
      console.log('\n📋 最终报告:');
      console.log(JSON.stringify(report, null, 2));
    })
    .catch(error => {
      console.error('❌ 上传失败:', error.message);
      process.exit(1);
    });
} 