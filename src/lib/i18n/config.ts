import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言文件
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';

const defaultLanguage = 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      zh: {
        translation: zhTranslation,
      },
    },
    lng: defaultLanguage, // 设置默认语言
    fallbackLng: defaultLanguage,
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
      cookieMinutes: 160,
    },
    interpolation: {
      escapeValue: false,
    },
    debug: true, // 开启调试模式
    react: {
      useSuspense: true, // 启用 Suspense
      bindI18n: 'languageChanged loaded', // 监听语言变化和加载事件
      bindI18nStore: 'added removed', // 监听资源添加和移除事件
      transEmptyNodeValue: '', // 空值的默认显示
    },
  });

// 添加语言变化监听器
i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  document.documentElement.lang = lng; // 更新 HTML lang 属性
});

export default i18n; 