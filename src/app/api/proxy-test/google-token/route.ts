import { NextRequest, NextResponse } from 'next/server'
import { retryProxyFetch } from '@/lib/proxy-fetch'

export async function POST(request: NextRequest) {
  try {
    const { useProxy } = await request.json()
    const startTime = Date.now()
    
    console.log(`开始测试Google Token API，使用代理: ${useProxy}`)
    
    // 创建测试请求参数
    const testParams = new URLSearchParams({
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      code: 'test-code',
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/test'
    })

    let response: Response
    if (useProxy) {
      response = await retryProxyFetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: testParams,
      })
    } else {
      response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: testParams,
      })
    }
    
    const duration = Date.now() - startTime
    const responseText = await response.text()

    // 400错误是预期的（因为使用了测试参数）
    if (response.status === 400) {
      return NextResponse.json({
        success: true,
        message: `连接成功！响应时间: ${duration}ms (预期的400错误 - 测试参数无效)`,
        duration,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
      })
    }

    return NextResponse.json({
      success: true,
      message: `连接成功！HTTP状态: ${response.status}, 响应时间: ${duration}ms`,
      duration,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    })

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        message: `连接失败: ${error.message}`,
        error: error.name,
        stack: error.stack?.split('\n').slice(0, 5)
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      message: '未知错误',
      error: 'UNKNOWN_ERROR'
    }, { status: 500 })
  }
} 