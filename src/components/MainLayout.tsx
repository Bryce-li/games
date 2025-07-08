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
      {/* 固定头部 */}
      <Header />

      {/* 主内容区域 */}
      <div className="flex pt-16"> {/* pt-16 为头部留出空间 */}
        {/* 左侧侧边栏 */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40"
        />

        {/* 主内容区域 */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-0' : 'ml-64'
          } ${className}`}
          style={{ 
            paddingLeft: isSidebarCollapsed ? '0' : '8px' // 8px 间距
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
} 