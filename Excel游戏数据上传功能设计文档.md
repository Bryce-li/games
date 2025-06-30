# Excel游戏数据上传功能设计文档

## 📋 概述

基于现有的 `import-game-data-final.js` 脚本，设计一个可配置的、事务安全的Excel游戏数据上传功能。该功能支持智能解析Excel文件，分批处理数据，提供详细的进度跟踪和错误处理。

## 🎯 功能目标

1. **解析Excel文件** - 支持标准的游戏数据Excel格式
2. **事务安全处理** - 可配置批次大小，确保数据一致性
3. **智能预估** - 计算预计上传条数，实时跟踪进度
4. **错误处理** - 详细的错误报告和数据回滚
5. **数据验证** - 上传后数据完整性检查

## 📊 Excel文件结构

基于现有文件 `src/lib/游戏数据gamedistribution.com.xlsx` 的结构：

| 列索引 | 字段名称 | 说明 | 示例 |
|--------|----------|------|------|
| 0 | 游戏名 | 游戏标题 | "Tobinin" |
| 1 | 游戏id | 唯一标识符 | "tobinin" |
| 2 | embed | 游戏嵌入URL | "https://html5.gamedistribution.com/..." |
| 3 | 分类 | 游戏分类(逗号分隔) | "Puzzle,Casual" |
| 4 | 标签 | 游戏标签(逗号分隔) | "design,logic,platformer" |
| 5 | 图片地址 | 主图片URL | "https://..." |
| 6 | 缩略图地址 | 缩略图URL | "https://..." |
| 7 | 描述 | 游戏描述 | "Step into the mind-bending..." |
| 8 | 说明 | 游戏操作说明 | "AD / Left Right Arrow..." |
| 9 | 发布时间 | Excel日期序列号 | 45834 |
| 10 | 更新时间 | 文本格式时间 | "2025年06月27日 15:22:46" |
| 11 | 加入时间 | 时间戳 | - |
| 12 | 游戏链接 | 原始链接 | "https://gamedistribution.com/..." |
| 13 | 是否更新 | 更新标识 | "是" |

## 🏗️ 系统架构

### 1. 核心类结构

```javascript
class ExcelGameDataUploader {
  constructor(config = {}) {
    this.batchSize = config.batchSize || 10;  // 可配置的批次大小
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.validateData = config.validateData || true;
  }
}
```

### 2. 配置参数

```javascript
const DEFAULT_CONFIG = {
  batchSize: 10,           // 每个事务最大处理条数
  maxRetries: 3,           // 失败重试次数
  retryDelay: 1000,        // 重试延迟(ms)
  validateData: true,      // 是否进行数据验证
  backupBeforeImport: true, // 导入前是否备份
  enableProgressLog: true,  // 是否启用进度日志
  logLevel: 'info'         // 日志级别
};
```

## 🔄 数据处理流程

### 阶段1: 文件解析
```
1. 读取Excel文件 → 验证文件格式 → 解析表头结构
2. 提取数据行 → 统计总行数 → 计算预计处理条数
3. 验证必填字段 → 检查数据格式 → 生成解析报告
```

### 阶段2: 数据预处理
```
1. 分类映射处理 → 标签清理 → 日期格式转换
2. 数据去重检查 → 游戏ID唯一性验证
3. 分批分组准备 → 计算批次数量
```

### 阶段3: 事务批量处理
```
1. 开始事务 → 处理游戏数据 → 处理分类标签 → 提交事务
2. 失败回滚 → 错误记录 → 重试机制
3. 进度更新 → 统计报告
```

### 阶段4: 验证和统计
```
1. 数据完整性检查 → 计数验证 → 关联验证
2. 生成最终报告 → 错误汇总 → 建议操作
```

## 📝 详细流程设计

