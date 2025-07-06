import { NextResponse } from 'next/server'

// 测试DNS解析
export async function GET() {
  try {
    const domains = [
      'oauth2.googleapis.com',
      'www.googleapis.com',
      'accounts.google.com'
    ]

    const results: Record<string, { status: string; message: string }> = {}

    for (const domain of domains) {
      try {
        // 简单的HTTP HEAD请求来测试域名解析
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(`https://${domain}`, {
          method: 'HEAD',
          signal: controller.signal
        })

        clearTimeout(timeout)
        results[domain] = {
          status: 'success',
          message: `解析成功 (HTTP ${response.status})`
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            results[domain] = {
              status: 'timeout',
              message: '解析超时'
            }
          } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            results[domain] = {
              status: 'dns_error',
              message: 'DNS解析失败'
            }
          } else {
            results[domain] = {
              status: 'error',
              message: error.message
            }
          }
        } else {
          results[domain] = {
            status: 'error',
            message: '未知错误'
          }
        }
      }
    }

    const successCount = Object.values(results).filter(r => r.status === 'success').length
    const totalCount = domains.length

    if (successCount === totalCount) {
      return NextResponse.json({
        success: true,
        message: `所有Google域名解析成功 (${successCount}/${totalCount})`,
        results
      })
    } else if (successCount > 0) {
      return NextResponse.json({
        success: false,
        message: `部分域名解析失败 (${successCount}/${totalCount} 成功)`,
        results
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '所有Google域名解析失败',
        results
      })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `DNS测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
      error: 'DNS_TEST_ERROR'
    }, { status: 500 })
  }
} 