"use client";

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Suspense } from 'react';

// 分离标题组件以处理翻译加载状态
function HeaderTitle() {
  const { t } = useTranslation();
  return (
    <span className="font-bold text-xl text-gray-900 dark:text-gray-100">
      {t('common.header.title', 'MiniPlayGame')}
    </span>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="container mx-auto h-16">
          <div className="flex items-center justify-between h-full mx-4 lg:mx-8 gap-4">
            {/* Logo 和标题 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <Suspense fallback="MiniPlayGame">
                <HeaderTitle />
              </Suspense>
            </div>
            
            {/* 中间搜索框 */}
            <div className="flex-1 max-w-md mx-4">
              <SearchBar 
                onSearch={(query) => {
                  console.log('搜索:', query);
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