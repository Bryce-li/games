"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import Link from 'next/link';

interface HeroGame {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  isNew?: boolean;
  isHot?: boolean;
}

interface HeroSectionProps {
  games: HeroGame[];
}

function HeroGameCard({ game, isActive }: { game: HeroGame; isActive: boolean }) {
  return (
    <div className="relative flex-shrink-0 w-full h-80 md:h-96 overflow-hidden rounded-2xl group">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20"></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-2xl">
            {/* 徽章 */}
            <div className="flex items-center gap-2 mb-4">
              {game.isNew && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  NEW
                </span>
              )}
              {game.isHot && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  HOT
                </span>
              )}
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-semibold">
                {game.category}
              </span>
            </div>

            {/* 标题 */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {game.title}
            </h1>

            {/* 描述 */}
            <p className="text-gray-200 text-lg mb-6 line-clamp-2 max-w-xl">
              {game.description}
            </p>

            {/* 按钮 */}
            <div className="flex items-center gap-4">
              <Link
                href={`/games/${game.id}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Play Now
              </Link>
              <Link
                href={`/games/${game.id}`}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 backdrop-blur-sm flex items-center gap-2"
              >
                <Info className="w-5 h-5" />
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ games }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 手动切换到指定索引
  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? games.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % games.length;
    goToSlide(newIndex);
  };

  // 自动轮播
  useEffect(() => {
    if (games.length <= 1) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // 5秒切换一次

    return () => clearInterval(interval);
  }, [currentIndex, games.length, goToNext]);

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="relative mb-12">
      {/* 主轮播区域 */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            width: '100%'
          }}
        >
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className="w-full flex-shrink-0" 
              style={{ minWidth: '100%' }}
            >
              <HeroGameCard 
                game={game} 
                isActive={index === currentIndex}
              />
            </div>
          ))}
        </div>

        {/* 左右导航按钮 - 只在多个游戏时显示 */}
        {games.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors duration-200 backdrop-blur-sm disabled:opacity-50"
              aria-label="Previous game"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors duration-200 backdrop-blur-sm disabled:opacity-50"
              aria-label="Next game"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* 指示器点 - 只在多个游戏时显示 */}
      {games.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {games.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                index === currentIndex ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
} 