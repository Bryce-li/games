"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameCard } from '@/components/GameCard';
import { getAllGames, getGamesByCategory, BaseGame } from '@/lib/games';

interface CategoryPageContentProps {
  categorySlug: string;
  tag?: string;
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

export function CategoryPageContent({ categorySlug, tag }: CategoryPageContentProps) {
  const { t } = useTranslation();
  const [games, setGames] = useState<BaseGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allGames = getAllGames();
        let filteredGames: BaseGame[] = [];

        // 如果有标签参数，按标签过滤
        if (tag) {
          filteredGames = allGames.filter((game: BaseGame) => 
            game.tags.some((gameTag: string) => 
              gameTag.toLowerCase() === tag.toLowerCase()
            )
          );
        } else {
          // 按分类过滤游戏
          switch (categorySlug) {
            case 'new':
              // 使用新游戏函数
              filteredGames = require('@/lib/games').getNewGames();
              break;
              
            case 'trending':
              // 使用热门游戏函数
              filteredGames = require('@/lib/games').getHotGames();
              break;
              
            case 'updated':
              // 假设更新的游戏（这里可以根据实际情况调整）
              filteredGames = allGames.slice(0, 50);
              break;
              
            case 'multiplayer':
              filteredGames = allGames.filter((game: BaseGame) => 
                game.tags.some((tag: string) => tag.toLowerCase().includes('multiplayer'))
              );
              break;
              
            case 'two-player':
              filteredGames = allGames.filter((game: BaseGame) => 
                game.tags.some((tag: string) => 
                  tag.toLowerCase().includes('2 player') || 
                  tag.toLowerCase().includes('two player')
                )
              );
              break;
              
            default:
              // 使用按分类获取游戏的函数
              filteredGames = getGamesByCategory(categorySlug);
              if (filteredGames.length === 0) {
                // 如果没有匹配的分类，按标签搜索
                filteredGames = allGames.filter((game: BaseGame) => 
                  game.tags.some((tag: string) => 
                    tag.toLowerCase() === categorySlug.toLowerCase() ||
                    tag.toLowerCase().replace(' ', '-') === categorySlug.toLowerCase()
                  )
                );
              }
              break;
          }
        }

        setGames(filteredGames);
      } catch (err) {
        console.error('加载游戏时出错:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [categorySlug, tag]);

  const pageTitle = tag 
    ? `${tag} Games`
    : categoryTitles[categorySlug] || `${categorySlug} Games`;

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Games
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {pageTitle}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {games.length} games found
        </p>
      </div>

      {/* 游戏网格 */}
      {games.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} showTags />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Games Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {tag 
              ? `No games found with tag "${tag}" in ${categoryTitles[categorySlug] || categorySlug}`
              : `No games found in ${pageTitle}`
            }
          </p>
        </div>
      )}
    </div>
  );
} 