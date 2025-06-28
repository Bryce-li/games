// 数据库查询函数 - 替代原始的games.ts静态数据

import { supabase } from './supabase'

// 数据库行的类型定义 - 已优化：移除game_id字段
interface DatabaseGameRow {
  id: string; // 现在直接使用UUID主键
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  embed_url: string;
  category: string;
  is_original?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  publish_date?: string;
  last_updated?: string;
  instructions?: string;
  created_at?: string;
}

// 英雄游戏关联查询的类型定义 - 已优化：game_id现在是UUID
interface HeroGameQueryRow {
  game_id: string; // UUID外键
  display_order: number;
  games: {
    id: string; // 游戏主键
    title: string;
    description?: string;
    image_url?: string;
    thumbnail_url?: string;
    category: string;
    is_new?: boolean;
    is_hot?: boolean;
    is_original?: boolean;
  };
}

// 保持原有的接口定义以确保兼容性
export interface BaseGame {
  id: string;
  title: string;
  image: string;
  category: string;
  tags: string[];
  isOriginal?: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

export interface GameConfig extends BaseGame {
  description: string;
  embedUrl: string;
  thumbnail: string;
  publishDate?: string;
  lastUpdated?: string;
  instructions: string;
}

export interface HeroGame extends BaseGame {
  description: string;
}

export interface HomepageCategoryConfig {
  key: string;
  title: string;
  showOnHomepage: boolean;
  order: number;
  maxGames?: number;
}

// 游戏分类映射（保持静态配置）
export const gameCategories = {
  action: "Action",
  adventure: "Adventure", 
  basketball: "Basketball",
  beauty: "Beauty",
  bike: "Bike",
  car: "Car",
  card: "Card",
  casual: "Casual",
  clicker: "Clicker",
  controller: "Controller",
  dressUp: "Dress Up",
  driving: "Driving",
  escape: "Escape",
  flash: "Flash",
  fps: "FPS",
  horror: "Horror",
  io: ".io",
  mahjong: "Mahjong",
  minecraft: "Minecraft",
  pool: "Pool",
  puzzle: "Puzzle",
  shooting: "Shooting",
  soccer: "Soccer",
  sports: "Sports",
  stickman: "Stickman",
  towerDefense: "Tower Defense"
} as const;

/**
 * 数据库行转换为BaseGame格式 - 已优化：直接使用主键id
 */
function dbRowToBaseGame(row: DatabaseGameRow, tags: string[] = []): BaseGame {
  return {
    id: row.id, // 直接使用主键
    title: row.title,
    image: row.image_url || row.thumbnail_url || '',
    category: row.category,
    tags: tags,
    isOriginal: row.is_original,
    isNew: row.is_new,
    isHot: row.is_hot
  };
}

/**
 * 数据库行转换为GameConfig格式 - 已优化：直接使用主键id
 */
function dbRowToGameConfig(row: DatabaseGameRow, tags: string[] = []): GameConfig {
  return {
    id: row.id, // 直接使用主键
    title: row.title,
    description: row.description || '',
    image: row.image_url || row.thumbnail_url || '',
    embedUrl: row.embed_url,
    thumbnail: row.thumbnail_url || row.image_url || '',
    category: row.category,
    tags: tags,
    isOriginal: row.is_original,
    isNew: row.is_new,
    isHot: row.is_hot,
    publishDate: row.publish_date ? new Date(row.publish_date).toISOString().split('T')[0] : undefined,
    lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString().split('T')[0] : undefined,
    instructions: row.instructions || ''
  };
}

/**
 * 数据库行转换为HeroGame格式 - 已优化：直接使用主键id
 */
function dbRowToHeroGame(row: DatabaseGameRow, tags: string[] = []): HeroGame {
  return {
    id: row.id, // 直接使用主键
    title: row.title,
    description: row.description || '',
    image: row.image_url || row.thumbnail_url || '',
    category: gameCategories[row.category as keyof typeof gameCategories] || row.category,
    tags: tags,
    isOriginal: row.is_original,
    isNew: row.is_new,
    isHot: row.is_hot
  };
}

/**
 * 英雄游戏关联查询结果转换为HeroGame格式 - 已优化
 */
function heroQueryRowToHeroGame(queryRow: HeroGameQueryRow, tags: string[] = []): HeroGame {
  const gameData = queryRow.games;
  return {
    id: gameData.id, // 使用关联的games表主键
    title: gameData.title,
    description: gameData.description || '',
    image: gameData.image_url || gameData.thumbnail_url || '',
    category: gameCategories[gameData.category as keyof typeof gameCategories] || gameData.category,
    tags: tags,
    isOriginal: gameData.is_original,
    isNew: gameData.is_new,
    isHot: gameData.is_hot
  };
}

/**
 * 获取游戏的标签 - 已优化：使用UUID关联
 */
async function getGameTags(gameId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('tag')
      .eq('game_id', gameId); // game_id现在是UUID
    
    if (error) {
      console.error('获取游戏标签失败:', error.message);
      return [];
    }
    
    return data?.map(row => row.tag) || [];
  } catch (error) {
    console.error('获取游戏标签时出错:', error);
    return [];
  }
}

