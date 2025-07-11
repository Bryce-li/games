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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* 固定头部 - 传递侧边栏控制函数 */}
      <Header 
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* 主内容区域 */}
      <div className="flex h-[calc(100vh-4rem)]"> {/* 固定高度，减去头部高度 */}
        {/* 左侧侧边栏 */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40"
        />

        {/* 主内容区域 - 修复滚动问题 */}
        <main 
          className={`flex-1 transition-all duration-300 overflow-y-auto ${
            isSidebarCollapsed ? 'ml-2' : 'ml-64'
          } ${className}`}
          style={{ 
            paddingLeft: isSidebarCollapsed ? '4px' : '4px',
            paddingRight: '4px'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
} 