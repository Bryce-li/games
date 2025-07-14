"use client";

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { Suspense } from 'react';

// 注释：HeaderTitle组件已被Logo组件替代

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="container mx-auto h-16">
          <div className="flex items-center justify-between h-full mx-4 lg:mx-8 gap-4">
            {/* Logo 和标题 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Logo href="/" size="sm" showText={true} />
            </div>
            
            {/* 中间搜索框 */}
            <div className="flex-1 max-w-md mx-4">
              <SearchBar 
                onSearch={(query) => {
                  // 这里可以添加搜索逻辑
                }}
              />
            </div>
            
            {/* 右侧按钮组 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 MiniPlayGame. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 