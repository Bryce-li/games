export default function ConfigCheckPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const jwtSecret = process.env.JWT_SECRET
  const adminEmail = process.env.ADMIN_EMAIL

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Configuration Check</h1>
      
      <h2>Environment Variables Status:</h2>
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <p>✅ = Configured | ❌ = Missing | ⚠️ = Invalid</p>
        
        <div style={{ margin: '10px 0' }}>
          <strong>Supabase Configuration:</strong>
          <br />
          NEXT_PUBLIC_SUPABASE_URL: {
            !supabaseUrl ? '❌ Missing' :
            supabaseUrl.startsWith('http') ? `✅ ${supabaseUrl.substring(0, 30)}...` :
            `⚠️ Invalid format: ${supabaseUrl}`
          }
          <br />
          NEXT_PUBLIC_SUPABASE_ANON_KEY: {
            !supabaseKey ? '❌ Missing' :
            supabaseKey.length > 50 ? `✅ ${supabaseKey.substring(0, 10)}...` :
            `⚠️ Too short: ${supabaseKey}`
          }
        </div>

        <div style={{ margin: '10px 0' }}>
          <strong>Google OAuth Configuration:</strong>
          <br />
          GOOGLE_CLIENT_ID: {
            !googleClientId ? '❌ Missing' :
            googleClientId.endsWith('.googleusercontent.com') ? `✅ ${googleClientId.substring(0, 15)}...` :
            `⚠️ Invalid format: ${googleClientId.substring(0, 20)}...`
          }
          <br />
          GOOGLE_CLIENT_SECRET: {
            !googleClientSecret ? '❌ Missing' :
            googleClientSecret.length > 20 ? '✅ Set' :
            '⚠️ Too short'
          }
        </div>

        <div style={{ margin: '10px 0' }}>
          <strong>Other Configuration:</strong>
          <br />
          JWT_SECRET: {!jwtSecret ? '❌ Missing' : '✅ Set'}
          <br />
          ADMIN_EMAIL: {!adminEmail ? '❌ Missing' : `✅ ${adminEmail}`}
        </div>
      </div>

      <h2>Next Steps:</h2>
      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
        <ol>
          <li>Create <code>.env.local</code> file in project root</li>
          <li>Get your Supabase URL and anon key from your Supabase dashboard</li>
          <li>Create Google OAuth credentials in Google Cloud Console</li>
          <li>Add all required environment variables</li>
          <li>Restart the development server</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Sample .env.local format:</h3>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
{`# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth (get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Other
JWT_SECRET=any-strong-password-here
ADMIN_EMAIL=li1529043308@gmail.com`}
        </pre>
      </div>
    </div>
  )
} 