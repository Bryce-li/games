'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
  details?: Record<string, unknown>
}

export default function ProxyTestPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (
    name: string, 
    status: TestResult['status'], 
    message: string, 
    duration?: number, 
    details?: Record<string, unknown>
  ) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.duration = duration
        existing.details = details
        return [...prev]
      } else {
        return [...prev, { name, status, message, duration, details }]
      }
    })
  }

  const runProxyTests = async () => {
    setIsRunning(true)
    setTests([])

    // 测试1：检查代理配置
    updateTest('代理配置检查', 'pending', '正在检查...')
    try {
      const configResponse = await fetch('/api/proxy-test/config')
      if (configResponse.ok) {
        const data = await configResponse.json()
        updateTest('代理配置检查', 'success', `检查完成`, undefined, data)
      } else {
        updateTest('代理配置检查', 'error', '配置检查失败')
      }
    } catch (error) {
      updateTest('代理配置检查', 'error', `检查失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    // 测试2：直接测试Google OAuth Token端点（使用代理）
    updateTest('Google Token API (代理)', 'pending', '正在测试...')
    try {
      const tokenStart = Date.now()
      const tokenResponse = await fetch('/api/proxy-test/google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useProxy: true })
      })
      const tokenDuration = Date.now() - tokenStart
      
      if (tokenResponse.ok) {
        const data = await tokenResponse.json()
        updateTest('Google Token API (代理)', 'success', data.message, tokenDuration, data)
      } else {
        const error = await tokenResponse.text()
        updateTest('Google Token API (代理)', 'error', `HTTP ${tokenResponse.status}: ${error}`, tokenDuration)
      }
    } catch (error) {
      updateTest('Google Token API (代理)', 'error', 
        `网络错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    // 测试3：直接测试Google UserInfo端点（使用代理）
    updateTest('Google UserInfo API (代理)', 'pending', '正在测试...')
    try {
      const userStart = Date.now()
      const userResponse = await fetch('/api/proxy-test/google-userinfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useProxy: true })
      })
      const userDuration = Date.now() - userStart
      
      if (userResponse.ok) {
        const data = await userResponse.json()
        updateTest('Google UserInfo API (代理)', 'success', data.message, userDuration, data)
      } else {
        const error = await userResponse.text()
        updateTest('Google UserInfo API (代理)', 'error', `HTTP ${userResponse.status}: ${error}`, userDuration)
      }
    } catch (error) {
      updateTest('Google UserInfo API (代理)', 'error', 
        `网络错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    // 测试4：完整OAuth流程模拟
    updateTest('OAuth流程模拟', 'pending', '正在测试...')
    try {
      const oauthStart = Date.now()
      const oauthResponse = await fetch('/api/proxy-test/oauth-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testMode: true })
      })
      const oauthDuration = Date.now() - oauthStart
      
      if (oauthResponse.ok) {
        const data = await oauthResponse.json()
        updateTest('OAuth流程模拟', 'success', data.message, oauthDuration, data)
      } else {
        const error = await oauthResponse.text()
        updateTest('OAuth流程模拟', 'error', `模拟失败: ${error}`, oauthDuration)
      }
    } catch (error) {
      updateTest('OAuth流程模拟', 'error', 
        `模拟错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case 'success':
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
      case 'error':
        return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">✗</div>
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">代理连接测试</h1>
        <p className="text-gray-600 dark:text-gray-400">
          测试代理配置是否能正常访问Google OAuth API
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>代理测试</CardTitle>
          <CardDescription>
            点击开始测试来验证代理配置和Google API连接
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runProxyTests} 
            disabled={isRunning}
            className="w-full md:w-auto"
          >
            {isRunning ? '正在测试...' : '开始代理测试'}
          </Button>
        </CardContent>
      </Card>

      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="border rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        <p className={`text-sm ${getStatusColor(test.status)}`}>
                          {test.message}
                        </p>
                      </div>
                    </div>
                    {test.duration && (
                      <div className="text-sm text-gray-500">
                        {test.duration}ms
                      </div>
                    )}
                  </div>
                  
                  {test.details && (
                    <div className="px-4 pb-4">
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          查看详细信息
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>代理配置指南</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-600 mb-2">设置代理环境变量 (PowerShell):</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
{`$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
npm run dev`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-green-600 mb-2">或者在 .env.local 中添加:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
{`HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-yellow-600 mb-2">常见代理端口:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>7890 - Clash/V2Ray 默认端口</li>
                <li>1080 - SOCKS5 代理默认端口</li>
                <li>8080 - 常见HTTP代理端口</li>
                <li>3128 - Squid代理默认端口</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 