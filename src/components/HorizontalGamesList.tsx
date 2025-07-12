"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

interface Game {
  id: string;
  title: string;
  image?: string;
  isNew?: boolean;
  isHot?: boolean;
  isOriginal?: boolean;
}

interface HorizontalGamesListProps {
  title: string;
  games: Game[];
  viewMoreHref?: string;
}

function GameCard({ game, isVisible }: { game: Game; isVisible: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { handleClickWithLoading } = useNavigationWithLoading();

  return (
    <div onClick={handleClickWithLoading(`/games/${game.id}`, {
      loadingMessage: `正在加载 ${game.title}...`,
      errorMessage: `加载游戏 "${game.title}" 失败，请重试`
    })} className="block w-full group cursor-pointer">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
          {game.image && isVisible ? (
            <img
              ref={imgRef}
              src={game.image}
              alt={game.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
          )}
          
          {/* 徽章显示 - 根据布尔值参数动态显示，按优先级排序 */}
          {game.isNew && (
            <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
              NEW
            </div>
          )}
          
          {game.isHot && !game.isNew && (
            <div className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
              HOT
            </div>
          )}
          
          {game.isOriginal && !game.isNew && !game.isHot && (
            <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded font-semibold">
              ORIGINAL
            </div>
          )}
          
          {/* 游戏标题 - 悬停时显示 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <h3 className="font-semibold text-xs text-white truncate">
              {game.title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HorizontalGamesList({ title, games, viewMoreHref }: HorizontalGamesListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());

  // Intersection Observer 实现懒加载
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observeCard = useCallback((cardElement: Element, gameId: string) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const gameId = entry.target.getAttribute('data-game-id');
            if (gameId) {
              if (entry.isIntersecting) {
                setVisibleCards(prev => new Set(prev).add(gameId));
              }
            }
          });
        },
        {
          rootMargin: '50px', // 提前50px开始加载
          threshold: 0.1
        }
      );
    }
    
    if (observerRef.current && cardElement) {
      observerRef.current.observe(cardElement);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // 生成唯一的key前缀，使用title的哈希值确保唯一性
  const keyPrefix = React.useMemo(() => {
    // 使用简单的哈希函数生成基于title的唯一标识符
    let hash = 0;
    const str = title + (viewMoreHref || ''); // 包含href确保更大的唯一性
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return `list-${Math.abs(hash)}`;
  }, [title, viewMoreHref]);

  return (
    <section className="mb-3">
      {/* 标题栏 - 紧凑布局 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* 分类名字体更小 */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {/* View More按钮靠近分类名 */}
          {viewMoreHref && (
            <Link
              href={viewMoreHref}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-xs"
            >
              View More
            </Link>
          )}
        </div>
        
        {/* 滚动控制按钮保持在右侧，尺寸更小 */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={scrollLeft}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={scrollRight}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* 游戏列表 - 自适应宽度，最小180px，最多12个游戏 */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[max(180px,calc((100%-11*6px)/12))] gap-1.5 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game) => (
            <div
              key={`${keyPrefix}-${game.id}`}
              data-game-id={game.id}
              ref={(el) => {
                if (el) {
                  observeCard(el, game.id);
                }
              }}
            >
              <GameCard 
                game={game} 
                isVisible={visibleCards.has(game.id)}
              />
            </div>
          ))}
        </div>

        {/* 渐变边缘效果 */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
} 