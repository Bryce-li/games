import { createClient } from '@supabase/supabase-js';
import { existsSync, statSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 类型定义
interface UploaderConfig {
  batchSize?: number;           // 批次大小，默认10
  maxRetries?: number;          // 最大重试次数，默认3
  enableProgressLog?: boolean;  // 启用进度日志，默认true
  logLevel?: 'info' | 'warn' | 'error'; // 日志级别，默认info
}

interface ParseResult {
  totalRows: number;
  validRows: number;
  updateRows: number;
  invalidRows: number;
  data: ExcelRowData[][];
  estimatedGames: number;
  estimatedCategories: number;
  estimatedTags: number;
}

interface ProcessResult {
  processedGames: number;
  totalCategories: number;
  totalTags: number;
  skippedRows: number;
  errors: string[];
  duration: number;
}

interface GameRowData {
  title: string;
  gameId: string;
  embed: string;
  category: string;
  tags: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  instructions: string;
  publishDate: Date | null;
  updateDate: Date | null;
  addDate: Date | null;
  gameUrl: string;
  shouldUpdate: boolean;
}

// Excel行数据类型
type ExcelRowData = string | number | Date | null | undefined;

interface GameData {
  id: string;
  game_id: string;
  title: string;
  embed_url: string;
  image_url: string;
  thumbnail_url: string;
  description: string;
  instructions: string;
  publish_date: string | null;
  last_updated: string | null;
  is_new: boolean;
  is_hot: boolean;
  is_original: boolean;
  created_at: string;
}

interface TagData {
  id: string;
  game_id: string;
  tag: string;
  tag_type: number;
}

interface ProcessingError {
  row: number;
  error: string;
  data: ExcelRowData[];
}

interface PreprocessResult {
  games: GameData[];
  categoryTags: TagData[];
  normalTags: TagData[];
  errors: ProcessingError[];
  statistics: {
    totalProcessed: number;
    totalCategories: number;
    totalTags: number;
    totalErrors: number;
  };
}

interface UploadResult {
  games: {
    processed: number;
    errors: number;
    skipped: number;
  };
  tags: {
    processed: number;
    errors: number;
  };
}

/**
 * Excel游戏数据上传器类
 * 基于设计文档实现的完整上传解决方案
 */
export class ExcelGameDataUploader {
  private batchSize: number;
  private maxRetries: number;
  private retryDelay: number;
  private batchDelay: number;
  private validateData: boolean;
  private enableProgressLog: boolean;
  private logLevel: string;
  private categoryMapping: Record<string, string>;
  private progressState: {
    phase: string;
    totalPhases: number;
    currentPhase: number;
    current: { processed: number; total: number; errors: number; skipped: number };
    overall: { startTime: number | null; estimatedEndTime: number | null; percentComplete: number };
    statistics: {
      games: { processed: number; errors: number; skipped: number };
      categories: { processed: number; errors: number };
      tags: { processed: number; errors: number };
    };
  };

  constructor(config: UploaderConfig = {}) {
    // 配置参数
    this.batchSize = config.batchSize || 10;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = 1000;
    this.batchDelay = 100;
    this.validateData = true;
    this.enableProgressLog = config.enableProgressLog !== false;
    this.logLevel = config.logLevel || 'info';
    
    // 智能分类映射配置
    this.categoryMapping = {
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
      'art': 'art',
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
  async uploadFromFile(filePath: string) {
    try {
      this.log('info', '🚀 开始Excel游戏数据上传流程...');
      this.progressState.overall.startTime = Date.now();
      
      // 阶段1: 文件解析 (改用Buffer模式)
      this.updatePhase('parsing', 1);
      const parseResult = await this.parseExcelBuffer(filePath);
      
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
      this.log('error', `❌ 上传过程发生错误: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 阶段1: 解析Excel文件 (使用Buffer模式避免Next.js webpack问题)
   */
  private async parseExcelBuffer(filePath: string): Promise<ParseResult> {
    this.log('info', `📂 开始解析Excel文件: ${filePath}`);
    
    try {
      // 验证文件是否存在
      if (!existsSync(filePath)) {
        throw new Error(`Excel文件不存在: ${filePath}`);
      }
      
      // 获取文件信息
      const stats = statSync(filePath);
      this.log('info', `📄 文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      this.log('info', `📅 文件修改时间: ${stats.mtime.toISOString()}`);
      
      // 检查文件是否为空
      if (stats.size === 0) {
        throw new Error('Excel文件为空');
      }
      
      this.log('info', '🔍 使用Buffer模式读取Excel文件...');
      
      // 使用fs读取文件为Buffer，避免xlsx直接访问文件系统
      const { readFileSync } = await import('fs');
      const fileBuffer = readFileSync(filePath);
      this.log('info', `📦 文件Buffer大小: ${fileBuffer.length} bytes`);
      
      // 使用Buffer模式读取Excel
      const workbook = XLSX.read(fileBuffer, {
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false
      });
      
      this.log('info', '✅ XLSX.read Buffer模式执行成功');
      
      if (!workbook) {
        throw new Error('XLSX.read 返回空工作簿');
      }
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Excel文件中没有找到工作表');
      }
      
      const sheetName = workbook.SheetNames[0];
      this.log('info', `📋 读取工作表: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error(`无法访问工作表: ${sheetName}`);
      }
      
      this.log('info', '🔄 开始转换为JSON数据...');
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        blankrows: false
      }) as ExcelRowData[][];
      
      if (!jsonData || jsonData.length === 0) {
        throw new Error('Excel文件为空或无法解析数据');
      }
      
      this.log('info', `📊 解析到 ${jsonData.length} 行数据`);
      
      // 验证表头结构
      const expectedHeaders = ['游戏名', '游戏id', 'embed', '分类', '标签', '图片地址', '缩略图地址', '描述', '说明', '发布时间', '更新时间', '加入时间', '游戏链接', '是否更新'];
      this.validateHeaders(jsonData[0], expectedHeaders);
      
      // 统计数据
      const totalRows = jsonData.length - 1;
      const validRows = jsonData.slice(1).filter(row => this.isValidGameRow(row));
      const updateRows = validRows.filter(row => row[13]?.toString().trim() === '是');
      
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
      
    } catch (error) {
      // 详细的错误信息
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      
      this.log('error', `📂 Excel文件解析失败: ${errorMessage}`);
      if (errorStack) {
        this.log('error', `🔍 错误堆栈: ${errorStack}`);
      }
      
      // 尝试获取更多文件信息
      try {
        if (existsSync(filePath)) {
          const stats = statSync(filePath);
          this.log('error', `📄 错误时文件信息: 大小=${stats.size}bytes, 修改时间=${stats.mtime}`);
        } else {
          this.log('error', `📄 错误时文件不存在: ${filePath}`);
        }
      } catch (statError) {
        this.log('error', `📄 无法获取文件状态: ${statError}`);
      }
      
      throw new Error(`Excel文件解析失败: ${errorMessage}`);
    }
  }

  /**
   * 阶段2: 数据预处理
   */
  private async preprocessData(rawData: ExcelRowData[][]): Promise<PreprocessResult> {
    this.log('info', '🔄 开始数据预处理...');
    
    const processedGames: GameData[] = [];
    const categoryTags: TagData[] = [];
    const normalTags: TagData[] = [];
    const errors: ProcessingError[] = [];
    const allCategories = new Set<string>(); // 收集所有分类
    
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      try {
        if (!this.isValidGameRow(row)) {
          continue;
        }
        
        const shouldUpdate = row[13]?.toString().trim() === '是';
        if (!shouldUpdate) {
          continue;
        }
        
        const gameData: GameData = {
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
          const categoryStr = row[3].toString();
          const categories = categoryStr.split(',').map((cat: string) => cat.trim()).filter((cat: string) => cat);
          this.log('info', `🏷️ 游戏 ${gameData.title} 的原始分类: [${categories.join(', ')}]`);
          
          categories.forEach((category: string) => {
            const mappedCategory = this.mapCategory(category);
            this.log('info', `🔄 分类映射: "${category}" → "${mappedCategory}"`);
            
            if (mappedCategory) {
              allCategories.add(mappedCategory); // 收集分类
              categoryTags.push({
                id: uuidv4(),
                game_id: gameData.id,
                tag: mappedCategory,
                tag_type: 1
              });
              this.log('info', `✅ 添加分类标签: ${mappedCategory} (game: ${gameData.title})`);
            } else {
              this.log('warn', `⚠️ 分类映射失败: "${category}" 返回 null`);
            }
          });
        }
        
        // 标签处理
        if (row[4]) {
          const tagStr = row[4].toString();
          const tags = tagStr.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
          tags.forEach((tag: string) => {
            const cleanedTag = this.cleanTag(tag);
            if (cleanedTag) {
              normalTags.push({
                id: uuidv4(),
                game_id: gameData.id,
                tag: cleanedTag,
                tag_type: 2
              });
            }
          });
        }
        
      } catch (error) {
        errors.push({ row: i, error: error instanceof Error ? error.message : 'Unknown error', data: row });
      }
    }
    
    // 🆕 自动创建缺失的分类
    await this.ensureCategoriesExist(Array.from(allCategories));
    
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
   * 🆕 确保分类在categories表中存在
   */
  private async ensureCategoriesExist(categoryKeys: string[]): Promise<void> {
    if (categoryKeys.length === 0) {
      this.log('info', '📂 没有新分类需要创建');
      return;
    }

    this.log('info', `📂 检查分类是否存在: [${categoryKeys.join(', ')}]`);

    try {
      // 查询现有分类
      const { data: existingCategories, error: queryError } = await supabase
        .from('categories')
        .select('category_key')
        .in('category_key', categoryKeys);

      if (queryError) {
        this.log('warn', `⚠️ 查询现有分类失败: ${queryError.message}`);
        return;
      }

      const existingKeys = new Set(existingCategories?.map(cat => cat.category_key) || []);
      const missingKeys = categoryKeys.filter(key => !existingKeys.has(key));

      if (missingKeys.length === 0) {
        this.log('info', `✅ 所有分类都已存在于categories表中`);
        return;
      }

      this.log('info', `🆕 需要创建新分类: [${missingKeys.join(', ')}]`);

      // 创建新分类数据
      const newCategories = missingKeys.map((key, index) => ({
        category_key: key,
        category_title: this.generateCategoryTitle(key),
        show_on_homepage: false, // 新分类默认不在主页显示
        display_order: 999 + index, // 新分类排在最后
        max_games: 6 // 默认最大游戏数
      }));

      // 批量插入新分类
      const { error: insertError } = await supabase
        .from('categories')
        .insert(newCategories);

      if (insertError) {
        this.log('warn', `⚠️ 创建新分类失败: ${insertError.message}`);
        
        // 尝试逐个插入
        for (const category of newCategories) {
          try {
            const { error: singleError } = await supabase
              .from('categories')
              .insert([category]);
            
            if (singleError) {
              this.log('error', `❌ 创建分类失败 "${category.category_key}": ${singleError.message}`);
            } else {
              this.log('info', `✅ 创建分类成功: "${category.category_key}" (${category.category_title})`);
            }
          } catch (singleException) {
            this.log('error', `❌ 创建分类异常 "${category.category_key}": ${singleException}`);
          }
        }
      } else {
        this.log('info', `✅ 成功创建 ${newCategories.length} 个新分类`);
        newCategories.forEach(cat => {
          this.log('info', `   📂 ${cat.category_title} (${cat.category_key})`);
        });
      }

    } catch (error) {
      this.log('error', `❌ 分类创建过程异常: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 🆕 生成分类标题
   */
  private generateCategoryTitle(categoryKey: string): string {
    // 将category_key转换为友好的显示标题
    // const titleMap: Record<string, string> = {
    //   'art': 'Art Games',
    //   'match-3': 'Match-3 Games',
    //   'simulation': 'Simulation Games',
    //   'strategy': 'Strategy Games',
    //   'role-playing': 'Role Playing Games',
    //   'tower-defense': 'Tower Defense Games',
    //   'racing': 'Racing Games',
    //   'fighting': 'Fighting Games',
    //   'platformer': 'Platform Games',
    //   'arcade': 'Arcade Games'
    // };

    // if (titleMap[categoryKey]) {
    //   return titleMap[categoryKey];
    // }

    // 自动生成标题：首字母大写 + " Games"
    const words = categoryKey.split('-');
    const capitalizedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    );
    return `${capitalizedWords.join(' ')} Games`;
  }

  /**
   * 阶段3: 事务批量处理
   */
  private async processBatchesWithTransaction(data: PreprocessResult): Promise<UploadResult> {
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
        const batchGameIds = gameBatch.map(game => game.id);
        const batchCategoryTags = categoryTags.filter(tag => batchGameIds.includes(tag.game_id));
        const batchNormalTags = normalTags.filter(tag => batchGameIds.includes(tag.game_id));
        const batchAllTags = [...batchCategoryTags, ...batchNormalTags];
        
        this.log('info', `📦 批次 ${batchNumber}: ${gameBatch.length}个游戏, ${batchAllTags.length}条标签数据`);
        
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
        
        this.updateProgress('games', batchNumber, gameBatches.length, {
          processed: processedGamesCount,
          errors: errorGamesCount,
          skipped: skippedGamesCount,
          tagsProcessed: totalTagsProcessed,
          tagsErrors: totalTagsErrors
        });
        
      } catch (error) {
        this.log('error', `❌ 批次 ${batchNumber} 处理失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorGamesCount += gameBatch.length;
        
        const failedGameIds = gameBatch.map(game => game.id);
        const failedTagsCount = [...categoryTags, ...normalTags]
          .filter(tag => failedGameIds.includes(tag.game_id)).length;
        totalTagsErrors += failedTagsCount;
      }
      
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
   * 插入游戏批次及其对应的标签数据
   */
  private async insertGameBatchWithTags(games: GameData[], tags: TagData[]) {
    // 插入游戏数据
    const { error: gamesError } = await supabase
      .from('games')
      .insert(games);
    
    if (gamesError) {
      throw new Error(`游戏数据插入失败: ${gamesError.message}`);
    }
    
    this.log('info', `✅ 成功插入 ${games.length} 个游戏`);
    
    let tagsSuccess = 0;
    let tagsErrors = 0;
    
    if (tags.length > 0) {
      // 分别统计分类和标签
      const categoryTags = tags.filter(tag => tag.tag_type === 1);
      const normalTags = tags.filter(tag => tag.tag_type === 2);
      
      this.log('info', `📋 开始插入标签数据: ${categoryTags.length} 个分类标签, ${normalTags.length} 个普通标签`);
      
      const tagBatchSize = 50;
      for (let i = 0; i < tags.length; i += tagBatchSize) {
        const tagsBatch = tags.slice(i, i + tagBatchSize);
        const batchCategories = tagsBatch.filter(tag => tag.tag_type === 1);
        const batchNormalTags = tagsBatch.filter(tag => tag.tag_type === 2);
        
        this.log('info', `📦 处理标签批次 ${Math.floor(i/tagBatchSize) + 1}: ${batchCategories.length} 个分类, ${batchNormalTags.length} 个标签`);
        
        try {
          const { error: tagsError } = await supabase
            .from('game_tags')
            .insert(tagsBatch);
          
          if (tagsError) {
            this.log('warn', `⚠️ 批量插入失败，尝试逐个插入: ${tagsError.message}`);
            
            // 逐个插入失败的标签
            for (const tag of tagsBatch) {
              try {
                const { error: singleTagError } = await supabase
                  .from('game_tags')
                  .insert([tag]);
                
                if (singleTagError) {
                  tagsErrors++;
                  const tagTypeText = tag.tag_type === 1 ? '分类' : '标签';
                  this.log('error', `❌ ${tagTypeText}插入失败: "${tag.tag}" (${tag.game_id}) - ${singleTagError.message}`);
                } else {
                  tagsSuccess++;
                  const tagTypeText = tag.tag_type === 1 ? '分类' : '标签';
                  this.log('info', `✅ ${tagTypeText}插入成功: "${tag.tag}"`);
                }
              } catch (singleError) {
                tagsErrors++;
                const tagTypeText = tag.tag_type === 1 ? '分类' : '标签';
                this.log('error', `❌ ${tagTypeText}插入异常: "${tag.tag}" - ${singleError}`);
              }
            }
          } else {
            tagsSuccess += tagsBatch.length;
            this.log('info', `✅ 批量插入成功: ${tagsBatch.length} 个标签`);
          }
        } catch (batchError) {
          tagsErrors += tagsBatch.length;
          this.log('error', `❌ 标签批次插入异常: ${batchError}`);
        }
      }
    }
    
    this.log('info', `📊 标签插入统计: 成功 ${tagsSuccess}, 失败 ${tagsErrors}`);
    
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
  private async validateUploadResults(parseResult: ParseResult, uploadResult: UploadResult) {
    this.log('info', '🔍 开始验证上传结果...');
    
    try {
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
        recommendations: [] as string[]
      };
      
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
      this.log('error', `验证过程出错: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: ['验证失败，建议手动检查数据库状态']
      };
    }
  }

  // ===== 工具函数 =====

  private mapCategory(category: string): string | null {
    if (!category) return null;
    
    const lowerCategory = category.toLowerCase().trim();
    
    if (this.categoryMapping[lowerCategory]) {
      return this.categoryMapping[lowerCategory];
    }
    
    for (const [key, value] of Object.entries(this.categoryMapping)) {
      if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
        return value;
      }
    }
    
    return lowerCategory;
  }

  private parseChineseDateFirst(chineseDateStr: unknown): string | null {
    if (!chineseDateStr || typeof chineseDateStr !== 'string') {
      return null;
    }
    
    try {
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
      
      const date = new Date(chineseDateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      
    } catch (error) {
      this.log('warn', `中文日期解析失败: ${chineseDateStr}`);
    }
    
    return null;
  }

  private convertExcelDate(dateValue: unknown): string | null {
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

  private validateHeaders(actualHeaders: unknown[], expectedHeaders: string[]) {
    if (!actualHeaders || actualHeaders.length === 0) {
      throw new Error('Excel文件表头为空');
    }
    const requiredFields = ['游戏名', '游戏id', 'embed'];
    const missing = requiredFields.filter(field => !actualHeaders.includes(field));
    if (missing.length > 0) {
      throw new Error(`缺少必需字段: ${missing.join(', ')}`);
    }
  }

  private isValidGameRow(row: ExcelRowData[]): boolean {
    return row && row.length >= 3 && Boolean(row[0]) && Boolean(row[1]) && Boolean(row[2]);
  }

  private cleanGameId(gameId: unknown): string {
    return gameId ? gameId.toString().trim().toLowerCase() : '';
  }

  private cleanText(text: unknown): string {
    return text ? text.toString().trim() : '';
  }

  private cleanUrl(url: unknown): string {
    return url ? url.toString().trim() : '';
  }

  private cleanTag(tag: unknown): string {
    return tag ? tag.toString().trim().toLowerCase() : '';
  }

  private calculateUniqueCategories(rows: ExcelRowData[][]): number {
    const categories = new Set();
    rows.forEach(row => {
      if (row[3] && typeof row[3] === 'string') {
        row[3].split(',').forEach((cat: string) => categories.add(cat.trim()));
      } else if (row[3]) {
        // 如果不是字符串，转换为字符串后再分割
        const categoryString = row[3].toString();
        if (categoryString && categoryString !== 'undefined' && categoryString !== 'null') {
          categoryString.split(',').forEach((cat: string) => categories.add(cat.trim()));
        }
      }
    });
    return categories.size;
  }

  private calculateUniqueTags(rows: ExcelRowData[][]): number {
    const tags = new Set();
    rows.forEach(row => {
      if (row[4] && typeof row[4] === 'string') {
        row[4].split(',').forEach((tag: string) => tags.add(tag.trim()));
      } else if (row[4]) {
        // 如果不是字符串，转换为字符串后再分割
        const tagString = row[4].toString();
        if (tagString && tagString !== 'undefined' && tagString !== 'null') {
          tagString.split(',').forEach((tag: string) => tags.add(tag.trim()));
        }
      }
    });
    return tags.size;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private async processBatchWithRetry<T>(operation: () => Promise<T>, maxRetries: number, delay: number): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        this.log('warn', `操作失败，第${attempt}次重试: ${error instanceof Error ? error.message : 'Unknown error'}`);
        await this.sleep(delay * Math.pow(2, attempt - 1));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updatePhase(phaseName: string, phaseNumber: number) {
    this.progressState.phase = phaseName;
    this.progressState.currentPhase = phaseNumber;
    this.log('info', `📋 阶段 ${phaseNumber}: ${phaseName}`);
  }

  private updateProgress(type: string, current: number, total: number, stats: { errors?: number; skipped?: number; processed?: number; tagsProcessed?: number; tagsErrors?: number } = {}) {
    this.progressState.current.processed = current;
    this.progressState.current.total = total;
    
    if (this.enableProgressLog) {
      const percentage = ((current / total) * 100).toFixed(1);
      this.log('info', `📊 ${type} 进度: ${current}/${total} (${percentage}%)`);
      
      if (stats.errors && stats.errors > 0) {
        this.log('warn', `⚠️ 错误: ${stats.errors}, 跳过: ${stats.skipped || 0}`);
      }
    }
  }

  private log(level: string, message: string) {
    const timestamp = new Date().toISOString();
    // 只输出错误级别的日志到控制台
    if (level === 'error') {
      console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  private generateFinalReport(parseResult: ParseResult, preprocessResult: PreprocessResult, uploadResult: UploadResult, validationResult: { success: boolean; details?: unknown; recommendations?: string[]; error?: string }) {
    const endTime = Date.now();
    const duration = endTime - (this.progressState.overall.startTime || endTime);
    
    return {
      summary: {
        status: validationResult.success ? 'success' : 'partial_success',
        startTime: new Date(this.progressState.overall.startTime || endTime).toISOString(),
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