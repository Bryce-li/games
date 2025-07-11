"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameCard } from '@/components/GameCard';
import { MainLayout } from '@/components/MainLayout';
import { getAllGames, getGamesByCategory, BaseGame } from '@/lib/games';
import { getCategoryFullTitle } from '@/lib/i18n/utils';

interface CategoryPageContentProps {
  categorySlug: string;
  tag?: string;
}

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
        
        let filteredGames: BaseGame[] = [];

        // 按分类过滤游戏
        switch (categorySlug) {
          case 'new':
            // 使用新游戏函数
            const { getNewGames } = await import('@/lib/games');
            filteredGames = await getNewGames();
            break;
            
          case 'trending':
            // 使用热门游戏函数
            const { getHotGames } = await import('@/lib/games');
            filteredGames = await getHotGames();
            break;
            
          case 'updated':
            // 获取所有游戏，假设更新的游戏
            const allGames = await getAllGames();
            filteredGames = allGames.slice(0, 50);
            break;
            
          case 'multiplayer':
            const allMultiplayerGames = await getAllGames();
            filteredGames = allMultiplayerGames.filter((game: BaseGame) => 
              game.tags.some((gameTag: string) => gameTag.toLowerCase().includes('multiplayer'))
            );
            break;
            
          case 'two-player':
            const allTwoPlayerGames = await getAllGames();
            filteredGames = allTwoPlayerGames.filter((game: BaseGame) => 
              game.tags.some((gameTag: string) => 
                gameTag.toLowerCase().includes('2 player') || 
                gameTag.toLowerCase().includes('two player')
              )
            );
            break;
            
          default:
            // 使用按分类获取游戏的函数
            filteredGames = await getGamesByCategory(categorySlug);
            if (filteredGames.length === 0) {
              // 如果没有匹配的分类，按标签搜索
              const allCategoryGames = await getAllGames();
              filteredGames = allCategoryGames.filter((game: BaseGame) => 
                game.tags.some((gameTag: string) => 
                  gameTag.toLowerCase() === categorySlug.toLowerCase() ||
                  gameTag.toLowerCase().replace(' ', '-') === categorySlug.toLowerCase()
                )
              );
            }
            break;
        }

        // 如果有标签参数，再次按标签过滤
        if (tag && filteredGames.length > 0) {
          filteredGames = filteredGames.filter((game: BaseGame) => 
            game.tags.some((gameTag: string) => 
              gameTag.toLowerCase() === tag.toLowerCase()
            )
          );
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

  // 使用新的国际化函数生成页面标题
  const pageTitle = tag 
    ? `${tag} ${t('categories.gamesTitle', 'Games')}`
    : getCategoryFullTitle(t, categorySlug);

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full px-1 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(15).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="w-full px-1 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error Loading Games
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full px-1 py-8">
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
                ? `No games found with tag "${tag}" in ${getCategoryFullTitle(t, categorySlug)}`
                : `No games found in ${pageTitle}`
              }
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 