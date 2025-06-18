import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPageContent } from './SearchPageContent';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  const category = searchParams.category || '';
  
  return {
    title: query 
      ? `搜索 "${query}" 的结果 - MiniPlayGame`
      : category
      ? `${category} 游戏 - MiniPlayGame`
      : '搜索游戏 - MiniPlayGame',
    description: query 
      ? `在 MiniPlayGame 中搜索 "${query}" 的游戏结果`
      : '发现你喜欢的游戏',
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent 
        query={searchParams.q || ''} 
        category={searchParams.category || ''}
      />
    </Suspense>
  );
}
