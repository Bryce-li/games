"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

interface Game {
  id: string
  title: string
  image?: string
  thumbnail?: string
  isNew?: boolean
  isHot?: boolean
  isOriginal?: boolean
}

interface OptimizedGameCardProps {
  game: Game
  size?: 'small' | 'medium' | 'large'
  showTags?: boolean
  className?: string
}

export function OptimizedGameCard({ 
  game, 
  size = 'medium', 
  showTags = true,
  className = '' 
}: OptimizedGameCardProps) {
  const [imageError, setImageError] = useState(false)
  const { handleClickWithLoading } = useNavigationWithLoading()
  
  // 根据尺寸设置容器大小
  const sizeClasses = {
    small: 'w-40',
    medium: 'w-48', 
    large: 'w-56'
  }
  
  // 根据尺寸设置图片尺寸
  const imageDimensions = {
    small: { width: 160, height: 96 },
    medium: { width: 192, height: 115 },
    large: { width: 224, height: 134 }
  }
  
  const { width, height } = imageDimensions[size]
  const gameImageUrl = game.image || game.thumbnail || '/images/game-placeholder.jpg'

  return (
    <div 
      onClick={handleClickWithLoading(`/games/${game.id}`)}
      className={`block ${sizeClasses[size]} group ${className} cursor-pointer relative max-w-[500px]`}
    >
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200">
        
        {/* 游戏图片区域 */}
        <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
          {!imageError ? (
            <Image
              src={gameImageUrl}
              alt={game.title}
              width={width}
              height={height}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              decoding="async"
            />
          ) : (
            // 备用占位符
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="text-white text-xs opacity-75">🎮</div>
            </div>
          )}
          
          {/* 游戏标签徽章 */}
          {showTags && (
            <>
              {game.isNew && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  NEW
                </div>
              )}
              
              {game.isHot && !game.isNew && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  HOT
                </div>
              )}
              
              {game.isOriginal && !game.isNew && !game.isHot && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">
                  ORIGINAL
                </div>
              )}
            </>
          )}
        </div>
        
        {/* 游戏标题 */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 transition-colors">
            {game.title}
          </h3>
        </div>
      </div>
    </div>
  )
}

// 游戏卡片骨架加载组件
export function GameCardSkeleton({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-40',
    medium: 'w-48', 
    large: 'w-56'
  }

  return (
    <div className={`${sizeClasses[size]} animate-pulse`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  )
} 