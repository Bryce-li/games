import type { Metadata } from 'next'
import { PageContent } from '@/components/PageContent'
import { 
  getNewGames, 
  getAllHomepageCategoryData, 
  getHeroGames 
} from "@/lib/games"

// SEO元数据配置
export const metadata: Metadata = {
  title: 'MiniPlayGame - Free Online Games',
  description: 'Play free online games including action, adventure, puzzle, and more. Discover new games daily!',
  keywords: 'free games, online games, browser games, mini games',
}

export default async function Home() {
  // 在服务器端获取所有需要的数据
  const [newGames, homepageCategoryData, heroGames] = await Promise.all([
    getNewGames(),
    getAllHomepageCategoryData(),
    getHeroGames()
  ])

  // 添加调试信息
  console.log('=== 主页数据加载完成 ===')
  console.log('新游戏数量:', newGames.length)
  console.log('分类数据:', Object.keys(homepageCategoryData))
  console.log('英雄区游戏数量:', heroGames.length)
  console.log('英雄区游戏详情:', heroGames)

  // 将数据传递给客户端组件
  return (
    <PageContent 
      newGames={newGames}
      homepageCategoryData={homepageCategoryData}
      heroGames={heroGames}
    />
  )
}
