"use client";

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Suspense } from 'react';

// 分离标题组件以处理翻译加载状态
function HeaderTitle() {
  const { t } = useTranslation();
  return (
    <span className="font-bold text-xl text-gray-900">
      {t('common.header.title', 'CrazyGames')}
    </span>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto h-14">
          <div className="flex items-center justify-between h-full mx-4 lg:mx-8">
            {/* Logo 和标题 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">CG</span>
              </div>
              <Suspense fallback="CrazyGames">
                <HeaderTitle />
              </Suspense>
            </div>
            {/* 语言切换器 */}
            <div>
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
            © 2024 CrazyGames. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 