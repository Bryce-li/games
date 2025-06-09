"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";
import Layout from "../components/Layout";

export default function ClientBody({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  useEffect(() => {
    // 确保服务端和客户端使用相同的语言设置
    if (typeof window !== 'undefined') {
      // 如果 URL 中有语言参数，优先使用
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      
      // 按优先级使用：URL参数 > props传入的lang > localStorage > 默认值'en'
      const finalLang = urlLang || lang || localStorage.getItem('i18nextLng') || 'en';
      
      // 只有当当前语言与目标语言不同时才切换
      if (i18n.language !== finalLang) {
        i18n.changeLanguage(finalLang);
      }
      
      // 同步更新 localStorage
      localStorage.setItem('i18nextLng', finalLang);
    }
  }, [lang]);

  useEffect(() => {
    // 设置 body 类名
    document.body.className = "antialiased";
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Layout>{children}</Layout>
    </I18nextProvider>
  );
}
