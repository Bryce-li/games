"use client";

import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';

// 语言选项配置
const languages = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 获取当前语言的显示标签
  const getCurrentLanguageLabel = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang?.label || 'English';
  };

  // 切换语言
  const handleLanguageChange = async (langCode: string) => {
    if (langCode === i18n.language) return;

    // 更新 i18next 语言
    await i18n.changeLanguage(langCode);
    
    // 更新 localStorage
    localStorage.setItem('i18nextLng', langCode);
    
    // 更新 URL 参数
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', langCode);
    
    // 使用 replace 而不是 push 来避免在历史记录中创建新条目
    router.replace(`?${params.toString()}`);
    
    // 更新 cookie（可选，因为我们现在主要依赖 URL 参数和 localStorage）
    document.cookie = `i18next=${langCode};path=/;max-age=31536000`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-[120px] flex justify-between items-center"
        >
          <span>{getCurrentLanguageLabel()}</span>
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[120px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="justify-center"
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 