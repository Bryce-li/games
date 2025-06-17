"use client";

import React from 'react';
import Link from 'next/link';
import { GameConfig } from '@/lib/games-config';

interface GameSidebarProps {
  games: GameConfig[];
  className?: string;
}

function GameCard({ game, size = "normal" }: { game: GameConfig; size?: "normal" | "small" }) {
  const cardClass = size === "small" 
    ? "w-full h-[85px]" // 153*85px 比例保持
    : "w-[153px] h-[85px]";
    
  return (
    <Link 
      href={`/games/${game.id}`}
      className={`${cardClass} block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group`}
    >
      <div className="relative w-full h-full">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        {game.isNew && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded font-semibold">
            NEW
          </div>
        )}
        {game.isOriginal && (
          <div className="absolute top-1 left-1 bg-yellow-400 text-black text-xs px-1 py-0.5 rounded font-semibold">
            ORIGINAL
          </div>
        )}
        {/* 悬停时显示标题 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <div className="truncate">{game.title}</div>
        </div>
      </div>
    </Link>
  );
}

export function GameSidebar({ games, className = "" }: GameSidebarProps) {
  return (
    <>
      {/* 桌面端侧边栏：大屏幕时显示在右侧 */}
      <div className={`hidden xl:block ${className}`}>
        {/* 两列布局，最大宽度340px */}
        <div className="w-[340px] space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Games</h3>
          <div className="grid grid-cols-2 gap-3">
            {games.slice(0, 8).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>

      {/* 中等屏幕：一列布局 */}
      <div className={`hidden lg:block xl:hidden ${className}`}>
        <div className="w-[170px] space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended</h3>
          <div className="space-y-3">
            {games.slice(0, 6).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>

      {/* 小屏幕：游戏下方4x3布局 */}
      <div className="block lg:hidden w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Games</h3>
        <div className="grid gap-3" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(153px, 1fr))'
        }}>
          {games.slice(0, 12).map((game) => (
            <GameCard key={game.id} game={game} size="small" />
          ))}
        </div>
      </div>
    </>
  );
} 