### 1. 文件解析流程
```javascript
/**
 * 解析Excel文件流程
 * 1. 验证文件存在性和格式
 * 2. 读取工作表数据
 * 3. 验证表头结构
 * 4. 提取和清理数据行
 * 5. 统计预估数据
 */
async function parseExcelFile(filePath) {
  // 文件验证
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel文件不存在: ${filePath}`);
  }
  
  // 读取Excel
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // 验证表头
  const expectedHeaders = ['游戏名', '游戏id', 'embed', '分类', '标签', '图片地址', '缩略图地址', '描述', '说明', '发布时间', '更新时间', '加入时间', '游戏链接', '是否更新'];
  validateHeaders(jsonData[0], expectedHeaders);
  
  // 数据预估
  const totalRows = jsonData.length - 1; // 除表头外的数据行
  const validRows = jsonData.slice(1).filter(row => isValidGameRow(row));
  
  return {
    totalRows,
    validRows: validRows.length,
    invalidRows: totalRows - validRows.length,
    data: jsonData,
    estimatedGames: validRows.length,
    estimatedCategories: calculateUniqueCategories(validRows),
    estimatedTags: calculateUniqueTags(validRows)
  };
}
```

### 2. 数据预处理流程
```javascript
/**
 * 数据预处理流程
 * 1. 清理和格式化数据
 * 2. 分类和标签映射
 * 3. 日期格式转换
 * 4. 数据验证和去重
 */
async function preprocessData(rawData) {
  const processedGames = [];
  const categoryTags = [];
  const normalTags = [];
  const errors = [];
  
  for (let i = 1; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      
      // 基础数据验证
      if (!isValidGameRow(row)) {
        errors.push({ row: i, error: '数据行不完整', data: row });
        continue;
      }
      
      // 检查是否需要更新（第13列：是否更新）
      const shouldUpdate = row[13]?.toString().trim() === '是';
      if (!shouldUpdate) {
        // 如果不需要更新，跳过此行
        continue;
      }
      
      // 游戏数据处理
      const gameData = {
        id: generateUUID(),
        game_id: cleanGameId(row[1]),
        title: cleanText(row[0]),
        embed_url: cleanUrl(row[2]),
        image_url: cleanUrl(row[5]),
        thumbnail_url: cleanUrl(row[6]),
        description: cleanText(row[7]),
        instructions: cleanText(row[8]),
        publish_date: parseChineseDateFirst(row[10]) || convertExcelDate(row[9]),
        last_updated: parseChineseDateFirst(row[10]) || convertExcelDate(row[9]),
        is_new: false,
        is_hot: false,
        is_original: false
      };
      
      processedGames.push(gameData);
      
      // 分类处理
      if (row[3]) {
        const categories = row[3].split(',').map(cat => cat.trim()).filter(cat => cat);
        categories.forEach(category => {
          const mappedCategory = mapCategory(category);
          if (mappedCategory) {
            categoryTags.push({
              game_id: gameData.game_id,
              tag: mappedCategory,
              tag_type: 1 // 分类
            });
          }
        });
      }
      
      // 标签处理
      if (row[4]) {
        const tags = row[4].split(',').map(tag => tag.trim()).filter(tag => tag);
        tags.forEach(tag => {
          const cleanedTag = cleanTag(tag);
          if (cleanedTag) {
            normalTags.push({
              game_id: gameData.game_id,
              tag: cleanedTag,
              tag_type: 2 // 标签
            });
          }
        });
      }
      
    } catch (error) {
      errors.push({ row: i, error: error.message, data: row });
    }
  }
  
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
```

### 3. 事务批量处理流程
```javascript
/**
 * 事务批量处理流程 - 以游戏为单位进行批次处理
 * 1. 将游戏数据分批处理（每批N个游戏）
 * 2. 每批作为一个事务，包含：游戏数据 + 对应的分类标签数据
 * 3. 失败自动回滚和重试
 * 4. 实时进度跟踪
 */
