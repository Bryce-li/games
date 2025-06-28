"use client";

import React from 'react';
import Link from 'next/link';
import { GameConfig } from '@/lib/games';
import { formatGameDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface GameInfoProps {
  game: GameConfig;
}

export function GameInfo({ game }: GameInfoProps) {
  // 将标签转换为URL友好的格式
  const tagToSlug = (tag: string) => {
    return tag.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-8">
      {/* 游戏标签 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Game Tags</h3>
        <div className="flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <Link
              key={tag}
              href={`/games/category/${tagToSlug(tag)}?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* 游戏信息：发布时间和更新时间 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {game.publishDate && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Released</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatGameDate(game.publishDate)}
              </div>
            </div>
          </div>
        )}
        
        {game.lastUpdated && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatGameDate(game.lastUpdated)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 游戏描述 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Game Description</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{game.description}</p>
      </div>

      {/* 操作说明 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          How to play {game.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {game.instructions}
        </p>
      </div>
    </div>
  );
} 