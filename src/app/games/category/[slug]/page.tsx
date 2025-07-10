import { Metadata } from 'next'
import { CategoryPageContent } from './CategoryPageContent'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tag?: string }>
}

// 服务端元数据生成的简化分类映射
// 由于在服务端无法使用 useTranslation，我们使用静态映射
const getCategoryTitleForMeta = (categorySlug: string): string => {
  const specialCategories: Record<string, string> = {
    'new': 'New Games',
    'trending': 'Trending Now',
    'updated': 'Updated Games',
    'multiplayer': 'Multiplayer Games',
    'two-player': '2 Player Games',
    'featured': 'Featured Games'
  }

  if (specialCategories[categorySlug]) {
    return specialCategories[categorySlug]
  }

  // 普通分类的映射
  const categoryNames: Record<string, string> = {
    'action': 'Action',
    'adventure': 'Adventure',
    'basketball': 'Basketball',
    'beauty': 'Beauty',
    'bike': 'Bike',
    'car': 'Car',
    'card': 'Card',
    'casual': 'Casual',
    'clicker': 'Clicker',
    'controller': 'Controller',
    'dress-up': 'Dress Up',
    'driving': 'Driving',
    'escape': 'Escape',
    'flash': 'Flash',
    'fps': 'FPS',
    'horror': 'Horror',
    'io': '.io',
    'mahjong': 'Mahjong',
    'minecraft': 'Minecraft',
    'pool': 'Pool',
    'puzzle': 'Puzzle',
    'shooting': 'Shooting',
    'soccer': 'Soccer',
    'sports': 'Sports',
    'stickman': 'Stickman',
    'tower-defense': 'Tower Defense',
  }

  const categoryName = categoryNames[categorySlug] || categorySlug
  return `${categoryName} Games`
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams.slug;
  const tag = resolvedSearchParams?.tag;
  
  // 使用简化的标题生成函数
  const categoryTitle = getCategoryTitleForMeta(categorySlug);
  
  const title = tag 
    ? `${tag} Games - ${categoryTitle} - MiniPlayGame`
    : `${categoryTitle} - MiniPlayGame`;
    
  const description = tag
    ? `Play ${tag} games in the ${categoryTitle.toLowerCase()} category on MiniPlayGame`
    : `Discover amazing ${categoryTitle.toLowerCase()} on MiniPlayGame. Play free browser games online.`;

  return {
    title,
    description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <CategoryPageContent 
      categorySlug={resolvedParams.slug}
      tag={resolvedSearchParams?.tag}
    />
  );
} 