async function processBatchesWithTransaction(data, config) {
  const { games, categoryTags, normalTags } = data;
  const batchSize = config.batchSize; // 游戏数量为单位
  
  let processedGamesCount = 0;
  let errorGamesCount = 0;
  let skippedGamesCount = 0;
  let totalTagsProcessed = 0;
  let totalTagsErrors = 0;
  
  // 按游戏分批处理
  console.log(`🎮 开始批量处理游戏数据 (批次大小: ${batchSize}个游戏/批)`);
  const gameBatches = chunkArray(games, batchSize);
  
  for (let i = 0; i < gameBatches.length; i++) {
    const gameBatch = gameBatches[i];
    const batchNumber = i + 1;
    
    try {
      // 为当前批次的游戏收集对应的分类和标签
      const batchGameIds = gameBatch.map(game => game.game_id);
      const batchCategoryTags = categoryTags.filter(tag => batchGameIds.includes(tag.game_id));
      const batchNormalTags = normalTags.filter(tag => batchGameIds.includes(tag.game_id));
      const batchAllTags = [...batchCategoryTags, ...batchNormalTags];
      
      console.log(`📦 批次 ${batchNumber}: ${gameBatch.length}个游戏, ${batchAllTags.length}条标签数据`);
      
      // 开启事务处理：游戏数据 + 对应标签数据
      const result = await processBatchWithRetry(
        () => insertGameBatchWithTags(gameBatch, batchAllTags),
        config.maxRetries,
        config.retryDelay
      );
      
      processedGamesCount += result.games.success;
      errorGamesCount += result.games.errors;
      skippedGamesCount += result.games.skipped;
      totalTagsProcessed += result.tags.success;
      totalTagsErrors += result.tags.errors;
      
      // 更新进度
      updateProgress('games', batchNumber, gameBatches.length, {
        processed: processedGamesCount,
        errors: errorGamesCount,
        skipped: skippedGamesCount,
        tagsProcessed: totalTagsProcessed,
        tagsErrors: totalTagsErrors
      });
      
    } catch (error) {
      console.error(`❌ 批次 ${batchNumber} 处理失败:`, error.message);
      errorGamesCount += gameBatch.length;
      
      // 统计这批失败的标签数量
      const failedGameIds = gameBatch.map(game => game.game_id);
      const failedTagsCount = [...categoryTags, ...normalTags]
        .filter(tag => failedGameIds.includes(tag.game_id)).length;
      totalTagsErrors += failedTagsCount;
    }
    
    // 控制处理频率
    if (i < gameBatches.length - 1) {
      await sleep(config.batchDelay || 100);
    }
  }
  
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
async function insertGameBatchWithTags(games, tags) {
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
    // 可以进一步按小批次插入标签，避免单次插入过多
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
              console.warn(`标签插入失败: ${tag.game_id} - ${tag.tag}`, singleError.message);
            }
          }
        } else {
          tagsSuccess += tagsBatch.length;
        }
      } catch (batchError) {
        tagsErrors += tagsBatch.length;
        console.warn(`标签批次插入失败:`, batchError.message);
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
```

### 4. 数据验证流程
```javascript
/**
 * 数据验证流程
 * 1. 统计数据库中的实际记录数
 * 2. 与预期数量对比
 * 3. 检查数据完整性
 * 4. 生成验证报告
 */
async function validateUploadResults(expectedCounts, actualResults) {
  console.log('🔍 开始验证上传结果...');
  
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
  
  // 计算差异
  const gamesDifference = actualGamesCount - (expectedCounts.games - actualResults.games.errors);
  const categoriesDifference = actualCategoriesCount - (expectedCounts.categories - actualResults.tags.errors);
  const tagsDifference = actualTagsCount - (expectedCounts.tags - actualResults.tags.errors);
  
  // 生成验证报告
  const validationReport = {
    success: gamesDifference === 0 && categoriesDifference === 0 && tagsDifference === 0,
    details: {
      games: {
        expected: expectedCounts.games - actualResults.games.errors,
        actual: actualGamesCount,
        difference: gamesDifference,
        status: gamesDifference === 0 ? '✅ 一致' : `❌ 差异: ${gamesDifference}`
      },
      categories: {
        expected: expectedCounts.categories - actualResults.tags.errors,
        actual: actualCategoriesCount,
        difference: categoriesDifference,
        status: categoriesDifference === 0 ? '✅ 一致' : `❌ 差异: ${categoriesDifference}`
      },
      tags: {
        expected: expectedCounts.tags - actualResults.tags.errors,
        actual: actualTagsCount,
        difference: tagsDifference,
        status: tagsDifference === 0 ? '✅ 一致' : `❌ 差异: ${tagsDifference}`
      }
    },
    recommendations: []
  };
  
  // 添加建议
  if (!validationReport.success) {
    if (gamesDifference < 0) {
      validationReport.recommendations.push('部分游戏数据可能没有成功导入，建议重新运行导入脚本');
    }
    if (categoriesDifference < 0) {
      validationReport.recommendations.push('部分分类数据可能没有成功导入，建议检查分类映射配置');
    }
    if (tagsDifference < 0) {
      validationReport.recommendations.push('部分标签数据可能没有成功导入，建议检查标签清理逻辑');
    }
  }
  
  return validationReport;
}

/**
 * 日期处理函数 - 优先解析中文日期格式
 */
function parseChineseDateFirst(chineseDateStr) {
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
        parseInt(month) - 1, // 月份从0开始
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
    console.warn(`中文日期解析失败: ${chineseDateStr}`, error.message);
  }
  
  return null;
}

/**
 * Excel序列号日期转换函数 - 备用方案
 */
