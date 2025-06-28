const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // 需要服务端密钥

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误: 请设置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initializeStorage() {
  console.log('🚀 开始初始化 Supabase Storage...')

  try {
    // 1. 创建 game-assets 存储桶
    console.log('📁 创建 game-assets 存储桶...')
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('game-assets', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880, // 5MB
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError
    }

    if (bucket) {
      console.log('✅ game-assets 存储桶创建成功')
    } else {
      console.log('ℹ️  game-assets 存储桶已存在')
    }

    // 2. 设置存储策略（允许公共读取）
    console.log('🔒 设置存储访问策略...')
    
    // 允许所有人查看图片
    const { error: selectPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'game-assets',
      policy_name: 'Public Access',
      definition: 'true',
      command: 'SELECT'
    })

    // 允许认证用户上传图片
    const { error: insertPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'game-assets', 
      policy_name: 'Authenticated users can upload',
      definition: 'auth.role() = "authenticated"',
      command: 'INSERT'
    })

    // 3. 创建目录结构
    console.log('📂 创建目录结构...')
    const directories = [
      'thumbnails/.keep',
      'hero-images/.keep', 
      'screenshots/.keep',
      'icons/.keep'
    ]

    for (const dir of directories) {
      const { error } = await supabase.storage
        .from('game-assets')
        .upload(dir, new Blob(['']), {
          upsert: true
        })
      
      if (error && !error.message.includes('already exists')) {
        console.log(`⚠️  创建目录 ${dir} 时出现警告:`, error.message)
      }
    }

    console.log('✅ 目录结构创建完成')

    // 4. 上传示例占位符图片
    console.log('🖼️  创建占位符图片...')
    
    // 创建一个简单的占位符SVG
    const placeholderSvg = `
      <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#grad)" />
        <text x="200" y="120" font-family="Arial, sans-serif" font-size="24" 
              fill="white" text-anchor="middle" dy=".3em">🎮 Game</text>
      </svg>
    `

    const { error: placeholderError } = await supabase.storage
      .from('game-assets')
      .upload('placeholder.svg', new Blob([placeholderSvg], { type: 'image/svg+xml' }), {
        upsert: true
      })

    if (placeholderError) {
      console.log('⚠️  上传占位符图片时出现警告:', placeholderError.message)
    } else {
      console.log('✅ 占位符图片上传成功')
    }

    // 5. 显示使用说明
    console.log('\n📋 使用说明:')
    console.log('1. 游戏缩略图上传到 thumbnails/ 目录')
    console.log('2. 英雄区大图上传到 hero-images/ 目录') 
    console.log('3. 游戏截图上传到 screenshots/ 目录')
    console.log('4. 游戏图标上传到 icons/ 目录')
    console.log('\n💡 图片访问URL格式:')
    console.log(`${supabaseUrl}/storage/v1/object/public/game-assets/[路径]`)
    
    console.log('\n🎉 Supabase Storage 初始化完成!')

  } catch (error) {
    console.error('❌ 初始化过程中出现错误:', error.message)
    process.exit(1)
  }
}

// 运行初始化
initializeStorage() 