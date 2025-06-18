"use client";

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化主题状态
  useEffect(() => {
    // 防止服务器端渲染时出现不一致
    if (typeof window === 'undefined') return;

    try {
      // 检查本地存储或系统偏好
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      
      console.log('主题初始化:', {
        savedTheme,
        prefersDark,
        shouldBeDark,
        currentClasses: document.documentElement.classList.toString()
      });
      
      setIsDark(shouldBeDark);
      
      // 应用主题到document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('主题初始化失败:', error);
      setIsInitialized(true);
    }
  }, []);

  const toggleTheme = () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      
      console.log('切换主题:', {
        from: isDark ? 'dark' : 'light',
        to: newTheme ? 'dark' : 'light'
      });
      
      // 保存到本地存储
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      
      // 应用到document
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // 强制重新渲染页面样式
      setTimeout(() => {
        const event = new Event('themechange');
        window.dispatchEvent(event);
      }, 50);
      
    } catch (error) {
      console.error('主题切换失败:', error);
    }
  };

  // 在初始化完成前显示占位符
  if (!isInitialized) {
    return (
      <div className="p-2 rounded-lg w-9 h-9 bg-gray-100 dark:bg-gray-800 animate-pulse">
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
      )}
    </button>
  );
} 