/**
 * 批量获取多个游戏的标签 - 已优化：使用UUID关联
 */
async function getBatchGameTags(gameIds: string[]): Promise<Record<string, string[]>> {
  if (gameIds.length === 0) return {};
  
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('game_id, tag')
      .in('game_id', gameIds); // game_id现在是UUID数组
    
    if (error) {
      console.error('批量获取游戏标签失败:', error.message);
      return {};
    }
    
    const tagsMap: Record<string, string[]> = {};
    data?.forEach(row => {
      if (!tagsMap[row.game_id]) {
        tagsMap[row.game_id] = [];
      }
      tagsMap[row.game_id].push(row.tag);
    });
    
    return tagsMap;
  } catch (error) {
    console.error('批量获取游戏标签时出错:', error);
    return {};
  }
}

/**
 * 按分类获取游戏列表
 */
export async function getGamesByCategory(category: string): Promise<BaseGame[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('category', category.toLowerCase())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('按分类获取游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取标签 - 使用主键id
    const gameIds = data.map(game => game.id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.id] || []));
  } catch (error) {
    console.error('按分类获取游戏时出错:', error);
    return [];
  }
}

/**
 * 获取新游戏
 */
export async function getNewGames(): Promise<BaseGame[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_new', true)
      .order('publish_date', { ascending: false });
    
    if (error) {
      console.error('获取新游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取标签
    const gameIds = data.map(game => game.id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.id] || []));
  } catch (error) {
    console.error('获取新游戏时出错:', error);
    return [];
  }
}

/**
 * 获取热门游戏
 */
export async function getHotGames(): Promise<BaseGame[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_hot', true)
      .order('publish_date', { ascending: false });
    
    if (error) {
      console.error('获取热门游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取标签
    const gameIds = data.map(game => game.id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.id] || []));
  } catch (error) {
    console.error('获取热门游戏时出错:', error);
    return [];
  }
}

/**
 * 获取推荐游戏
 */
export async function getRecommendedGames(currentGameId: string, limit: number = 8): Promise<GameConfig[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .neq('id', currentGameId) // 使用主键排除当前游戏
      .order('publish_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取推荐游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取标签
    const gameIds = data.map(game => game.id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToGameConfig(row, tagsMap[row.id] || []));
  } catch (error) {
    console.error('获取推荐游戏时出错:', error);
    return [];
  }
}

/**
 * 获取相关游戏
 */
export async function getRelatedGames(category: string, currentGameId: string, limit: number = 8): Promise<GameConfig[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('category', category.toLowerCase())
      .neq('id', currentGameId) // 使用主键排除当前游戏
      .order('publish_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取相关游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取标签
    const gameIds = data.map(game => game.id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToGameConfig(row, tagsMap[row.id] || []));
  } catch (error) {
    console.error('获取相关游戏时出错:', error);
    return [];
  }
}

/**
 * 获取游戏配置 - 已优化：使用主键查询
 */
export async function getGameConfig(gameId: string): Promise<GameConfig | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId) // 直接使用主键查询
      .single();
    
    if (error) {
      console.error('获取游戏配置失败:', error.message);
      return null;
    }
    
    if (!data) return null;
    
    // 获取标签
    const tags = await getGameTags(gameId);
    
    return dbRowToGameConfig(data, tags);
  } catch (error) {
    console.error('获取游戏配置时出错:', error);
    return null;
  }
}

/**
 * 获取所有游戏
 */
export async function getAllGames(): Promise<BaseGame[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取所有游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取标签
    const gameIds = data.map(game => game.id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.id] || []));
  } catch (error) {
    console.error('获取所有游戏时出错:', error);
    return [];
  }
}

/**
 * 搜索游戏
 */
export async function searchGames(query: string, limit: number = 10): Promise<BaseGame[]> {
  try {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return getAllGames();
    }
    
    // 先按标题和描述搜索
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .limit(limit);
    
    if (error) {
      console.error('搜索游戏失败:', error.message);
      return [];
    }
    
    let results: BaseGame[] = [];
    
    if (data && data.length > 0) {
      // 批量获取标签
      const gameIds = data.map(game => game.id);
      const tagsMap = await getBatchGameTags(gameIds);
      
      results = data.map(row => dbRowToBaseGame(row, tagsMap[row.id] || []));
    }
    
    // 如果结果不够，补充标签搜索
    if (results.length < limit) {
      const tagResults = await searchGamesByTags(searchTerm, limit - results.length);
      
      // 去重合并结果
      const existingIds = new Set(results.map(game => game.id));
      const newResults = tagResults.filter(game => !existingIds.has(game.id));
      
      results = [...results, ...newResults].slice(0, limit);
    }
    
    return results;
  } catch (error) {
    console.error('搜索游戏时出错:', error);
    return [];
  }
}

/**
 * 按标签搜索游戏
 */
