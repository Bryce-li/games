"use client"

import { MainLayout } from "../components/MainLayout"
import { HeroSection } from "../components/HeroSection"
import { HorizontalGamesList } from "../components/HorizontalGamesList"
import { useTranslation } from "react-i18next"
import { useState, useMemo } from "react"
import { heroGames, getNewGames, getGamesByCategory, BaseGame } from "@/lib/games"

export default function Home() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")

  // 处理搜索查询
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("首页搜索查询:", query)
  }

  // 使用useMemo优化数据获取和去重处理
  const gameData = useMemo(() => {
    const newGames = getNewGames()
    const casualGames = getGamesByCategory("casual")
    const actionGames = getGamesByCategory("action")
    
    // 为避免重复key，我们为精选游戏创建一个去重的列表
    // 优先级：动作游戏 > 休闲游戏 > 新游戏
    const usedGameIds = new Set<string>()
    const featuredGames: BaseGame[] = []
    
    // 先添加动作游戏（2个）
    actionGames.slice(0, 2).forEach(game => {
      if (!usedGameIds.has(game.id)) {
        featuredGames.push(game)
        usedGameIds.add(game.id)
      }
    })
    
    // 再添加休闲游戏（2个）
    casualGames.slice(0, 2).forEach(game => {
      if (!usedGameIds.has(game.id) && featuredGames.length < 4) {
        featuredGames.push(game)
        usedGameIds.add(game.id)
      }
    })
    
    // 最后从新游戏中补充（1个）
    newGames.forEach(game => {
      if (!usedGameIds.has(game.id) && featuredGames.length < 5) {
        featuredGames.push(game)
        usedGameIds.add(game.id)
      }
    })

    return {
      featuredGames,
      newGames,
      casualGames,
      actionGames
    }
  }, [])

  return (
    <MainLayout onSearch={handleSearch}>
        {/* 主要内容 */}
        <div className="container mx-auto px-4 py-8">
          {/* Hero 轮播区域 */}
          <HeroSection games={heroGames} />

          {/* 游戏分类列表 */}
          <div className="space-y-6">
            {/* 精选游戏 */}
            <HorizontalGamesList
              title={t("categories.featured", "Featured Games")}
              games={gameData.featuredGames}
              viewMoreHref="/games"
            />

            {/* 新游戏 */}
            <HorizontalGamesList
              title={t("categories.new", "New Games")}
              games={gameData.newGames}
              viewMoreHref="/games/category/new"
            />

            {/* 休闲游戏 */}
            <HorizontalGamesList
              title={t("categories.casual", "Casual Games")}
              games={gameData.casualGames}
              viewMoreHref="/games/category/casual"
            />

            {/* 动作游戏 */}
            <HorizontalGamesList
              title={t("categories.action", "Action Games")}
              games={gameData.actionGames}
              viewMoreHref="/games/category/action"
            />
          </div>

          {/* 搜索结果 (如果有搜索查询) */}
          {searchQuery && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Search Results for "{searchQuery}"
              </h2>
              <div className="text-gray-600 dark:text-gray-400">
                {/* 这里可以添加搜索结果组件 */}
                Searching for games matching "{searchQuery}"...
              </div>
            </div>
          )}
        </div>

        {/* 页脚 */}
        <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-200">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>&copy; 2024 MiniPlayGame. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </MainLayout>
  )
}
