import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '已设置' : '未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 需要修正的分类键值映射
const categoryKeyMappings = [
  {
    oldKey: 'dressUp',
    newKey: 'dress-up',
    title: 'Dress Up Games'
  },
  {
    oldKey: 'towerDefense', 
    newKey: 'tower-defense',
    title: 'Tower Defense Games'
  }
]

async function updateCategoryKeys() {
  console.log('🔄 开始修正数据库分类键值...')
  console.log(`📡 连接到: ${supabaseUrl}`)

  try {
    for (const mapping of categoryKeyMappings) {
      console.log(`\n🔧 修正分类键值: ${mapping.oldKey} → ${mapping.newKey}`)
      
      // 1. 检查旧键值是否存在
      const { data: oldCategory, error: checkError } = await supabase
        .from('categories')
        .select('*')
        .eq('category_key', mapping.oldKey)
        .single()

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log(`   ⚠️  旧键值 "${mapping.oldKey}" 不存在，跳过`)
          continue
        }
        console.error(`   ❌ 检查旧键值失败: ${checkError.message}`)
        continue
      }

      // 2. 检查新键值是否已存在
      const { data: newCategory, error: newCheckError } = await supabase
        .from('categories')
        .select('*')
        .eq('category_key', mapping.newKey)
        .single()

      if (!newCheckError && newCategory) {
        console.log(`   ⚠️  新键值 "${mapping.newKey}" 已存在，删除旧记录`)
        
        // 删除旧记录
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('category_key', mapping.oldKey)

        if (deleteError) {
          console.error(`   ❌ 删除旧记录失败: ${deleteError.message}`)
        } else {
          console.log(`   ✅ 旧记录已删除`)
        }
        continue
      }

      // 3. 更新分类键值
      const { error: updateError } = await supabase
        .from('categories')
        .update({ 
          category_key: mapping.newKey,
          category_title: mapping.title 
        })
        .eq('category_key', mapping.oldKey)

      if (updateError) {
        console.error(`   ❌ 更新分类键值失败: ${updateError.message}`)
        continue
      }

      console.log(`   ✅ 分类键值更新成功`)

      // 4. 更新game_tags表中的相关记录
      console.log(`   🔗 更新游戏标签关联...`)
      
      const { error: tagsUpdateError } = await supabase
        .from('game_tags')
        .update({ tag: mapping.newKey })
        .eq('tag', mapping.oldKey)

      if (tagsUpdateError) {
        console.error(`   ❌ 更新游戏标签关联失败: ${tagsUpdateError.message}`)
      } else {
        console.log(`   ✅ 游戏标签关联更新成功`)
      }
    }

    // 验证修正结果
    console.log('\n🔍 验证修正结果...')
    const { data: allCategories, error: verifyError } = await supabase
      .from('categories')
      .select('category_key, category_title')
      .order('category_key')

    if (verifyError) {
      console.error('❌ 验证失败:', verifyError.message)
      return
    }

    console.log('\n📋 当前所有分类键值:')
    allCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.category_key} - ${cat.category_title}`)
    })

    console.log('\n🎉 分类键值修正完成！')

  } catch (error) {
    console.error('❌ 修正分类键值时出错:', error.message)
  }
}

// 运行修正脚本
updateCategoryKeys() 