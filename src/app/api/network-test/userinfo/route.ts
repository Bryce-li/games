import { NextRequest, NextResponse } from 'next/server'

// 测试Google UserInfo API连接性
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()

    // 测试连接到Google UserInfo API（无效token，只测试连接）
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15秒超时

    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: 'Bearer invalid_token_for_test',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    const duration = Date.now() - startTime

    // 401错误表示连接成功但token无效（这是预期的）
    if (response.status === 401) {
      return NextResponse.json({ 
        success: true, 
        message: `连接成功！响应时间: ${duration}ms (预期的401错误 - 测试token无效)`,
        duration 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `连接成功！HTTP状态: ${response.status}, 响应时间: ${duration}ms`,
      duration 
    })

  } catch (error) {
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
          message: '连接超时 - 无法连接到 googleapis.com',
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