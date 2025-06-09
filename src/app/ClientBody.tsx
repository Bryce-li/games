"use client";

import { useEffect } from "react";
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

export default function ClientBody({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  useEffect(() => {
    // 设置语言
    i18n.changeLanguage(lang);
    document.body.className = "antialiased";
  }, [lang]);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
