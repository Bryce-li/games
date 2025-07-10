"use client"

import { useState } from 'react'
import Image from 'next/image'
import { UserCircle2 } from 'lucide-react'
import { useAuth } from './AuthProvider' // 导入 useAuth
import { isAdmin } from '@/lib/auth-utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// 不再需要 props，因为我们直接从 context 获取 user
export function UserMenu() {
  const { user } = useAuth() // 从 AuthContext 获取权威的用户信息
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // 如果没有用户信息（例如正在加载或未登录），不渲染任何内容
  if (!user) {
    return null
  }
  
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // 刷新页面以清除用户状态
        window.location.reload()
      } else {
        console.error('注销失败')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('注销过程出错:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name || '用户头像'}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <UserCircle2 className="h-8 w-8" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || '用户'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 管理员功能 - 使用来自 context 的 user 对象 */}
        {isAdmin(user) && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/data-upload" className="cursor-pointer">
                Data Upload
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* 注销功能 - 移除图标 */}
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer"
        >
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 