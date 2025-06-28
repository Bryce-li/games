#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于创建所有必要的表、索引和基础数据
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量读取Supabase配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：请确保在.env.local文件中设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error(`当前读取到的URL: ${supabaseUrl}`)
  console.error(`当前读取到的KEY: ${supabaseAnonKey ? '已设置' : '未设置'}`)
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 执行SQL文件
 * @param {string} sqlFilePath - SQL文件路径
 */
async function executeSqlFile(sqlFilePath) {
  try {
    console.log(`📖 读取SQL文件: ${sqlFilePath}`)
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    // 将SQL内容按分号分割成多个语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 发现 ${statements.length} 个SQL语句`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`🔄 执行语句 ${i + 1}/${statements.length}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        })
        
        if (error) {
          console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message)
          // 继续执行下一个语句，不中断整个过程
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 执行SQL文件时出错:', error.message)
    throw error
  }
}

/**
 * 验证数据库连接
 */
async function validateConnection() {
  try {
    console.log('🔍 验证数据库连接...')
    // 简单的连接测试 - 尝试执行一个基本查询
    const { data, error } = await supabase
      .rpc('exec_sql', { sql_query: 'SELECT 1' })
    
    if (error) {
      throw new Error(`数据库连接失败: ${error.message}`)
    }
    
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接验证失败:', error.message)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始初始化数据库...')
    console.log(`📡 连接到: ${supabaseUrl}`)
    
    // 验证连接
    const isConnected = await validateConnection()
    if (!isConnected) {
      console.error('❌ 无法连接到数据库，请检查配置')
      process.exit(1)
    }
    
    // 执行数据库创建脚本
    const sqlFilePath = path.join(__dirname, 'create-database.sql')
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ SQL文件不存在: ${sqlFilePath}`)
      process.exit(1)
    }
    
    await executeSqlFile(sqlFilePath)
    
    console.log('🎉 数据库初始化完成!')
    console.log('📋 下一步: 运行数据迁移脚本导入游戏数据')
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
} 