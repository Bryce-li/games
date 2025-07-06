import { NextRequest, NextResponse } from 'next/server'

// 测试Google OAuth Token API连接性
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // 创建测试用的请求参数（无效参数，只是为了测试连接）
    const testParams = new URLSearchParams({
      client_id: 'test',
      client_secret: 'test',
      code: 'test',
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/test'
    })

    // 测试连接到Google OAuth Token API
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15秒超时

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: testParams,
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    const duration = Date.now() - startTime

    // 即使是400错误也说明连接成功
    if (response.status === 400) {
      return NextResponse.json({ 
        success: true, 
        message: `连接成功！响应时间: ${duration}ms (预期的400错误 - 测试参数无效)`,
        duration 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `连接成功！HTTP状态: ${response.status}, 响应时间: ${duration}ms`,
      duration 
    })

  } catch (error) {
    const duration = Date.now() - Date.now()
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ 
          success: false, 
          message: '连接超时 (>15秒)',
          error: 'TIMEOUT'
        }, { status: 408 })
      }
      
      if (error.message.includes('UND_ERR_CONNECT_TIMEOUT')) {
        return NextResponse.json({ 
          success: false, 
          message: '连接超时 - 无法连接到 oauth2.googleapis.com',
          error: 'CONNECT_TIMEOUT'
        }, { status: 408 })
      }
      
      return NextResponse.json({ 
        success: false, 
        message: `网络错误: ${error.message}`,
        error: error.name || 'NETWORK_ERROR'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: '未知网络错误',
      error: 'UNKNOWN_ERROR'
    }, { status: 500 })
  }
} 