"use client"

import { SearchBar } from "../components/SearchBar"
import { ThemeToggle } from "../components/ThemeToggle"
import { HeroSection } from "../components/HeroSection"
import { HorizontalGamesList } from "../components/HorizontalGamesList"
import { LanguageSelector } from "../components/LanguageSelector"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import Script from "next/script"

// 精选游戏数据 - 用于 Hero 轮播，与 games-config.ts 保持一致
const heroGames = [
  {
    id: "leap-and-avoid-2",
    title: "Leap and Avoid 2",
    description: "Jump and dodge obstacles in this challenging platformer sequel!",
    image: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    category: "Casual",
    isHot: true
  },
  {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    description: "A relaxed and enjoyable lawn mowing simulator. Constantly upgrade your lawn mowing machine in the game!",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "Casual",
    isNew: true
  },
  {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    description: "A physics-based archery game with ragdoll characters. Aim and shoot to defeat your opponents!",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    category: "Action",
    isHot: true
  }
]

// 游戏分类数据 - 与 games-config.ts 保持一致
const featuredGames = [
  { 
    id: "leap-and-avoid-2", 
    title: "Leap and Avoid 2", 
    image: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg"
  },
  {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover"
  },
  {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    badge: "HOT"
  },
  {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover"
  },
  {
    id: "zombie-horde-build-survive",
    title: "Zombie Horde: Build & Survive",
    image: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    badge: "NEW"
  }
]

const newGames = [
  { id: "squish", title: "Squish", image: "https://imgs.crazygames.com/squish-uwy_16x9/20250605094550/squish-uwy_16x9-cover", badge: "NEW" },
  { id: "loot-island", title: "Loot Island - Treasure Digger", image: "https://imgs.crazygames.com/loot-island---treasure-digger_16x9/20250603144928/loot-island---treasure-digger_16x9-cover", badge: "NEW" },
  { id: "dragons-merge", title: "Dragons Merge: Battle Games", image: "https://imgs.crazygames.com/dragons-merge-battle-games_16x9/20250603032604/dragons-merge-battle-games_16x9-cover", badge: "NEW" },
  { id: "little-shop", title: "Little Shop", image: "https://imgs.crazygames.com/little-shop_16x9/20250603102502/little-shop_16x9-cover", badge: "NEW" },
  { id: "mean-girls", title: "Mean Girls Graduation Day", image: "https://imgs.crazygames.com/mean-girls-graduation-day_16x9/20250604072140/mean-girls-graduation-day_16x9-cover", badge: "NEW" }
]

const casualGames = [
  { id: "stone-grass-casual", title: "Stone Grass: Mowing Simulator", image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover" },
  { id: "ragdoll-archers-casual", title: "Ragdoll Archers", image: "https://imgs.crazygames.com/ragdoll-archers_16x9/20240205020743/ragdoll-archers_16x9-cover", badge: "HOT" },
  { id: "slice-master-casual", title: "Slice Master", image: "https://imgs.crazygames.com/slice-master_16x9/20240731033229/slice-master_16x9-cover" },
  { id: "count-masters-casual", title: "Count Masters: Stickman Games", image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover" },
  { id: "planet-smash-casual", title: "Planet Smash Destruction", image: "https://imgs.crazygames.com/solar-smash_16x9/20240722073047/solar-smash_16x9-cover" }
]

const drivingGames = [
  { id: "polytrack-driving", title: "PolyTrack", image: "https://imgs.crazygames.com/games/polytrack/cover_16x9-1746189517703.png" },
  { id: "traffic-rider", title: "Traffic Rider", image: "https://imgs.crazygames.com/traffic-rider-vvq_16x9/20250526021507/traffic-rider-vvq_16x9-cover" },
  { id: "racing-limits", title: "Racing Limits", image: "https://imgs.crazygames.com/racing-limits_16x9/20250418072542/racing-limits_16x9-cover" },
  { id: "super-star-car", title: "Super Star Car", image: "https://imgs.crazygames.com/super-star-car_16x9/20250519082532/super-star-car_16x9-cover" },
  { id: "rally-racer", title: "Rally Racer Dirt", image: "https://imgs.crazygames.com/rally-racer-dirt_16x9/20250227034748/rally-racer-dirt_16x9-cover", badge: "HOT" }
]

export default function Home() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("搜索查询:", query)
    // 这里可以添加搜索逻辑
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Google Analytics 跟踪代码 */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EMGT22HG1L');
          `,
        }}
      />
      <Script
        id="google-analytics-script"
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-EMGT22HG1L"
      />

      {/* 现代化头部导航 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">MiniPlayGame</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Play & Enjoy</p>
              </div>
            </div>

            {/* 中央搜索栏 */}
            <div className="flex-1 max-w-2xl mx-4">
              <SearchBar 
                onSearch={handleSearch}
                className="w-full"
              />
            </div>

            {/* 右侧工具栏 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero 轮播区域 */}
        <HeroSection games={heroGames} />

        {/* 游戏分类列表 */}
        <div className="space-y-12">
          {/* 精选游戏 */}
          <HorizontalGamesList
            title={t("categories.featured", "Featured Games")}
            games={featuredGames}
            viewMoreHref="/games"
          />

          {/* 新游戏 */}
          <HorizontalGamesList
            title={t("categories.new", "New Games")}
            games={newGames}
            viewMoreHref="/games/new"
          />

          {/* 休闲游戏 */}
          <HorizontalGamesList
            title={t("categories.casual", "Casual Games")}
            games={casualGames}
            viewMoreHref="/games/casual"
          />

          {/* 驾驶游戏 */}
          <HorizontalGamesList
            title={t("categories.driving", "Driving Games")}
            games={drivingGames}
            viewMoreHref="/games/driving"
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
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 MiniPlayGame. All rights reserved.</p>
            <p className="text-sm mt-2">Built with Next.js 15 & TypeScript</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
