const fs = require('fs')
const path = require('path')

console.log('🔧 开始更新代码以使用主键id替代game_id...')

// 需要更新的文件列表
const filesToUpdate = [
  'src/lib/games-db.ts',
  'scripts/migrate-data.js',
  'scripts/verify-data.js'
]

// 执行替换的函数
function updateFile(filePath, replacements) {
  console.log(`📝 更新文件: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`)
    return false
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  replacements.forEach(({ from, to, description }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from, 'g'), to)
      console.log(`   ✅ ${description}`)
      changed = true
    }
  })

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`   💾 文件已保存`)
  } else {
    console.log(`   ℹ️  无需更改`)
  }

  return changed
}

// 更新 games-db.ts
console.log('\n📄 更新 games-db.ts...')
updateFile('src/lib/games-db.ts', [
  {
    from: 'game_id: string;',
    to: 'id: string;',
    description: '更新数据库行接口中的字段名'
  },
  {
    from: 'id: row\\.game_id,',
    to: 'id: row.id,',
    description: '更新游戏对象创建时的id字段'
  },
  {
    from: 'id: gameData\\.game_id,',
    to: 'id: gameData.id,',
    description: '更新游戏数据对象创建时的id字段'
  },
  {
    from: '\\.eq\\(\'game_id\', gameId\\)',
    to: '.eq(\'id\', gameId)',
    description: '更新查询条件中的字段名'
  },
  {
    from: '\\.neq\\(\'game_id\', currentGameId\\)',
    to: '.neq(\'id\', currentGameId)',
    description: '更新排除条件中的字段名'
  },
  {
    from: '\\.in\\(\'game_id\', gameIds\\)',
    to: '.in(\'id\', gameIds)',
    description: '更新批量查询条件中的字段名'
  },
  {
    from: '\\.select\\(\'game_id, tag\'\\)',
    to: '.select(\'game_id, tag\')',
    description: '保持game_tags表的查询不变（这里game_id是外键）'
  },
  {
    from: '\\.select\\(\'game_id\'\\)',
    to: '.select(\'game_id\')',
    description: '保持game_tags表的查询不变'
  },
  {
    from: 'data\\.map\\(game => game\\.game_id\\)',
    to: 'data.map(game => game.id)',
    description: '更新数据映射中的字段名'
  },
  {
    from: 'tagsMap\\[row\\.game_id\\]',
    to: 'tagsMap[row.id]',
    description: '更新标签映射中的字段名'
  }
])

// 更新 migrate-data.js  
console.log('\n📄 更新 migrate-data.js...')
updateFile('scripts/migrate-data.js', [
  {
    from: 'game_id: game\\.id,',
    to: '// id字段会自动生成，不需要手动设置',
    description: '移除手动设置game_id，使用自动生成的主键'
  },
  {
    from: 'game_id: gameId,',
    to: 'game_id: gameId, // 这里的game_id是外键，引用games表的主键id',
    description: '标注外键引用关系'
  }
])

// 更新 verify-data.js
console.log('\n📄 更新 verify-data.js...')
updateFile('scripts/verify-data.js', [
  {
    from: 'game\\.game_id',
    to: 'game.id',
    description: '更新验证脚本中的字段引用'
  },
  {
    from: 'tag\\.game_id',
    to: 'tag.game_id',
    description: '保持标签表外键字段不变'
  },
  {
    from: 'hero\\.game_id',
    to: 'hero.game_id',
    description: '保持英雄表外键字段不变'
  }
])

console.log('\n🎉 代码更新完成！')
console.log('\n📋 下一步操作:')
console.log('1. 运行数据库优化脚本')
console.log('2. 测试所有功能是否正常')
console.log('3. 验证数据完整性') 