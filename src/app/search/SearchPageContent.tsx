"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SearchResults } from '@/components/SearchResults';
import { searchGames, getGamesByCategory, getAllCategories, SearchResult } from '@/lib/search-utils';
import { getGameConfig } from '@/lib/games';
import { useTranslation } from 'react-i18next';

interface SearchPageContentProps {
  query: string;
  category: string;
}

export function SearchPageContent({ query: initialQuery, category: initialCategory }: SearchPageContentProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 执行搜索
  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      
      let searchResults: SearchResult[] = [];
      
      if (searchQuery.trim()) {
        // 文本搜索
        searchResults = await searchGames(searchQuery, 50);
        
        // 如果还选择了分类，进一步筛选
        if (selectedCategory) {
          searchResults = searchResults.filter(result => 
            result.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
      } else if (selectedCategory) {
        // 只按分类筛选
        const categoryGames = await getGamesByCategory(selectedCategory);

        // 批量获取游戏配置以提高性能
        const gameConfigPromises = categoryGames.map(async (game) => {
          const gameConfig = await getGameConfig(game.id);
          return {
            id: game.id,
            title: game.title,
            description: gameConfig?.description,
            image: game.image,
            category: game.category,
            isNew: game.isNew,
            isHot: game.isHot,
            isOriginal: game.isOriginal,
            matchType: 'category' as const
          };
        });

        searchResults = await Promise.all(gameConfigPromises);
      }
      
      setResults(searchResults);
      setIsLoading(false);
    };

    performSearch();
  }, [searchQuery, selectedCategory]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
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
        <div className="mb-6">
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
