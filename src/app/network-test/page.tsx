'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

export default function NetworkTestPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.duration = duration
        return [...prev]
      } else {
        return [...prev, { name, status, message, duration }]
      }
    })
  }

  const runNetworkTests = async () => {
    setIsRunning(true)
    setTests([])

    const startTime = Date.now()

    // 测试1：Google OAuth Token端点
    updateTest('Google OAuth Token API', 'pending', '正在测试...')
    try {
      const tokenStart = Date.now()
      const tokenResponse = await fetch('/api/network-test/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      const tokenDuration = Date.now() - tokenStart
      
      if (tokenResponse.ok) {
        const data = await tokenResponse.json()
        updateTest('Google OAuth Token API', 'success', data.message, tokenDuration)
      } else {
        const error = await tokenResponse.text()
        updateTest('Google OAuth Token API', 'error', `HTTP ${tokenResponse.status}: ${error}`, tokenDuration)
      }
    } catch (error) {
      const tokenDuration = Date.now() - startTime
      updateTest('Google OAuth Token API', 'error', 
        `网络错误: ${error instanceof Error ? error.message : '未知错误'}`, tokenDuration)
    }

    // 测试2：Google UserInfo端点
    updateTest('Google UserInfo API', 'pending', '正在测试...')
    try {
      const userStart = Date.now()
      const userResponse = await fetch('/api/network-test/userinfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      const userDuration = Date.now() - userStart
      
      if (userResponse.ok) {
        const data = await userResponse.json()
        updateTest('Google UserInfo API', 'success', data.message, userDuration)
      } else {
        const error = await userResponse.text()
        updateTest('Google UserInfo API', 'error', `HTTP ${userResponse.status}: ${error}`, userDuration)
      }
    } catch (error) {
      const userDuration = Date.now() - startTime
      updateTest('Google UserInfo API', 'error', 
        `网络错误: ${error instanceof Error ? error.message : '未知错误'}`, userDuration)
    }

    // 测试3：DNS解析
    updateTest('DNS解析测试', 'pending', '正在测试...')
    try {
      const dnsStart = Date.now()
      const dnsResponse = await fetch('/api/network-test/dns')
      const dnsDuration = Date.now() - dnsStart
      
      if (dnsResponse.ok) {
        const data = await dnsResponse.json()
        updateTest('DNS解析测试', 'success', data.message, dnsDuration)
      } else {
        updateTest('DNS解析测试', 'error', '无法解析Google域名', dnsDuration)
      }
    } catch (error) {
      updateTest('DNS解析测试', 'error', `DNS错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    // 测试4：环境变量检查
    updateTest('环境变量配置', 'pending', '正在检查...')
    try {
      const envResponse = await fetch('/api/network-test/env')
      if (envResponse.ok) {
        const data = await envResponse.json()
        updateTest('环境变量配置', data.valid ? 'success' : 'error', data.message)
      } else {
        updateTest('环境变量配置', 'error', '无法检查环境变量')
      }
    } catch (error) {
      updateTest('环境变量配置', 'error', `配置错误: ${error instanceof Error ? error.message : '未知错误'}`)
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
        <h1 className="text-3xl font-bold mb-2">网络连接诊断</h1>
        <p className="text-gray-600 dark:text-gray-400">
          测试Google OAuth API的网络连接状况，帮助诊断登录问题
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>诊断测试</CardTitle>
          <CardDescription>
            点击开始测试来检查网络连接和配置问题
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runNetworkTests} 
            disabled={isRunning}
            className="w-full md:w-auto"
          >
            {isRunning ? '正在测试...' : '开始网络诊断'}
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
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>解决方案建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-red-600 mb-2">如果遇到网络超时错误：</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>检查防火墙设置，确保允许访问 oauth2.googleapis.com</li>
                <li>检查代理设置，如果在企业网络环境下</li>
                <li>确认网络连接稳定</li>
                <li>尝试重启开发服务器</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-600 mb-2">如果环境变量配置错误：</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>在项目根目录创建 .env.local 文件</li>
                <li>添加正确的 Google OAuth 凭据</li>
                <li>重启开发服务器使配置生效</li>
                <li>访问 /config-check 页面验证配置</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-600 mb-2">配置Google OAuth的步骤：</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>访问 Google Cloud Console</li>
                <li>创建或选择项目</li>
                <li>启用 Google+ API</li>
                <li>创建 OAuth 2.0 客户端ID</li>
                <li>设置授权重定向URI: http://localhost:3000/api/auth/google/callback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 