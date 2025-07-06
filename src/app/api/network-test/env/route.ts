import { NextResponse } from 'next/server'

// 检查环境变量配置
export async function GET() {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const jwtSecret = process.env.JWT_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const issues: string[] = []
    const configs: Record<string, { status: string; issue?: string }> = {}

    // 检查Google Client ID
    if (!googleClientId) {
      issues.push('GOOGLE_CLIENT_ID未设置')
      configs.GOOGLE_CLIENT_ID = { status: 'missing' }
    } else if (!googleClientId.endsWith('.googleusercontent.com')) {
      issues.push('GOOGLE_CLIENT_ID格式错误（应以.googleusercontent.com结尾）')
      configs.GOOGLE_CLIENT_ID = { status: 'invalid', issue: '格式错误' }
    } else {
      configs.GOOGLE_CLIENT_ID = { status: 'valid' }
    }

    // 检查Google Client Secret
    if (!googleClientSecret) {
      issues.push('GOOGLE_CLIENT_SECRET未设置')
      configs.GOOGLE_CLIENT_SECRET = { status: 'missing' }
    } else if (googleClientSecret.length < 20) {
      issues.push('GOOGLE_CLIENT_SECRET可能无效（长度太短）')
      configs.GOOGLE_CLIENT_SECRET = { status: 'invalid', issue: '长度太短' }
    } else {
      configs.GOOGLE_CLIENT_SECRET = { status: 'valid' }
    }

    // 检查JWT Secret
    if (!jwtSecret) {
      issues.push('JWT_SECRET未设置')
      configs.JWT_SECRET = { status: 'missing' }
    } else if (jwtSecret.length < 32) {
      issues.push('JWT_SECRET太短（建议至少32个字符）')
      configs.JWT_SECRET = { status: 'weak', issue: '长度太短' }
    } else {
      configs.JWT_SECRET = { status: 'valid' }
    }

    // 检查Supabase配置
    if (!supabaseUrl) {
      issues.push('NEXT_PUBLIC_SUPABASE_URL未设置')
      configs.SUPABASE_URL = { status: 'missing' }
    } else if (!supabaseUrl.startsWith('https://')) {
      issues.push('NEXT_PUBLIC_SUPABASE_URL格式错误')
      configs.SUPABASE_URL = { status: 'invalid', issue: '格式错误' }
    } else {
      configs.SUPABASE_URL = { status: 'valid' }
    }

    if (!supabaseKey) {
      issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY未设置')
      configs.SUPABASE_KEY = { status: 'missing' }
    } else if (supabaseKey.length < 50) {
      issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY可能无效')
      configs.SUPABASE_KEY = { status: 'invalid', issue: '长度太短' }
    } else {
      configs.SUPABASE_KEY = { status: 'valid' }
    }

    const isValid = issues.length === 0

    if (isValid) {
      return NextResponse.json({
        valid: true,
        message: '所有环境变量配置正确！',
        configs
      })
    } else {
      return NextResponse.json({
        valid: false,
        message: `发现 ${issues.length} 个配置问题`,
        issues,
        configs
      })
    }

  } catch (error) {
    return NextResponse.json({
      valid: false,
      message: `检查环境变量时出错: ${error instanceof Error ? error.message : '未知错误'}`,
      error: 'CHECK_ERROR'
    }, { status: 500 })
  }
} 