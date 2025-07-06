'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { X, AlertCircle, Wifi, Settings, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ERROR_MESSAGES = {
  oauth_error: {
    title: 'Google登录授权失败',
    message: '登录过程中发生错误，请重试。',
    type: 'error' as const,
    icon: AlertCircle
  },
  no_code: {
    title: '授权码丢失',
    message: '未接收到Google授权码，请重新尝试登录。',
    type: 'error' as const,
    icon: AlertCircle
  },
  token_error: {
    title: '获取访问令牌失败',
    message: '无法获取Google访问令牌，可能是配置问题。',
    type: 'error' as const,
    icon: Settings
  },
  user_info_error: {
    title: '获取用户信息失败',
    message: '无法从Google获取用户信息，请重试。',
    type: 'error' as const,
    icon: AlertCircle
  },
  user_creation_error: {
    title: '创建用户失败',
    message: '无法在数据库中创建用户记录。',
    type: 'error' as const,
    icon: AlertCircle
  },
  session_error: {
    title: '会话创建失败',
    message: '无法创建用户会话，请重试。',
    type: 'error' as const,
    icon: AlertCircle
  },
  network_timeout: {
    title: '网络连接超时',
    message: '无法连接到Google服务器，请检查网络连接。',
    type: 'warning' as const,
    icon: Wifi
  },
  callback_error: {
    title: '登录回调失败',
    message: '登录过程中发生未知错误。',
    type: 'error' as const,
    icon: AlertCircle
  },
  access_denied: {
    title: '访问被拒绝',
    message: '您没有权限访问此页面。',
    type: 'warning' as const,
    icon: AlertCircle
  },
  auth_error: {
    title: '认证失败',
    message: '身份验证过程中发生错误。',
    type: 'error' as const,
    icon: AlertCircle
  }
}

export function AuthErrorAlert() {
  const [isVisible, setIsVisible] = useState(false)
  const [errorInfo, setErrorInfo] = useState<typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES] | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error && error in ERROR_MESSAGES) {
      setErrorInfo(ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES])
      setIsVisible(true)
    }
  }, [searchParams])

  if (!isVisible || !errorInfo) return null

  const IconComponent = errorInfo.icon
  const isNetworkError = searchParams.get('error') === 'network_timeout'

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Card className={`border-l-4 shadow-lg ${
        errorInfo.type === 'error' 
          ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' 
          : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              errorInfo.type === 'error' 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-yellow-600 dark:text-yellow-400'
            }`} />
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm ${
                errorInfo.type === 'error' 
                  ? 'text-red-800 dark:text-red-200' 
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {errorInfo.title}
              </h3>
              <p className={`mt-1 text-sm ${
                errorInfo.type === 'error' 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {errorInfo.message}
              </p>
              
              {isNetworkError && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    建议解决方案：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = '/network-test'}
                      className="h-7 text-xs"
                    >
                      <Wifi className="w-3 h-3 mr-1" />
                      网络诊断
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = '/config-check'}
                      className="h-7 text-xs"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      配置检查
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('/AUTH_SETUP_GUIDE.md', '_blank')}
                      className="h-7 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      配置指南
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-auto p-1 hover:bg-transparent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 