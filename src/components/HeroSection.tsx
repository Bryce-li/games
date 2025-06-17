"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ games }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 5000); // 5秒切换一次

    return () => clearInterval(interval);
  }, [games.length]);

  // 手动切换到指定索引
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * scrollContainerRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? games.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % games.length;
    goToSlide(newIndex);
  };

  return (
    <section className="relative mb-12">
      {/* 主轮播区域 */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-hidden"
          style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: 'transform 0.5s ease-in-out' }}
        >
          {games.map((game, index) => (
            <HeroGameCard 
              key={game.id} 
              game={game} 
              isActive={index === currentIndex}
            />
          ))}
        </div>

        {/* 左右导航按钮 */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
          aria-label="Previous game"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
          aria-label="Next game"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 指示器点 */}
      <div className="flex justify-center gap-2 mt-6">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
} 