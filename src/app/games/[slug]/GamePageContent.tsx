"use client";

import React from 'react';
import { GameConfig } from '@/lib/games';
import { GamePlayer } from '@/components/GamePlayer';
import { GameSidebar } from '@/components/GameSidebar';
import { GameInfo } from '@/components/GameInfo';

interface GamePageContentProps {
  game: GameConfig;
  recommendedGames: GameConfig[];
}

export function GamePageContent({ game, recommendedGames }: GamePageContentProps) {
  return (
          <div className="w-full px-1 py-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{game.title}</h1>
      </div>

      {/* 游戏区域 */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* 游戏播放器区域 */}
        <div className="flex-1">
          <GamePlayer 
            embedUrl={game.embedUrl} 
            title={game.title}
            className="mb-6"
          />
          
          {/* 小屏幕下的推荐游戏 */}
          <div className="lg:hidden">
            <GameSidebar games={recommendedGames} />
          </div>
        </div>

        {/* 右侧边栏 - 大屏幕显示 */}
        <div className="hidden lg:block">
          <GameSidebar games={recommendedGames} />
        </div>
      </div>

      {/* 游戏信息区域 */}
      <div className="max-w-4xl">
        <GameInfo game={game} />
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-200">
        <div className="w-full px-1 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 MiniPlayGame. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 