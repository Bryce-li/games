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

  // 将数据传递给客户端组件
  return (
    <PageContent 
      newGames={newGames}
      homepageCategoryData={homepageCategoryData}
      heroGames={heroGames}
    />
  )
}
