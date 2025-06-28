"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchGames, BaseGame } from '@/lib/games';

// SearchBarProps 接口
interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

// 高亮文本组件
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

export function SearchBar({ className = "", onSearch }: SearchBarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<BaseGame[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜索建议更新
  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.trim() && query.length >= 1) {
        try {
          const results = await searchGames(query, 5);
          setSuggestions(results);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('搜索出错:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    loadSuggestions();
  }, [query]);

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          // 选择建议项
          const selected = suggestions[selectedIndex];
          router.push(`/games/${selected.id}`);
          setQuery(selected.title);
          setIsFocused(false);
          setSuggestions([]);
        } else if (query.trim()) {
          // 执行搜索
          handleSearch(e);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setSuggestions([]);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('执行搜索:', query.trim());
      onSearch?.(query.trim());
      setIsFocused(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: BaseGame) => {
    setQuery(suggestion.title);
    setIsFocused(false);
    setSuggestions([]);
    router.push(`/games/${suggestion.id}`);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedIndex(-1);
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isFocused) setIsFocused(true);
  };

  const handleFocus = async () => {
    setIsFocused(true);
    if (query.trim() && query.length >= 1) {
      try {
        const results = await searchGames(query, 5);
        setSuggestions(results);
      } catch (error) {
        console.error('获取搜索建议出错:', error);
      }
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className={`relative flex items-center transition-all duration-200 ${
          isFocused ? 'scale-105' : ''
        }`}>
          {/* 搜索图标 */}
          <Search className="absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
          
          {/* 搜索输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={t('common.search', 'Search games...')}
            className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 transition-all duration-200"
            autoComplete="off"
          />
          
          {/* 清除按钮 */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>
      
      {/* 搜索建议下拉框 */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-purple-50 dark:bg-purple-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-700'}`}
            >
              {/* 游戏缩略图 */}
              <div className="w-12 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded overflow-hidden flex-shrink-0">
                {suggestion.image ? (
                  <img
                    src={suggestion.image}
                    alt={suggestion.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
                )}
              </div>
              
              {/* 游戏信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    <HighlightText text={suggestion.title} query={query} />
                  </h4>
                  {/* 根据布尔值参数动态显示badge */}
                  {suggestion.isNew && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                      NEW
                    </span>
                  )}
                  {suggestion.isHot && !suggestion.isNew && (
                    <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                      HOT
                    </span>
                  )}
                  {suggestion.isOriginal && !suggestion.isNew && !suggestion.isHot && (
                    <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded font-semibold">
                      ORIGINAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {suggestion.category} game
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && query && (
        <div className="absolute top-full left-0 right-0 mt-16 p-2 bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-600 dark:text-blue-400 rounded">
          查询: "{query}" | 结果数: {suggestions.length}
        </div>
      )}
    </div>
  );
} 