import { NextResponse } from 'next/server'
import { detectProxyConfig } from '@/lib/proxy-fetch'

export async function GET() {
  try {
    const proxyConfig = detectProxyConfig()
    
    // 检查环境变量
    const envConfig = {
      HTTP_PROXY: process.env.HTTP_PROXY || process.env.http_proxy || '',
      HTTPS_PROXY: process.env.HTTPS_PROXY || process.env.https_proxy || '',
      NO_PROXY: process.env.NO_PROXY || process.env.no_proxy || '',
    }

    return NextResponse.json({
      success: true,
      message: '代理配置检查完成',
      proxy: proxyConfig,
      environment: envConfig,
      nodeVersion: process.version,
      platform: process.platform
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `配置检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      error: 'CONFIG_CHECK_ERROR'
    }, { status: 500 })
  }
} 