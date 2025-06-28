import { getAllGames, getGamesByCategory, BaseGame, GameConfig, gameCategories, getGameConfig } from './games';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  image: string;
  category: string;
  isNew?: boolean;
  isHot?: boolean;
  isOriginal?: boolean;
  matchType: 'title' | 'category' | 'description';
}

// 获取所有分类列表
export function getAllCategories(): string[] {
  return Object.keys(gameCategories);
}

// 高亮匹配文本
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-1 rounded">$1</mark>');
}

// 搜索游戏
export async function searchGames(query: string, limit: number = 20): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  const allGames = await getAllGames();
  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  
  // 使用 Promise.all 来并行获取游戏配置，提高性能
  const gameConfigPromises = allGames.map(async (game) => {
    const titleMatch = game.title.toLowerCase().includes(searchTerm);
    const categoryMatch = game.category.toLowerCase().includes(searchTerm);
    
    // 只有在标题或分类匹配时才获取游戏配置，避免不必要的请求
    if (titleMatch || categoryMatch) {
      return { game, gameConfig: null, titleMatch, categoryMatch, descriptionMatch: false };
    }
    
    // 获取游戏配置来检查描述匹配
    const gameConfig = await getGameConfig(game.id);
    const descriptionMatch = gameConfig?.description?.toLowerCase().includes(searchTerm) ?? false;
    
    return { game, gameConfig, titleMatch, categoryMatch, descriptionMatch };
  });

  const gameResults = await Promise.all(gameConfigPromises);

  gameResults.forEach(({ game, gameConfig, titleMatch, categoryMatch, descriptionMatch }) => {
    if (titleMatch || categoryMatch || descriptionMatch) {
      let matchType: 'title' | 'category' | 'description' = 'title';
      
      if (titleMatch) matchType = 'title';
      else if (categoryMatch) matchType = 'category';
      else if (descriptionMatch) matchType = 'description';
      
      results.push({
        id: game.id,
        title: game.title,
        description: gameConfig?.description,
        image: game.image,
        category: game.category,
        isNew: game.isNew,
        isHot: game.isHot,
        isOriginal: game.isOriginal,
        matchType
      });
    }
  });
  
  // 按匹配类型排序
  results.sort((a, b) => {
    const order = { title: 0, category: 1, description: 2 };
    return order[a.matchType] - order[b.matchType];
  });
  
  return results.slice(0, limit);
}

// 获取搜索建议
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<SearchResult[]> {
  return await searchGames(query, limit);
}

// 按分类获取游戏 - 重新导出从games.ts的函数
export { getGamesByCategory, getAllGames } from './games';
