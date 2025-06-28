// 数据库查询函数 - 替代原始的games.ts静态数据

import { supabase } from './supabase'

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
 * 数据库行转换为BaseGame格式
 */
function dbRowToBaseGame(row: any, tags: string[] = []): BaseGame {
  return {
    id: row.game_id,
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
 * 数据库行转换为GameConfig格式
 */
function dbRowToGameConfig(row: any, tags: string[] = []): GameConfig {
  return {
    id: row.game_id,
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
 * 数据库行转换为HeroGame格式
 */
function dbRowToHeroGame(row: any, tags: string[] = []): HeroGame {
  return {
    id: row.game_id,
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
 * 获取游戏的标签
 */
async function getGameTags(gameId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('tag')
      .eq('game_id', gameId);
    
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
 * 批量获取多个游戏的标签
 */
async function getBatchGameTags(gameIds: string[]): Promise<Record<string, string[]>> {
  if (gameIds.length === 0) return {};
  
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('game_id, tag')
      .in('game_id', gameIds);
    
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
    
    // 批量获取标签
    const gameIds = data.map(game => game.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.game_id] || []));
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
    
    const gameIds = data.map(game => game.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.game_id] || []));
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
      .order('last_updated', { ascending: false });
    
    if (error) {
      console.error('获取热门游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    const gameIds = data.map(game => game.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.game_id] || []));
  } catch (error) {
    console.error('获取热门游戏时出错:', error);
    return [];
  }
}

/**
 * 获取推荐游戏（排除当前游戏）
 */
export async function getRecommendedGames(currentGameId: string, limit: number = 8): Promise<GameConfig[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .neq('game_id', currentGameId)
      .order('last_updated', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取推荐游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    const gameIds = data.map(game => game.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToGameConfig(row, tagsMap[row.game_id] || []));
  } catch (error) {
    console.error('获取推荐游戏时出错:', error);
    return [];
  }
}

/**
 * 根据分类获取相关游戏
 */
export async function getRelatedGames(category: string, currentGameId: string, limit: number = 8): Promise<GameConfig[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('category', category)
      .neq('game_id', currentGameId)
      .order('last_updated', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取相关游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    const gameIds = data.map(game => game.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToGameConfig(row, tagsMap[row.game_id] || []));
  } catch (error) {
    console.error('获取相关游戏时出错:', error);
    return [];
  }
}

/**
 * 获取游戏配置
 */
export async function getGameConfig(gameId: string): Promise<GameConfig | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();
    
    if (error) {
      console.error('获取游戏配置失败:', error.message);
      return null;
    }
    
    if (!data) return null;
    
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
    
    const gameIds = data.map(game => game.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.game_id] || []));
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
    const searchTerm = query.toLowerCase();
    
    // 使用ilike进行大小写不敏感的搜索
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('last_updated', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('搜索游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) {
      // 如果没有找到结果，尝试通过标签搜索
      return await searchGamesByTags(searchTerm, limit);
    }
    
    const gameIds = data.map(game => game.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data.map(row => dbRowToBaseGame(row, tagsMap[row.game_id] || []));
  } catch (error) {
    console.error('搜索游戏时出错:', error);
    return [];
  }
}

/**
 * 通过标签搜索游戏
 */
async function searchGamesByTags(searchTerm: string, limit: number = 10): Promise<BaseGame[]> {
  try {
    const { data: tagData, error: tagError } = await supabase
      .from('game_tags')
      .select('game_id')
      .ilike('tag', `%${searchTerm}%`)
      .limit(limit);
    
    if (tagError || !tagData || tagData.length === 0) {
      return [];
    }
    
    const gameIds = [...new Set(tagData.map(row => row.game_id))]; // 去重
    
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .in('game_id', gameIds)
      .order('last_updated', { ascending: false });
    
    if (gameError || !gameData) {
      return [];
    }
    
    const tagsMap = await getBatchGameTags(gameIds);
    
    return gameData.map(row => dbRowToBaseGame(row, tagsMap[row.game_id] || []));
  } catch (error) {
    console.error('通过标签搜索游戏时出错:', error);
    return [];
  }
}

/**
 * 获取主页显示的分类配置
 */
export async function getHomepageCategories(): Promise<HomepageCategoryConfig[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('show_on_homepage', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('获取主页分类配置失败:', error.message);
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
    console.error('获取主页分类配置时出错:', error);
    return [];
  }
}

/**
 * 获取主页分类游戏数据
 */
export async function getHomepageCategoryData(categoryKey: string, maxGames?: number): Promise<BaseGame[]> {
  const games = await getGamesByCategory(categoryKey);
  const limit = maxGames || 8;
  return games.slice(0, limit);
}

/**
 * 获取所有主页分类的游戏数据
 */
export async function getAllHomepageCategoryData(): Promise<Record<string, { config: HomepageCategoryConfig; games: BaseGame[] }>> {
  const result: Record<string, { config: HomepageCategoryConfig; games: BaseGame[] }> = {};
  
  const categories = await getHomepageCategories();
  
  for (const config of categories) {
    const games = await getHomepageCategoryData(config.key, config.maxGames);
    if (games.length > 0) {
      result[config.key] = {
        config,
        games
      };
    }
  }
  
  return result;
}

/**
 * 获取英雄区游戏数据
 */
export async function getHeroGames(): Promise<HeroGame[]> {
  try {
    const { data, error } = await supabase
      .from('hero_games')
      .select(`
        game_id,
        display_order,
        games (
          game_id,
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
    
    const gameIds = data.map(row => row.game_id);
    const tagsMap = await getBatchGameTags(gameIds);
    
    return data
      .filter(row => row.games) // 确保关联的游戏存在
      .map(row => dbRowToHeroGame(row.games, tagsMap[row.game_id] || []));
  } catch (error) {
    console.error('获取英雄区游戏时出错:', error);
    return [];
  }
}

/**
 * 更新分类显示状态（管理功能）
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
    
    console.log(`📝 分类 "${categoryKey}" 主页显示状态已更新为: ${showOnHomepage ? '显示' : '隐藏'}`);
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
  for (const [categoryKey, showOnHomepage] of Object.entries(updates)) {
    await updateCategoryVisibility(categoryKey, showOnHomepage);
  }
}

/**
 * 获取当前分类显示状态概览
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
    
    const status: Record<string, boolean> = {};
    data?.forEach(row => {
      status[row.category_key] = row.show_on_homepage;
    });
    
    return status;
  } catch (error) {
    console.error('获取分类显示状态时出错:', error);
    return {};
  }
} 