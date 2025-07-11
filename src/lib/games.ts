// 游戏数据管理 - 现已改造为使用Supabase数据库
// 原始静态数据已备份至 games-static-backup.ts

// 重新导出数据库查询函数，保持向后兼容性
export {
  type BaseGame,
  type GameConfig,
  type HeroGame,
  type HomepageCategoryConfig,
  gameCategories,
  getGamesByCategory,
  getNewGames,
  getHotGames,
  getRecommendedGames,
  getRelatedGames,
  getGameConfig,
  getGameConfigById, // 新增：通过UUID查询游戏配置
  getAllGames,
  searchGames,
  getHomepageCategories,
  getHomepageCategoryData,
  getAllHomepageCategoryData,
  getHeroGames,
  updateCategoryVisibility,
  updateMultipleCategoriesVisibility,
  getCategoryVisibilityStatus
} from './games-db'

// 为了保持兼容性，保留这些导出
import * as gamesDb from './games-db'
import type { HeroGame, GameConfig, HomepageCategoryConfig } from './games-db'

/**
 * 兼容性函数：将异步函数包装为可在组件中使用的hook
 */
export function useGamesData() {
  // 这个函数可以在React组件中使用
  // 实际实现可能需要根据您的具体使用场景调整
  return {
    getAllGames: gamesDb.getAllGames,
    getGamesByCategory: gamesDb.getGamesByCategory,
    getNewGames: gamesDb.getNewGames,
    getHotGames: gamesDb.getHotGames,
    getGameConfig: gamesDb.getGameConfig,
    searchGames: gamesDb.searchGames,
    getHomepageCategories: gamesDb.getHomepageCategories,
    getAllHomepageCategoryData: gamesDb.getAllHomepageCategoryData
  }
}

// 游戏数据系统已升级为使用Supabase数据库

// 重新导出数据库类型，方便在其他地方使用
export type { Database } from './supabase/client' 