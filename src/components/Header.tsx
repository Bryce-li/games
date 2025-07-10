"use client"

import { SearchBar } from "./SearchBar"
import { ThemeToggle } from "./ThemeToggle"
import { UserCircle2, Menu } from "lucide-react"
import { useAuth } from "./auth/AuthProvider"
import { UserMenu } from "./auth/UserMenu"
import { useGoogleLogin } from "@/hooks/useGoogleLogin"
import LanguageSwitcher from "./LanguageSwitcher"
import { Logo } from "./Logo"
import { Button } from "./ui/button"

interface HeaderProps {
  onToggleSidebar?: () => void
  isSidebarCollapsed?: boolean
}

export function Header({ onToggleSidebar, isSidebarCollapsed = false }: HeaderProps) {
  const { user, loading } = useAuth()
  const { triggerLogin, isLoading: isLoginLoading } = useGoogleLogin()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full h-16 px-4">
        <div className="flex items-center justify-between h-full">
          {/* 左侧：侧边栏切换按钮 + Logo - 完全靠左 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="p-2"
                aria-label={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Logo href="/" size="sm" showText={true} />
          </div>
          
          {/* 中间：搜索框 - 弹性居中 */}
          <div className="flex-1 flex justify-center px-8">
            <div className="w-full max-w-md">
              <SearchBar />
            </div>
          </div>
          
          {/* 右侧：功能按钮组 - 完全靠右 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
            {loading || isLoginLoading ? (
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <UserMenu />
            ) : (
              <button
                onClick={triggerLogin}
                className="p-2 rounded-full hover:bg-muted"
                aria-label="登录"
              >
                <UserCircle2 className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 