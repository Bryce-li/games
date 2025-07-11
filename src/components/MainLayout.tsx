"use client";

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className = "" }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 固定头部 - 传递侧边栏控制函数 */}
      <Header 
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* 主内容区域 */}
      <div className="flex pt-16"> {/* pt-16 为头部留出空间 */}
        {/* 左侧侧边栏 */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40"
        />

        {/* 主内容区域 - 调整左侧间距 */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-2' : 'ml-64'
          } ${className}`}
          style={{ 
            paddingLeft: isSidebarCollapsed ? '4px' : '4px', // 减少到4px左间距
            paddingRight: '4px' // 添加右侧4px间距
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
} 