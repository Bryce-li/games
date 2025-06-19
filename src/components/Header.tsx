"use client"

import { SearchBar } from "./SearchBar"
import { ThemeToggle } from "./ThemeToggle"
import { LanguageSelector } from "./LanguageSelector"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  onSearch?: (query: string) => void
  onToggleSidebar?: () => void
  isSidebarCollapsed?: boolean
}

export function Header({ onSearch, onToggleSidebar, isSidebarCollapsed }: HeaderProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("搜索查询:", query)
    onSearch?.(query)
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：侧边栏切换按钮 + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* 侧边栏切换按钮 */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
              title={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            >
              {isSidebarCollapsed ? (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Logo - 可点击回到主页 */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">MiniPlayGame</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Play & Enjoy</p>
              </div>
            </Link>
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
  )
} 