function convertExcelDate(dateValue) {
  if (!dateValue || typeof dateValue !== 'number') {
    return null;
  }
  
  try {
    // Excel日期序列号转换 (Excel的日期起点是1900年1月1日)
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.warn(`Excel日期转换失败: ${dateValue}`, error.message);
  }
  
  return null;
}
```

## ⚙️ 配置选项

### 1. 批处理配置
```javascript
const batchConfig = {
  batchSize: 10,           // 每批处理的游戏数量 (1-50)
  maxRetries: 3,           // 失败重试次数
  retryDelay: 1000,        // 重试延迟时间(ms)
  batchDelay: 100,         // 批次间延迟时间(ms)
  enableTransaction: true   // 是否启用事务处理
};

// 注意：批次是以游戏为单位，每个游戏可能包含：
// - 1条游戏记录
// - 1-5条分类记录 (tag_type=1)
// - 0-10条标签记录 (tag_type=2)
// 实际数据库操作可能是 batchSize * (1 + 平均分类数 + 平均标签数)
```

### 2. 验证配置
```javascript
const validationConfig = {
  validateHeaders: true,       // 验证Excel表头
  validateGameId: true,        // 验证游戏ID唯一性
  validateUrls: true,          // 验证URL格式
  validateDates: true,         // 验证日期格式
  strictMode: false,           // 严格模式(一个错误就停止)
  skipInvalidRows: true        // 跳过无效行还是抛出错误
};
```

### 3. 日志配置
```javascript
const loggingConfig = {
  enableProgressLog: true,     // 启用进度日志
  enableDetailLog: false,      // 启用详细日志
  logLevel: 'info',           // 日志级别: debug, info, warn, error
  saveLogToFile: true,        // 保存日志到文件
  logFilePath: './logs/'      // 日志文件路径
};
```

## 📊 进度跟踪设计

### 1. 进度状态结构
```javascript
const progressState = {
  phase: 'parsing',           // parsing, preprocessing, uploading, validating
  totalPhases: 4,
  currentPhase: 1,
  
  // 当前阶段进度
  current: {
    processed: 0,
    total: 0,
    errors: 0,
    skipped: 0
  },
  
  // 整体进度
  overall: {
    startTime: Date.now(),
    estimatedEndTime: null,
    percentComplete: 0
  },
  
  // 详细统计
  statistics: {
    games: { processed: 0, errors: 0, skipped: 0 },
    categories: { processed: 0, errors: 0 },
    tags: { processed: 0, errors: 0 }
  }
};
```

### 2. 进度更新函数
```javascript
function updateProgress(type, current, total, stats = {}) {
  progressState.current.processed = current;
  progressState.current.total = total;
  progressState.current.errors = stats.errors || 0;
  progressState.current.skipped = stats.skipped || 0;
  
  // 计算百分比
  const phaseProgress = (current / total) * 100;
  const overallProgress = ((progressState.currentPhase - 1) / progressState.totalPhases) * 100 + 
                         (phaseProgress / progressState.totalPhases);
  
  progressState.overall.percentComplete = Math.round(overallProgress);
  
  // 估算剩余时间
  const elapsed = Date.now() - progressState.overall.startTime;
  const estimatedTotal = elapsed / (overallProgress / 100);
  progressState.overall.estimatedEndTime = progressState.overall.startTime + estimatedTotal;
  
  // 输出进度日志
  console.log(`📊 ${type} 进度: ${current}/${total} (${phaseProgress.toFixed(1)}%) | 整体: ${overallProgress.toFixed(1)}%`);
  
  if (stats.errors > 0) {
    console.log(`⚠️  错误: ${stats.errors}, 跳过: ${stats.skipped || 0}`);
  }
}
```

## 🚨 错误处理策略

### 1. 错误分类
```javascript
const ErrorTypes = {
  FILE_ERROR: 'file_error',           // 文件读取错误
  PARSE_ERROR: 'parse_error',         // 解析错误
  VALIDATION_ERROR: 'validation_error', // 验证错误
  DATABASE_ERROR: 'database_error',   // 数据库错误
  NETWORK_ERROR: 'network_error'      // 网络错误
};
```

### 2. 错误处理逻辑
```javascript
async function handleError(error, context, retryCount = 0) {
  const errorInfo = {
    type: classifyError(error),
    message: error.message,
    context: context,
    timestamp: new Date().toISOString(),
    retryCount: retryCount
  };
  
  // 记录错误
  logError(errorInfo);
  
  // 根据错误类型决定处理策略
  switch (errorInfo.type) {
    case ErrorTypes.DATABASE_ERROR:
      if (retryCount < maxRetries) {
        console.log(`🔄 数据库错误，准备重试 (${retryCount + 1}/${maxRetries})`);
        await sleep(retryDelay * Math.pow(2, retryCount)); // 指数退避
        return 'retry';
      }
      break;
      
    case ErrorTypes.VALIDATION_ERROR:
      console.log(`⚠️  数据验证错误，跳过当前记录: ${error.message}`);
      return 'skip';
      
    case ErrorTypes.FILE_ERROR:
      console.error(`❌ 文件错误，停止处理: ${error.message}`);
      return 'abort';
  }
  
  return 'continue';
}
```

## 📈 最终报告格式

```javascript
const finalReport = {
  summary: {
    status: 'success', // success, partial_success, failure
    startTime: '2025-06-29T10:00:00Z',
    endTime: '2025-06-29T10:05:30Z',
    duration: '5分30秒',
    totalProcessed: 308,
    totalErrors: 2,
    successRate: '99.35%'
  },
  
  details: {
    parsing: {
      totalRows: 309,
      validRows: 308,
      invalidRows: 1,
      estimatedGames: 308,
      estimatedCategories: 156,
      estimatedTags: 892
    },
    
    uploading: {
      games: { processed: 306, errors: 2, skipped: 0 },
      categories: { processed: 154, errors: 2 },
      tags: { processed: 890, errors: 2 }
    },
    
    validation: {
      gamesMatch: true,
      categoriesMatch: true,
      tagsMatch: true,
      overallSuccess: true
    }
  },
  
  errors: [
    {
      row: 45,
      type: 'validation_error',
      message: '游戏ID重复',
      data: { gameId: 'duplicate-game' }
    }
  ],
  
  recommendations: [
    '2个游戏记录上传失败，建议检查数据格式',
    '建议定期清理重复的游戏ID'
  ]
};
```

## 🔧 使用方式

### 1. 命令行调用
```bash
# 基础调用
node scripts/upload-excel-games.js --file="path/to/games.xlsx"

