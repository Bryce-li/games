export default function DebugAuthPage() {
  // 获取环境变量（只显示非敏感信息）
  const config = {
    // Supabase配置
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    supabaseKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...',
    
    // Google OAuth配置
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    
    // 其他配置
    hasJwtSecret: !!process.env.JWT_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Configuration Debug</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Supabase URL:</span>
            <span className={config.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>
              {config.hasSupabaseUrl ? `✅ ${config.supabaseUrlPrefix}` : '❌ Not set'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Supabase Anon Key:</span>
            <span className={config.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>
              {config.hasSupabaseKey ? `✅ ${config.supabaseKeyPrefix}` : '❌ Not set'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Google Client ID:</span>
            <span className={config.hasGoogleClientId ? 'text-green-600' : 'text-red-600'}>
              {config.hasGoogleClientId ? `✅ ${config.googleClientIdPrefix}` : '❌ Not set'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Google Client Secret:</span>
            <span className={config.hasGoogleClientSecret ? 'text-green-600' : 'text-red-600'}>
              {config.hasGoogleClientSecret ? '✅ Set' : '❌ Not set'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Redirect URI:</span>
            <span className="text-blue-600">{config.redirectUri}</span>
          </div>
          
          <div className="flex justify-between">
            <span>JWT Secret:</span>
            <span className={config.hasJwtSecret ? 'text-green-600' : 'text-red-600'}>
              {config.hasJwtSecret ? '✅ Set' : '❌ Not set'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Admin Email:</span>
            <span className="text-blue-600">{config.adminEmail}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Configuration Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Create .env.local file in project root</li>
          <li>Add Google OAuth credentials from Google Cloud Console</li>
          <li>Make sure redirect URI matches exactly</li>
          <li>Restart development server</li>
        </ol>
      </div>

      <div className="mt-4">
        <a 
          href="/api/auth/google" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Google Login
        </a>
      </div>
    </div>
  )
} 