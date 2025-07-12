"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 全局加载状态上下文
interface GlobalLoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showError: (message: string) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

// 全局加载状态提供者
export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showLoading = (message: string = '加载中...') => {
    setLoadingMessage(message);
    setErrorMessage('');
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
    setErrorMessage('');
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsLoading(false);
    setLoadingMessage('');
    
    // 3秒后自动清除错误信息
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  return (
    <GlobalLoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      showLoading,
      hideLoading,
      showError
    }}>
      {children}
      
      {/* 全局加载遮罩 */}
      {(isLoading || errorMessage) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm mx-4 text-center">
            {isLoading ? (
              <>
                {/* 加载动画 */}
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {loadingMessage}
                </p>
              </>
            ) : (
              <>
                {/* 错误图标 */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
                  加载失败
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setErrorMessage('')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  确定
                </button>
              </>
            )}
          </div>
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