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

// 为了保持兼容性，保留这些导出但标记为已废弃
import * as gamesDb from './games-db'
import type { HeroGame, GameConfig, HomepageCategoryConfig } from './games-db'

/**
 * @deprecated 请使用 getHeroGames() 异步函数
 * 英雄区游戏数据 - 现在从数据库获取
 */
export const heroGames: Promise<HeroGame[]> = gamesDb.getHeroGames()

/**
 * @deprecated 已迁移到数据库，请使用相应的数据库查询函数
 * 原始静态游戏配置已备份至 games-static-backup.ts
 */
export const gamesConfig = {} as Record<string, GameConfig>

/**
 * @deprecated 已迁移到数据库，请使用 getHomepageCategories() 函数
 * 主页分类配置现在从数据库的categories表获取
 */
export const homepageCategoryConfig: HomepageCategoryConfig[] = []

// 便捷的同步包装函数（用于需要同步调用的场景）
/**
 * 同步方式获取游戏配置（仅用于兼容性）
 * @deprecated 建议使用异步版本 getGameConfig()
 */
export function getGameConfigSync(gameId: string): GameConfig | null {
  console.warn('⚠️ getGameConfigSync已废弃，请使用异步版本getGameConfig()')
  return null
}

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

// 运行时提示信息
console.log('📊 游戏数据系统已升级：现在使用Supabase数据库存储！')
console.log('🔄 如需回滚到静态数据，请使用 games-static-backup.ts')
console.log('📚 新的数据库查询函数可在 games-db.ts 中找到')

// 重新导出数据库类型，方便在其他地方使用
export type { Database } from './supabase/client' 