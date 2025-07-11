import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPageContent } from './SearchPageContent';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const category = resolvedSearchParams.category || '';
  
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

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';
  const category = resolvedParams?.category || '';

  return (
    <Suspense fallback={<SearchPageFallback />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-1 py-8">
          <SearchPageContent query={query} category={category} />
        </div>
      </div>
    </Suspense>
  );
}
