"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  href?: string
}

export function Logo({ size = 'md', showText = true, className = '', href = '/' }: LogoProps) {
  // 根据尺寸设置图标大小
  const iconSizes = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 }, 
    lg: { width: 48, height: 48 }
  }

  const currentSize = iconSizes[size]

  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG图标 - 使用/src/app/icon.svg */}
      <div className="flex items-center justify-center">
        <Image 
          src="/logo.svg" 
          alt="MiniPlayGame Logo" 
          width={currentSize.width} 
          height={currentSize.height}
          className="object-contain"
          priority
        />
      </div>
      
      {/* 文字部分 */}
      {showText && (
        <div className="hidden sm:block">
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">MiniPlayGame</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Play & Enjoy</p>
        </div>
      )}
    </div>
  )

  // 如果提供了链接，包装在Link中
  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return logoContent
} 