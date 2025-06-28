"use client";

import React from 'react';
import Link from 'next/link';
import { SearchResult } from '@/lib/search-utils';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
}

// 高亮文本组件
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

function GameCard({ result, query }: { result: SearchResult; query: string }) {
  return (
    <Link 
      href={`/games/${result.id}`} 
      className="group block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* 游戏图片 */}
      <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
        {result.image ? (
          <img
            src={result.image}
            alt={result.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
        )}
        
        {/* 徽章 - 根据布尔值参数动态显示 */}
        {result.isNew && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
            NEW
          </div>
        )}
        
        {result.isHot && !result.isNew && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
            HOT
          </div>
        )}
        
        {result.isOriginal && !result.isNew && !result.isHot && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">
            ORIGINAL
          </div>
        )}
      </div>
      
      {/* 游戏信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
          <HighlightText text={result.title} query={query} />
        </h3>
        
        {result.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {result.matchType === 'description' ? (
              <HighlightText text={result.description} query={query} />
            ) : (
              result.description
            )}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="capitalize">
            {result.matchType === 'category' ? (
              <HighlightText text={result.category} query={query} />
            ) : (
              result.category
            )}
          </span>
          {result.matchType !== 'title' && (
            <>
              <span>•</span>
              <span className="text-purple-600 dark:text-purple-400">
                匹配{result.matchType === 'category' ? '分类' : '描述'}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SearchResults({ results, query, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array(10).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            没有找到相关游戏
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {query ? `抱歉，没有找到与 "${query}" 相关的游戏。` : '暂无游戏数据。'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            尝试使用不同的关键词或浏览其他分类
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {results.map((result) => (
        <GameCard 
          key={result.id} 
          result={result} 
          query={query}
        />
      ))}
    </div>
  );
}
