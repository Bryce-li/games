"use client"

import { MainLayout } from "./MainLayout"
import { HeroSection } from "./HeroSection"
import { HorizontalGamesList } from "./HorizontalGamesList"
import { AuthErrorAlert } from "./AuthErrorAlert"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { BaseGame, HeroGame, HomepageCategoryConfig } from "@/lib/games"
import { getCategoryFullTitle } from "@/lib/i18n/utils"

// 定义组件的props类型
interface PageContentProps {
  newGames: BaseGame[]
  homepageCategoryData: Record<string, { config: HomepageCategoryConfig; games: BaseGame[] }>
  heroGames: HeroGame[]
}

export function PageContent({ newGames, homepageCategoryData, heroGames }: PageContentProps) {
  const { t } = useTranslation()

  // 英雄区游戏fallback逻辑
  const heroGamesForDisplay = useMemo(() => {
    if (heroGames && heroGames.length > 0) {
      return heroGames;
    }
    // 如果没有英雄区数据，使用新游戏的前3个作为fallback
    return newGames.slice(0, 3).map(game => ({
      ...game,
      description: `Experience the exciting ${game.title}! A great ${game.category} game.`
    }));
  }, [heroGames, newGames]);

  // 使用useMemo优化精选游戏的计算
  const featuredGames = useMemo(() => {
    // 为避免重复key，我们为精选游戏创建一个去重的列表
    // 优先级：动作游戏 > 休闲游戏 > 新游戏
    const usedGameIds = new Set<string>()
    const featured: BaseGame[] = []
    
    // 从启用的分类中收集精选游戏
    const actionGames = homepageCategoryData["action"]?.games || []
    const casualGames = homepageCategoryData["casual"]?.games || []
    
    // 先添加动作游戏（2个）
    actionGames.slice(0, 2).forEach(game => {
      if (!usedGameIds.has(game.id)) {
        featured.push(game)
        usedGameIds.add(game.id)
      }
    })
    
    // 再添加休闲游戏（2个）
    casualGames.slice(0, 2).forEach(game => {
      if (!usedGameIds.has(game.id) && featured.length < 4) {
        featured.push(game)
        usedGameIds.add(game.id)
      }
    })
    
    // 最后从新游戏中补充（1个）
    newGames.forEach(game => {
      if (!usedGameIds.has(game.id) && featured.length < 5) {
        featured.push(game)
        usedGameIds.add(game.id)
      }
    })

    return featured
  }, [newGames, homepageCategoryData])

  return (
    <>
      {/* 错误提示组件 */}
      <AuthErrorAlert />
      
      <MainLayout>
        {/* 主要内容 - 紧凑布局，减少内边距 */}
        <div className="w-full px-1 py-2">
          {/* Hero 轮播区域 */}
          <HeroSection games={heroGamesForDisplay} />

          {/* 游戏分类列表 - 减少间距 */}
          <div className="space-y-3">
            {/* 精选游戏 - 使用新的国际化函数 */}
            <HorizontalGamesList
              title={getCategoryFullTitle(t, "featured")}
              games={featuredGames}
              viewMoreHref="/games"
            />

            {/* 新游戏 - 使用新的国际化函数 */}
            <HorizontalGamesList
              title={getCategoryFullTitle(t, "new")}
              games={newGames}
              viewMoreHref="/games/category/new"
            />

            {/* 动态渲染启用的分类游戏 - 完全使用category_key国际化，废弃category_title */}
            {Object.entries(homepageCategoryData).map(([categoryKey, categoryData]) => (
              <HorizontalGamesList
                key={categoryKey}
                title={getCategoryFullTitle(t, categoryKey)}
                games={categoryData.games}
                viewMoreHref={`/games/category/${categoryKey}`}
              />
            ))}
          </div>
        </div>

        {/* 页脚 - 减少顶部间距 */}
        <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-200">
          <div className="w-full px-1 py-4">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p className="text-sm">&copy; 2024 MiniPlayGame. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </MainLayout>
    </>
  )
} 