async function searchGamesByTags(searchTerm: string, limit: number = 10): Promise<BaseGame[]> {
  try {
    const { data: tagData, error: tagError } = await supabase
      .from('game_tags')
      .select('game_id') // game_id现在是UUID
      .ilike('tag', `%${searchTerm}%`);
    
    if (tagError || !tagData || tagData.length === 0) {
      return [];
    }
    
    // 去重游戏ID
    const gameIds = [...new Set(tagData.map(row => row.game_id))];
    
    if (gameIds.length === 0) return [];
    
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .in('id', gameIds) // 使用主键查询
      .limit(limit);
    
    if (gameError || !gameData) {
      return [];
    }
    
    // 批量获取标签
    const tagsMap = await getBatchGameTags(gameData.map(game => game.id));
    
    return gameData.map(row => dbRowToBaseGame(row, tagsMap[row.id] || []));
  } catch (error) {
    console.error('按标签搜索游戏时出错:', error);
    return [];
  }
}

/**
 * 获取主页分类配置
 */
export async function getHomepageCategories(): Promise<HomepageCategoryConfig[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('show_on_homepage', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('获取主页分类失败:', error.message);
      return [];
    }
    
    return data?.map(row => ({
      key: row.category_key,
      title: row.category_title,
      showOnHomepage: row.show_on_homepage,
      order: row.display_order,
      maxGames: row.max_games
    })) || [];
  } catch (error) {
    console.error('获取主页分类时出错:', error);
    return [];
  }
}

/**
 * 获取指定分类的游戏数据
 */
export async function getHomepageCategoryData(categoryKey: string, maxGames?: number): Promise<BaseGame[]> {
  try {
    return await getGamesByCategory(categoryKey);
  } catch (error) {
    console.error('获取分类游戏数据时出错:', error);
    return [];
  }
}

/**
 * 获取所有主页分类数据
 */
export async function getAllHomepageCategoryData(): Promise<Record<string, { config: HomepageCategoryConfig; games: BaseGame[] }>> {
  try {
    const categories = await getHomepageCategories();
    const result: Record<string, { config: HomepageCategoryConfig; games: BaseGame[] }> = {};
    
    for (const config of categories) {
      const games = await getHomepageCategoryData(config.key, config.maxGames);
      result[config.key] = { config, games };
    }
    
    return result;
  } catch (error) {
    console.error('获取所有主页分类数据时出错:', error);
    return {};
  }
}

/**
 * 获取英雄区游戏 - 已优化：使用UUID关联
 */
export async function getHeroGames(): Promise<HeroGame[]> {
  try {
    const { data, error } = await supabase
      .from('hero_games')
      .select(`
        game_id,
        display_order,
        games!inner (
          id,
          title,
          description,
          image_url,
          thumbnail_url,
          category,
          is_new,
          is_hot,
          is_original
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('获取英雄区游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取标签 - 使用关联的games表id
    const gameIds = data.map((row: unknown) => (row as { games: { id: string } }).games.id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map((row: unknown) => {
      const typedRow = row as { game_id: string; games: {
        id: string; title: string; description?: string;
        image_url?: string; thumbnail_url?: string; category: string;
        is_new?: boolean; is_hot?: boolean; is_original?: boolean;
      }};
      
      const gameData = typedRow.games;
      return {
        id: gameData.id,
        title: gameData.title,
        description: gameData.description || '',
        image: gameData.image_url || gameData.thumbnail_url || '',
        category: gameCategories[gameData.category as keyof typeof gameCategories] || gameData.category,
        tags: tagsMap[gameData.id] || [],
        isOriginal: gameData.is_original,
        isNew: gameData.is_new,
        isHot: gameData.is_hot
      };
    });
  } catch (error) {
    console.error('获取英雄区游戏时出错:', error);
    return [];
  }
}

/**
 * 更新分类显示状态
 */
export async function updateCategoryVisibility(categoryKey: string, showOnHomepage: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ show_on_homepage: showOnHomepage })
      .eq('category_key', categoryKey);
    
    if (error) {
      console.error('更新分类显示状态失败:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('更新分类显示状态时出错:', error);
    return false;
  }
}

/**
 * 批量更新分类显示状态
 */
export async function updateMultipleCategoriesVisibility(updates: Record<string, boolean>): Promise<void> {
  try {
    for (const [categoryKey, showOnHomepage] of Object.entries(updates)) {
      await updateCategoryVisibility(categoryKey, showOnHomepage);
    }
  } catch (error) {
    console.error('批量更新分类显示状态时出错:', error);
  }
}

/**
 * 获取分类显示状态
 */
export async function getCategoryVisibilityStatus(): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('category_key, show_on_homepage');
    
    if (error) {
      console.error('获取分类显示状态失败:', error.message);
      return {};
    }
    
    const result: Record<string, boolean> = {};
    data?.forEach(row => {
      result[row.category_key] = row.show_on_homepage;
    });
    
    return result;
  } catch (error) {
    console.error('获取分类显示状态时出错:', error);
    return {};
  }
} 