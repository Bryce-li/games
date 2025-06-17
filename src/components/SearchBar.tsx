"use client";

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ className = "", onSearch }: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'scale-105' : ''
      }`}>
        {/* 搜索图标 */}
        <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        
        {/* 搜索输入框 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('common.search', 'Search games...')}
          className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   placeholder-gray-400 transition-all duration-200"
        />
        
        {/* 清除按钮 */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {/* 搜索建议下拉框 (可选) */}
      {isFocused && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2 text-sm text-gray-500">
            Search for "{query}"...
          </div>
        </div>
      )}
    </form>
  );
} 