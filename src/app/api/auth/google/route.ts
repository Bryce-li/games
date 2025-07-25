import { NextRequest, NextResponse } from 'next/server'

// Google OAuth配置
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

function getGoogleRedirectUri() {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
  }
  return 'http://localhost:3000/api/auth/google/callback';
}

const GOOGLE_REDIRECT_URI = getGoogleRedirectUri()

// 生成Google OAuth授权URL
export async function GET() {
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  
  googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')

  // 重定向到Google OAuth页面
  return NextResponse.redirect(googleAuthUrl.toString())
} 