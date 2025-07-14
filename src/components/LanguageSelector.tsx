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
import i18n from "@/lib/i18n/config"

// 支持的语言列表
const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "简体中文" },
]

export function LanguageSelector() {
  const { i18n, t } = useTranslation()
  const [isReady, setIsReady] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on("initialized", () => setIsReady(true))
    } else {
      setIsReady(true)
    }
  }, [i18n])

  // 获取当前语言
  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  // 切换语言
  const changeLanguage = (lng: string) => {
    if (isReady) {
      setIsChanging(true)
      i18n.changeLanguage(lng)
      localStorage.setItem('i18nextLng', lng)
    }
  }

  // 服务端渲染时返回默认值
  if (!isReady) {
    return <div>{t('common.loadingLanguages', 'Loading languages...')}</div>
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