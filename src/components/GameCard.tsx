"use client";

import React from 'react';
import type { BaseGame } from '@/lib/games';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

interface GameCardProps {
  game: BaseGame;
  size?: "normal" | "small" | "large";
  className?: string;
  showTags?: boolean;
}

export function GameCard({ game, size = "normal", className = "", showTags = false }: GameCardProps) {
  const { handleClickWithLoading } = useNavigationWithLoading();

  const sizeClasses = {
    small: "w-full h-20",
    normal: "w-full aspect-video", 
    large: "w-full aspect-video"
  };

  const cardClass = `${sizeClasses[size]} block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 group ${className} cursor-pointer`;

  return (
    <div onClick={handleClickWithLoading(`/games/${game.id}`, {
      loadingMessage: `正在加载 ${game.title}...`,
      errorMessage: `加载游戏 "${game.title}" 失败，请重试`
    })} className={cardClass}>
      <div className="relative w-full h-full">
        {/* 游戏图片 */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* 徽章 - 根据布尔值参数动态显示 */}
        {game.isNew && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold z-10">
            NEW
          </div>
        )}
        
        {game.isHot && !game.isNew && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold z-10">
            HOT
          </div>
        )}
        
        {game.isOriginal && !game.isNew && !game.isHot && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold z-10">
            ORIGINAL
          </div>
        )}

        {/* 游戏信息 - 悬停时显示 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <h3 className="font-semibold text-sm truncate mb-1">
            {game.title}
          </h3>
          
          {/* 暂时不显示描述，因为BaseGame接口中没有description属性 */}
          
          <div className="flex items-center justify-between text-xs">
            <span className="capitalize text-gray-300">
              {game.category}
            </span>
            
            {showTags && game.tags.length > 0 && (
              <span className="text-purple-300">
                {game.tags[0]}
              </span>
            )}
          </div>
        </div>

        {/* 简化版标题 - 非悬停时显示 */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white group-hover:opacity-0 transition-opacity duration-200">
          <h3 className="font-medium text-xs truncate">
            {game.title}
          </h3>
        </div>
      </div>
    </div>
  );
} 