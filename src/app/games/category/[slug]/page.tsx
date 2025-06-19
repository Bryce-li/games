import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { CategoryPageContent } from './CategoryPageContent';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    tag?: string;
  }>;
}

// 分类标题映射
const categoryTitles: Record<string, string> = {
  // 主要导航
  'new': 'New Games',
  'trending': 'Trending Now', 
  'updated': 'Updated Games',
  'multiplayer': 'Multiplayer Games',
  'two-player': '2 Player Games',
  
  // 游戏分类
  'action': 'Action Games',
  'adventure': 'Adventure Games',
  'basketball': 'Basketball Games',
  'beauty': 'Beauty Games',
  'bike': 'Bike Games',
  'car': 'Car Games',
  'card': 'Card Games',
  'casual': 'Casual Games',
  'clicker': 'Clicker Games',
  'controller': 'Controller Games',
  'dress-up': 'Dress Up Games',
  'driving': 'Driving Games',
  'escape': 'Escape Games',
  'flash': 'Flash Games',
  'fps': 'FPS Games',
  'horror': 'Horror Games',
  'io': '.io Games',
  'mahjong': 'Mahjong Games',
  'minecraft': 'Minecraft Games',
  'pool': 'Pool Games',
  'puzzle': 'Puzzle Games',
  'shooting': 'Shooting Games',
  'soccer': 'Soccer Games',
  'sports': 'Sports Games',
  'stickman': 'Stickman Games',
  'tower-defense': 'Tower Defense Games',
};

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams.slug;
  const tag = resolvedSearchParams?.tag;
  const categoryTitle = categoryTitles[categorySlug] || `${categorySlug} Games`;
  
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
    <MainLayout>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(15).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      }>
        <CategoryPageContent 
          categorySlug={resolvedParams.slug}
          tag={resolvedSearchParams?.tag}
        />
      </Suspense>
    </MainLayout>
  );
} 