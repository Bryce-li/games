"use client";

import { Globe, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { i18n } from "@/lib/i18n-config";
import { useState, useRef, useEffect } from "react";

interface LanguageSwitcherProps {
  currentLang: string;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // 切换语言
  const switchLanguage = (locale: string) => {
    const newPathname = pathname.replace(`/${currentLang}`, `/${locale}`);
    router.push(newPathname);
    setIsOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang === 'en' ? 'English' : '中文'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          {i18n.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLanguage(locale)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currentLang === locale
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {locale === 'en' ? 'English' : '中文'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 