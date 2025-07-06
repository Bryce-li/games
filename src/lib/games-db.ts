// 数据库查询函数 - 替代原始的games.ts静态数据

import { supabase } from './supabase/client'

// 数据库行的类型定义
interface DatabaseGameRow {
  id: string; // UUID主键
  game_id: string; // 业务标识符，如"cat-mini-restaurant"
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

// 英雄游戏关联查询的类型定义
interface HeroGameQueryRow {
  game_id: string; // UUID外键
  display_order: number;
  games: {
    id: string; // 游戏UUID主键
    game_id: string; // 游戏业务标识符
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
 * 数据库行转换为BaseGame格式 - 使用game_id作为业务标识符
 */
function dbRowToBaseGame(row: DatabaseGameRow, tags: string[] = []): BaseGame {
  return {
    id: row.game_id, // 使用game_id作为业务标识符
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
    id: row.game_id, // 使用game_id作为业务标识符
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
 * 数据库行转换为HeroGame格式 - 使用game_id作为业务标识符
 */
function dbRowToHeroGame(row: DatabaseGameRow, tags: string[] = []): HeroGame {
  return {
    id: row.game_id, // 使用game_id作为业务标识符
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
 * 英雄游戏关联查询结果转换为HeroGame格式 - 使用game_id作为业务标识符
 */
function heroQueryRowToHeroGame(queryRow: HeroGameQueryRow, tags: string[] = []): HeroGame {
  const gameData = queryRow.games;
  return {
    id: gameData.game_id, // 使用game_id作为业务标识符
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
 * 获取游戏的分类 - 从game_tags表查询tag_type=1的记录
 */
async function getGameCategories(gameId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('tag')
      .eq('game_id', gameId)
      .eq('tag_type', 1); // 1=分类
    
    if (error) {
      console.error('获取游戏分类失败:', error.message);
      return [];
    }
    
    return data?.map(row => row.tag) || [];
  } catch (error) {
    console.error('获取游戏分类时出错:', error);
    return [];
  }
}

/**
 * 获取游戏的标签 - 从game_tags表查询tag_type=2的记录
 */
async function getGameTags(gameId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('tag')
      .eq('game_id', gameId)
      .eq('tag_type', 2); // 2=标签
    
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
 * 批量获取多个游戏的分类 - 从game_tags表查询tag_type=1的记录
 */
async function getBatchGameCategories(gameIds: string[]): Promise<Record<string, string[]>> {
  if (gameIds.length === 0) return {};
  
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('game_id, tag')
      .in('game_id', gameIds)
      .eq('tag_type', 1); // 1=分类
    
    if (error) {
      console.error('批量获取游戏分类失败:', error.message);
      return {};
    }
    
    const categoriesMap: Record<string, string[]> = {};
    data?.forEach(row => {
      if (!categoriesMap[row.game_id]) {
        categoriesMap[row.game_id] = [];
      }
      categoriesMap[row.game_id].push(row.tag);
    });
    
    return categoriesMap;
  } catch (error) {
    console.error('批量获取游戏分类时出错:', error);
    return {};
  }
}

/**
 * 批量获取多个游戏的标签 - 从game_tags表查询tag_type=2的记录
 */
async function getBatchGameTags(gameIds: string[]): Promise<Record<string, string[]>> {
  if (gameIds.length === 0) return {};
  
  try {
    const { data, error } = await supabase
      .from('game_tags')
      .select('game_id, tag')
      .in('game_id', gameIds)
      .eq('tag_type', 2); // 2=标签
    
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
 * 按分类获取游戏列表 - 通过game_tags表查询
 */
export async function getGamesByCategory(category: string): Promise<BaseGame[]> {
  try {
    // 先从game_tags表获取属于该分类的游戏ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('game_tags')
      .select('game_id')
      .eq('tag', category.toLowerCase())
      .eq('tag_type', 1); // 1=分类
    
    if (categoryError) {
      console.error('查询分类失败:', categoryError.message);
      return [];
    }
    
    if (!categoryData || categoryData.length === 0) return [];
    
    // 获取游戏ID列表
    const gameIds = categoryData.map(item => item.game_id);
    
    // 根据游戏ID获取游戏详细信息
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .in('id', gameIds)
      .order('created_at', { ascending: false });
    
    if (gamesError) {
      console.error('获取游戏详情失败:', gamesError.message);
      return [];
    }
    
    if (!gamesData || gamesData.length === 0) return [];
    
    // 批量获取分类和标签
    const actualGameIds = gamesData.map(game => game.id);
    const [categoriesMap, tagsMap] = await Promise.all([
      getBatchGameCategories(actualGameIds),
      getBatchGameTags(actualGameIds)
    ]);
    
    return gamesData.map(row => {
      const categories = categoriesMap[row.id] || [];
      const tags = tagsMap[row.id] || [];
      const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
      
      return {
        id: row.game_id, // 使用game_id作为业务标识符
        title: row.title,
        image: row.image_url || row.thumbnail_url || '',
        category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
        tags: [...categories, ...tags], // 合并分类和标签
        isOriginal: row.is_original,
        isNew: row.is_new,
        isHot: row.is_hot
      };
    });
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
    
    // 批量获取分类和标签
    const gameIds = data.map(game => game.id);
    const [categoriesMap, tagsMap] = await Promise.all([
      getBatchGameCategories(gameIds),
      getBatchGameTags(gameIds)
    ]);
    
    return data.map(row => {
      const categories = categoriesMap[row.id] || [];
      const tags = tagsMap[row.id] || [];
      const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
      
      return {
        id: row.game_id, // 使用game_id作为业务标识符
        title: row.title,
        image: row.image_url || row.thumbnail_url || '',
        category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
        tags: [...categories, ...tags], // 合并分类和标签
        isOriginal: row.is_original,
        isNew: row.is_new,
        isHot: row.is_hot
      };
    });
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
    
    // 批量获取分类和标签
    const gameIds = data.map(game => game.id);
    const [categoriesMap, tagsMap] = await Promise.all([
      getBatchGameCategories(gameIds),
      getBatchGameTags(gameIds)
    ]);
    
    return data.map(row => {
      const categories = categoriesMap[row.id] || [];
      const tags = tagsMap[row.id] || [];
      const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
      
      return {
        id: row.game_id, // 使用game_id作为业务标识符
        title: row.title,
        image: row.image_url || row.thumbnail_url || '',
        category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
        tags: [...categories, ...tags], // 合并分类和标签
        isOriginal: row.is_original,
        isNew: row.is_new,
        isHot: row.is_hot
      };
    });
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
      .neq('game_id', currentGameId) // 使用game_id排除当前游戏
      .order('publish_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取推荐游戏失败:', error.message);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // 批量获取分类和标签
    const gameIds = data.map(game => game.id);
    const [categoriesMap, tagsMap] = await Promise.all([
      getBatchGameCategories(gameIds),
      getBatchGameTags(gameIds)
    ]);
    
    return data.map(row => {
      const categories = categoriesMap[row.id] || [];
      const tags = tagsMap[row.id] || [];
      const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
      
      return {
        id: row.game_id, // 使用game_id作为业务标识符
        title: row.title,
        description: row.description || '',
        image: row.image_url || row.thumbnail_url || '',
        embedUrl: row.embed_url,
        thumbnail: row.thumbnail_url || row.image_url || '',
        category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
        tags: [...categories, ...tags], // 合并分类和标签
        isOriginal: row.is_original,
        isNew: row.is_new,
        isHot: row.is_hot,
        publishDate: row.publish_date ? new Date(row.publish_date).toISOString().split('T')[0] : undefined,
        lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString().split('T')[0] : undefined,
        instructions: row.instructions || ''
      };
    });
  } catch (error) {
    console.error('获取推荐游戏时出错:', error);
    return [];
  }
}

/**
 * 获取相关游戏 - 通过game_tags表查询同分类游戏
 */
export async function getRelatedGames(category: string, currentGameId: string, limit: number = 8): Promise<GameConfig[]> {
  try {
    // 先从game_tags表获取属于该分类的游戏ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('game_tags')
      .select('game_id')
      .eq('tag', category.toLowerCase())
      .eq('tag_type', 1); // 1=分类
    
    if (categoryError) {
      console.error('查询相关游戏分类失败:', categoryError.message);
      return [];
    }
    
    if (!categoryData || categoryData.length === 0) return [];
    
    // 获取游戏UUID列表
    const gameUUIDs = categoryData.map(item => item.game_id);
    
    if (gameUUIDs.length === 0) return [];
    
    // 根据游戏UUID获取游戏详细信息，然后排除当前游戏
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .in('id', gameUUIDs)
      .neq('game_id', currentGameId) // 通过game_id排除当前游戏
      .order('publish_date', { ascending: false })
      .limit(limit);
    
    if (gamesError) {
      console.error('获取相关游戏详情失败:', gamesError.message);
      return [];
    }
    
    if (!gamesData || gamesData.length === 0) return [];
    
    // 批量获取分类和标签
    const actualGameIds = gamesData.map(game => game.id);
    const [categoriesMap, tagsMap] = await Promise.all([
      getBatchGameCategories(actualGameIds),
      getBatchGameTags(actualGameIds)
    ]);
    
    return gamesData.map(row => {
      const categories = categoriesMap[row.id] || [];
      const tags = tagsMap[row.id] || [];
      const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
      
      return {
        id: row.game_id, // 使用game_id作为业务标识符
        title: row.title,
        description: row.description || '',
        image: row.image_url || row.thumbnail_url || '',
        embedUrl: row.embed_url,
        thumbnail: row.thumbnail_url || row.image_url || '',
        category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
        tags: [...categories, ...tags], // 合并分类和标签
        isOriginal: row.is_original,
        isNew: row.is_new,
        isHot: row.is_hot,
        publishDate: row.publish_date ? new Date(row.publish_date).toISOString().split('T')[0] : undefined,
        lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString().split('T')[0] : undefined,
        instructions: row.instructions || ''
      };
    });
  } catch (error) {
    console.error('获取相关游戏时出错:', error);
    return [];
  }
}

/**
 * 获取游戏配置 - 通过game_id查询（业务标识符）
 */
export async function getGameConfig(gameId: string): Promise<GameConfig | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId) // 改为使用game_id字段查询
      .single();
    
    if (error) {
      console.error('获取游戏配置失败:', error.message);
      return null;
    }
    
    if (!data) return null;
    
    // 获取分类和标签（使用UUID id）
    const [categories, tags] = await Promise.all([
      getGameCategories(data.id), // 这里使用UUID
      getGameTags(data.id) // 这里使用UUID
    ]);
    
    const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
    
    return {
      id: data.game_id, // 返回game_id作为业务标识符
      title: data.title,
      description: data.description || '',
      image: data.image_url || data.thumbnail_url || '',
      embedUrl: data.embed_url,
      thumbnail: data.thumbnail_url || data.image_url || '',
      category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
      tags: [...categories, ...tags], // 合并分类和标签
      isOriginal: data.is_original,
      isNew: data.is_new,
      isHot: data.is_hot,
      publishDate: data.publish_date ? new Date(data.publish_date).toISOString().split('T')[0] : undefined,
      lastUpdated: data.last_updated ? new Date(data.last_updated).toISOString().split('T')[0] : undefined,
      instructions: data.instructions || ''
    };
  } catch (error) {
    console.error('获取游戏配置时出错:', error);
    return null;
  }
}

/**
 * 通过UUID获取游戏配置（内部使用）
 */
export async function getGameConfigById(uuid: string): Promise<GameConfig | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', uuid) // 使用UUID查询
      .single();
    
    if (error) {
      console.error('通过UUID获取游戏配置失败:', error.message);
      return null;
    }
    
    if (!data) return null;
    
    // 获取分类和标签
    const [categories, tags] = await Promise.all([
      getGameCategories(uuid),
      getGameTags(uuid)
    ]);
    
    const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
    
    return {
      id: data.game_id, // 返回game_id作为业务标识符
      title: data.title,
      description: data.description || '',
      image: data.image_url || data.thumbnail_url || '',
      embedUrl: data.embed_url,
      thumbnail: data.thumbnail_url || data.image_url || '',
      category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
      tags: [...categories, ...tags], // 合并分类和标签
      isOriginal: data.is_original,
      isNew: data.is_new,
      isHot: data.is_hot,
      publishDate: data.publish_date ? new Date(data.publish_date).toISOString().split('T')[0] : undefined,
      lastUpdated: data.last_updated ? new Date(data.last_updated).toISOString().split('T')[0] : undefined,
      instructions: data.instructions || ''
    };
  } catch (error) {
    console.error('通过UUID获取游戏配置时出错:', error);
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
    
    // 批量获取分类和标签
    const gameIds = data.map(game => game.id);
    const [categoriesMap, tagsMap] = await Promise.all([
      getBatchGameCategories(gameIds),
      getBatchGameTags(gameIds)
    ]);
    
    return data.map(row => {
      const categories = categoriesMap[row.id] || [];
      const tags = tagsMap[row.id] || [];
      const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
      
      return {
        id: row.game_id, // 使用game_id作为业务标识符
        title: row.title,
        image: row.image_url || row.thumbnail_url || '',
        category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
        tags: [...categories, ...tags], // 合并分类和标签
        isOriginal: row.is_original,
        isNew: row.is_new,
        isHot: row.is_hot
      };
    });
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
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(limit);
    
    if (error) {
      console.error('搜索游戏失败:', error.message);
      return [];
    }
    
    let results: BaseGame[] = [];
    
    if (data && data.length > 0) {
      // 批量获取分类和标签
      const gameIds = data.map(game => game.id);
      const [categoriesMap, tagsMap] = await Promise.all([
        getBatchGameCategories(gameIds),
        getBatchGameTags(gameIds)
      ]);
      
      results = data.map(row => {
        const categories = categoriesMap[row.id] || [];
        const tags = tagsMap[row.id] || [];
        const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
        
        return {
          id: row.game_id, // 使用game_id作为业务标识符
          title: row.title,
          image: row.image_url || row.thumbnail_url || '',
          category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
          tags: [...categories, ...tags], // 合并分类和标签
          isOriginal: row.is_original,
          isNew: row.is_new,
          isHot: row.is_hot
        };
      });
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
    
    // 批量获取分类和标签
    const actualGameIds = gameData.map(game => game.id);
    const [categoriesMap, tagsMap] = await Promise.all([
      getBatchGameCategories(actualGameIds),
      getBatchGameTags(actualGameIds)
    ]);
    
    return gameData.map(row => {
      const categories = categoriesMap[row.id] || [];
      const tags = tagsMap[row.id] || [];
      const primaryCategory = categories.length > 0 ? categories[0] : 'casual'; // 默认分类
      
      return {
        id: row.game_id, // 使用game_id作为业务标识符
        title: row.title,
        image: row.image_url || row.thumbnail_url || '',
        category: gameCategories[primaryCategory as keyof typeof gameCategories] || primaryCategory,
        tags: [...categories, ...tags], // 合并分类和标签
        isOriginal: row.is_original,
        isNew: row.is_new,
        isHot: row.is_hot
      };
    });
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
 * 获取英雄区游戏 - 已优化：使用UUID关联（手动JOIN查询）
 */
export async function getHeroGames(): Promise<HeroGame[]> {
  try {
    // 第一步：获取英雄区配置
    const { data: heroData, error: heroError } = await supabase
      .from('hero_games')
      .select('game_id, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (heroError) {
      console.error('获取英雄区配置失败:', heroError.message);
      return [];
    }
    
    if (!heroData || heroData.length === 0) return [];
    
    // 第二步：获取对应的游戏数据
    const gameIds = heroData.map(hero => hero.game_id);
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .in('id', gameIds);
    
    if (gamesError) {
      console.error('获取英雄区游戏数据失败:', gamesError.message);
      return [];
    }
    
    if (!gamesData || gamesData.length === 0) return [];
    
    // 第三步：批量获取标签
    const tagsMap = await getBatchGameTags(gameIds);
    
    // 第四步：按照hero_games的顺序重新排列并转换数据
    const result: HeroGame[] = [];
    
    for (const hero of heroData) {
      const gameData = gamesData.find(game => game.id === hero.game_id);
      if (gameData) {
        result.push({
          id: gameData.id,
          title: gameData.title,
          description: gameData.description || '',
          image: gameData.image_url || gameData.thumbnail_url || '',
          category: gameCategories[gameData.category as keyof typeof gameCategories] || gameData.category,
          tags: tagsMap[gameData.id] || [],
          isOriginal: gameData.is_original,
          isNew: gameData.is_new,
          isHot: gameData.is_hot
        });
      }
    }
    
    return result;
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