"use client"

import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { useEffect, useState } from "react"

// 支持的语言列表
const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "简体中文" },
]

export function LanguageSelector() {
  const { i18n, t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 从localStorage获取上次的语言设置
    const savedLang = localStorage.getItem('i18nextLng')
    if (savedLang && savedLang !== i18n.language) {
      changeLanguage(savedLang)
    }
  }, [])

  // 获取当前语言
  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  // 切换语言
  const changeLanguage = async (langCode: string) => {
    try {
      setIsChanging(true)
      await i18n.changeLanguage(langCode)
      localStorage.setItem('i18nextLng', langCode)
      console.log('Language changed successfully to:', langCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    } finally {
      setIsChanging(false)
    }
  }

  // 服务端渲染时返回默认值
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Globe className="w-4 h-4" />
        <span suppressHydrationWarning>English</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        disabled={isChanging}
      >
        <Globe className="w-4 h-4" />
        <span suppressHydrationWarning>{currentLanguage.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer ${isChanging ? 'opacity-50' : ''}`}
            disabled={isChanging}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 