// 代理支持的fetch封装

// 代理配置接口
interface ProxyConfig {
  enabled: boolean
  host?: string
  port?: number
  protocol?: 'http' | 'https'
}

// 检测代理配置
function detectProxyConfig(): ProxyConfig {
  // 检查环境变量
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy
  
  // 尝试解析代理URL
  if (httpsProxy || httpProxy) {
    try {
      const proxyUrl = new URL(httpsProxy || httpProxy!)
      return {
        enabled: true,
        host: proxyUrl.hostname,
        port: parseInt(proxyUrl.port) || (proxyUrl.protocol === 'https:' ? 443 : 80),
        protocol: proxyUrl.protocol.replace(':', '') as 'http' | 'https'
      }
    } catch (error) {
      console.warn('无法解析代理URL:', error)
    }
  }
  
  // 检测常见代理端口 - 假设7890端口是活跃的
  const port = 7890
  return {
    enabled: true,
    host: '127.0.0.1',
    port: port,
    protocol: 'http'
  }
}

// 创建带代理支持的fetch函数
export async function proxyFetch(
  url: string, 
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  
  const proxyConfig = detectProxyConfig()
  
  // 如果检测到代理，设置环境变量
  if (proxyConfig.enabled && proxyConfig.host && proxyConfig.port) {
    const proxyUrl = `${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}`
    
    // 动态设置代理环境变量
    if (!process.env.HTTP_PROXY && !process.env.http_proxy) {
      process.env.HTTP_PROXY = proxyUrl
      process.env.http_proxy = proxyUrl
    }
    if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
      process.env.HTTPS_PROXY = proxyUrl  
      process.env.https_proxy = proxyUrl
    }
  }
  
  // 创建超时控制器
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      // 添加额外的请求头
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...(options.headers || {})
      }
    })
    
    clearTimeout(timeoutId)
    return response
    
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`代理请求失败: ${url}`, error)
    throw error
  }
}

// 带重试的代理fetch
export async function retryProxyFetch(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<Response> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await proxyFetch(url, options)
    } catch (error) {
      lastError = error as Error
      console.error(`代理请求失败 (第${attempt}次):`, error)
      
      if (attempt < maxRetries) {
        const delay = baseDelay * attempt
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError!
}

// 导出配置检测函数
export { detectProxyConfig } 