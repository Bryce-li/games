"use client"

import Link from "next/link"
import { SearchBar } from "./SearchBar"
import { ThemeToggle } from "./ThemeToggle"
import { UserCircle2 } from "lucide-react"
import { useAuth } from "./auth/AuthProvider"
import { UserMenu } from "./auth/UserMenu"
import { useGoogleLogin } from "@/hooks/useGoogleLogin"

export function Header() {
  const { user, loading } = useAuth()
  const { triggerLogin, isLoading: isLoginLoading } = useGoogleLogin()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              MiniPlayGame
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/new-games">New</Link>
            <Link href="/hot-games">Hot</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchBar />
          </div>
          <ThemeToggle />
          <div className="flex items-center">
            {loading || isLoginLoading ? (
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <UserMenu user={user} />
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