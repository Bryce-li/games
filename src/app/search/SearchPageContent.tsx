"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { SearchResults } from '@/components/SearchResults';
import { searchGames, getAllCategories, SearchResult } from '@/lib/search-utils';
import { getGamesByCategory, getAllGames } from '@/lib/games';

interface SearchPageContentProps {
  query?: string;
  category?: string;
}

export function SearchPageContent({ query: initialQuery, category: initialCategory }: SearchPageContentProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 执行搜索的函数
  const performSearch = useCallback(async (query: string, category: string) => {
    setIsLoading(true);
    try {
      let filteredResults: SearchResult[] = [];
      
      if (query.trim()) {
        // 如果有搜索词，使用搜索函数
        filteredResults = await searchGames(query, 100);
      } else if (category) {
        // 如果没有搜索词但有分类，按分类获取
        const categoryGames = await getGamesByCategory(category);
        filteredResults = categoryGames.map(game => ({
          id: game.id,
          title: game.title,
          description: '',
          image: game.image,
          category: game.category,
          isNew: game.isNew,
          isHot: game.isHot,
          isOriginal: game.isOriginal,
          matchType: 'category' as const
        }));
      } else {
        // 如果既没有搜索词也没有分类，获取所有游戏
        const allGames = await getAllGames();
        filteredResults = allGames.map(game => ({
          id: game.id,
          title: game.title,
          description: '',
          image: game.image,
          category: game.category,
          isNew: game.isNew,
          isHot: game.isHot,
          isOriginal: game.isOriginal,
          matchType: 'title' as const
        }));
      }

      // 如果选择了分类且有搜索词，进一步过滤结果
      if (category && query.trim()) {
        filteredResults = filteredResults.filter(game => 
          game.category.toLowerCase() === category.toLowerCase()
        );
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('搜索出错:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 当查询参数变化时，执行搜索
  useEffect(() => {
    performSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, performSearch]);

  // 处理搜索输入变化
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // 处理分类筛选
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="w-full px-1 py-8 pt-24">
        {/* 搜索结果标题 */}
        <div className="mb-6">
          {searchQuery ? (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              搜索 "{searchQuery}" 的结果
              {selectedCategory && (
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                  在 {selectedCategory} 分类中
                </span>
              )}
            </h1>
          ) : selectedCategory ? (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {selectedCategory} 游戏
            </h1>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              所有游戏
            </h1>
          )}
          
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            找到 {results.length} 个游戏
          </p>
        </div>

        {/* 分类筛选器 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            按分类筛选
          </h2>
          <div className="flex flex-wrap gap-2">
            {getAllCategories().map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索结果 */}
        <SearchResults 
          results={results} 
          query={searchQuery}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
