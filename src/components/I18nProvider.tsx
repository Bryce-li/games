"use client"

import { I18nextProvider } from "react-i18next"
import i18n from "../lib/i18n/config"
import { useEffect, useState, Suspense } from "react"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="min-h-screen bg-white" /> // 返回一个占位符，避免布局跳动
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </Suspense>
  )
} 