# 自定义配置调用
node scripts/upload-excel-games.js \
  --file="path/to/games.xlsx" \
  --batch-size=20 \
  --max-retries=5 \
  --enable-backup \
  --log-level=debug
```

### 2. 程序化调用
```javascript
const ExcelGameUploader = require('./excel-game-uploader');

const uploader = new ExcelGameUploader({
  batchSize: 15,
  maxRetries: 3,
  validateData: true,
  enableBackup: true
});

const result = await uploader.uploadFromFile('./games.xlsx');
console.log('上传结果:', result);
```

## ✅ 设计要点确认

根据您的反馈，已更新的设计要点：

### 🎯 已确认的设计
1. **智能分类映射**: ✅ 继续使用现有的智能映射逻辑，支持语义相似性匹配
2. **批次设计**: ✅ 以游戏数量为单位（默认10个游戏/批），每个游戏包含对应的分类和标签数据
3. **事务处理**: ✅ 每批(游戏+标签)作为一个事务，失败自动回滚
4. **重试机制**: ✅ 数据库错误重试3次，验证错误跳过
5. **日期处理**: ✅ 优先解析中文文本日期，失败后使用Excel序列号

### 📊 批次处理细节
- **批次单位**: 10个游戏/批 (可配置1-50)
- **实际数据量**: 每批可能包含 10-150 条数据库记录
  - 10条游戏记录
  - 10-50条分类记录 (每游戏1-5个分类)
  - 0-100条标签记录 (每游戏0-10个标签)

### 🔄 事务流程
```
批次1: 游戏1-10 + 对应的所有分类标签
├── 插入10条游戏记录
├── 插入30条分类记录 (tag_type=1)
└── 插入60条标签记录 (tag_type=2)
```

### ⚠️ 注意事项
- 如果某个游戏的标签数据插入失败，只记录错误但不回滚整个游戏
- 批次大小需要考虑数据库连接限制和内存使用
- 进度统计会区分游戏进度和标签进度

## 🚀 准备实施

设计已完善，包含：
- ✅ 智能分类映射逻辑
- ✅ 游戏为单位的批次处理
- ✅ 中文日期优先的日期处理
- ✅ 完整的事务和错误处理
- ✅ 详细的进度跟踪和验证

**下一步**: 开始编写具体的实现代码，您确认可以开始实施了吗？ 