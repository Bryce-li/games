"use client";

import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '@/components/GlobalLoading';

interface NavigationOptions {
  delay?: number;
}

export function useNavigationWithLoading() {
  const router = useRouter();
  const { showLoading } = useGlobalLoading();

  const navigateWithLoading = async (
    path: string, 
    options: NavigationOptions = {}
  ) => {
    const {
      delay = 500 // 调整延迟时间，与GlobalLoading的最小加载时间配合
    } = options;

    try {
      // 显示加载状态
      showLoading();

      // 添加延迟以确保用户能看到加载动画
      await new Promise(resolve => setTimeout(resolve, delay));

      // 执行导航
      router.push(path);
      
      // 不立即隐藏加载状态，让页面加载完成后再隐藏
      // 页面加载完成后会自动触发新的渲染，此时加载状态会被清除
      
    } catch (error) {
      console.error('Navigation error:', error);
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