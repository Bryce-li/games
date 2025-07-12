"use client";

import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '@/components/GlobalLoading';

interface NavigationOptions {
  loadingMessage?: string;
  errorMessage?: string;
  delay?: number;
}

export function useNavigationWithLoading() {
  const router = useRouter();
  const { showLoading, hideLoading, showError } = useGlobalLoading();

  const navigateWithLoading = async (
    path: string, 
    options: NavigationOptions = {}
  ) => {
    const {
      loadingMessage = '正在加载...',
      errorMessage = '页面加载失败，请重试',
      delay = 150
    } = options;

    try {
      // 显示加载状态
      showLoading(loadingMessage);

      // 添加延迟以显示加载动画
      await new Promise(resolve => setTimeout(resolve, delay));

      // 执行导航
      router.push(path);
      
      // 导航成功后隐藏加载状态
      hideLoading();
    } catch (error) {
      console.error('Navigation error:', error);
      showError(errorMessage);
    }
  };

  const handleClickWithLoading = (
    path: string,
    options: NavigationOptions = {}
  ) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      navigateWithLoading(path, options);
    };
  };

  return {
    navigateWithLoading,
    handleClickWithLoading
  };
} 