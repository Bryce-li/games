"use client";

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  image?: string;
  badge?: string;
  isOriginal?: boolean;
}

interface HorizontalGamesListProps {
  title: string;
  games: Game[];
  viewMoreHref?: string;
}

function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.id}`} className="block flex-shrink-0 w-48 group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
          {game.image ? (
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
          )}
          {game.badge && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
              {game.badge}
            </div>
          )}
          {game.isOriginal && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">
              ORIGINAL
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 transition-colors">
            {game.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export function HorizontalGamesList({ title, games, viewMoreHref }: HorizontalGamesListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-8">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <div className="flex items-center gap-2">
          {viewMoreHref && (
            <Link
              href={viewMoreHref}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm mr-4"
            >
              View More
            </Link>
          )}
          {/* 滚动控制按钮 */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 游戏列表 */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
} 