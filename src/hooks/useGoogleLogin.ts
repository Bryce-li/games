"use client"

import { useEffect, useState, useCallback } from 'react'

// Google Identity Services 的类型定义
interface GoogleCredentialResponse {
  credential: string
}

interface GoogleNotification {
  isNotDisplayed(): boolean
  isDismissedMoment(): boolean
  getNotDisplayedReason(): string
  getDismissedReason(): string
}

interface GoogleAccounts {
  id: {
    initialize(config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void
    prompt(callback: (notification: GoogleNotification) => void): void
  }
}

// 声明 window.google 对象，因为它是从外部脚本动态加载的
declare global {
  interface Window {
    google?: {
      accounts?: GoogleAccounts
    }
  }
}

/**
 * 封装了 Google Identity Services (GSI) One-Tap 登录逻辑的自定义 Hook
 */
export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // 处理从 Google 返回的凭证的回调函数
  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    // setIsLoading is already true from triggerLogin
    console.log("接收到 Google 凭证，正在发送到后端验证...")

    try {
      const res = await fetch('/api/auth/google/callback/one-tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '后端凭证验证失败')
      }
      
      console.log("后端验证成功，强制刷新页面以更新会话状态...")
      window.location.reload()
      
    } catch (error) {
      console.error("登录处理失败:", error)
      setIsLoading(false)
      // 在这里可以添加面向用户的错误提示，例如使用 toast 通知
    }
  }, [])

  // 初始化 GSI 客户端
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (typeof window === 'undefined' || !googleClientId) {
      if (!googleClientId) console.error("错误: 环境变量 NEXT_PUBLIC_GOOGLE_CLIENT_ID 未设置。")
      return
    }

    // 轮询检查 window.google 是否可用，因为脚本加载可能是异步的
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval)
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        })
        console.log("Google 登录服务已初始化。")
        setIsInitialized(true)
      }
    }, 100) // 每100ms检查一次

    return () => clearInterval(interval) // 组件卸载时清除轮询
  }, [handleCredentialResponse])

  // 触发登录弹窗的函数
  const triggerLogin = useCallback(() => {
    if (isLoading || !isInitialized) {
      if (isLoading) console.warn("登录请求已在进行中。")
      if (!isInitialized) console.error("Google 登录服务尚未初始化，请稍后重试。")
      return
    }
    
    setIsLoading(true)

    const fallbackToRedirect = () => {
      console.warn("一键登录失败或超时，正在回退到传统重定向登录流程...")
      window.location.href = '/api/auth/google'
    }

    // 【最终方案】设置一个8秒的超时作为"安全网"
    // 如果GSI流程因任何网络错误卡住，此超时将触发备用方案
    const timeoutId = setTimeout(() => {
      console.error("登录操作超时（8秒）。正在启动备用登录方案。")
      fallbackToRedirect()
    }, 8000)

    window.google?.accounts?.id.prompt((notification: GoogleNotification) => {
      // 只要GSI有任何回调（无论成功或失败），就说明它没有完全卡死，我们可以清除超时
      clearTimeout(timeoutId) 

      const isNotDisplayed = notification.isNotDisplayed()
      const isDismissed = notification.isDismissedMoment()

      // 如果 prompt UI 压根没有被展示
      if (isNotDisplayed) {
        console.warn(`Google One-Tap UI 未显示。原因: ${notification.getNotDisplayedReason()}`)
        fallbackToRedirect() 
      }
      // 如果 prompt UI 被用户主动关闭了
      else if (isDismissed) {
        // 只有当不是因为成功返回凭证而关闭时（即用户点了'X'），才重置加载状态
        if (notification.getDismissedReason() !== 'credential_returned') {
          console.log(`Google One-Tap UI 已关闭。原因: ${notification.getDismissedReason()}`)
          setIsLoading(false)
        }
      }
    })
  }, [isInitialized, isLoading])

  return { triggerLogin, isLoading }
} 