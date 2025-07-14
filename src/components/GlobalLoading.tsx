"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// 全局加载状态上下文
interface GlobalLoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

// 全局加载状态提供者
export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const loadingStartTime = useRef<number>(0);

  // 监听路由变化，页面加载完成时延迟清除加载状态
  useEffect(() => {
    if (isLoading) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - loadingStartTime.current;
      const minLoadingTime = 1000; // 最小加载时间1秒
      
      if (elapsedTime < minLoadingTime) {
        // 如果加载时间不足1秒，延迟清除
        const remainingTime = minLoadingTime - elapsedTime;
        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      } else {
        // 如果已经加载足够长时间，立即清除
        setIsLoading(false);
      }
    }
  }, [pathname, isLoading]);

  const showLoading = () => {
    setIsLoading(true);
    loadingStartTime.current = Date.now();
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <GlobalLoadingContext.Provider value={{
      isLoading,
      showLoading,
      hideLoading
    }}>
      {children}
      
      {/* 全局加载遮罩 - 只显示透明转圈动画 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}

// 使用全局加载状态的Hook
export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
} 