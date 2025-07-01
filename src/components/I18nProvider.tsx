"use client"

import { I18nextProvider } from "react-i18next"
import i18n from "../lib/i18n/config"
import { useEffect, useState } from "react"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 在服务端直接返回children，避免水合问题
  if (!isClient) {
    return <>{children}</>
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
} 