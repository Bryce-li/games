import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言文件
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';

const defaultLanguage = 'en';

// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

// 只有在客户端时才使用语言检测器
if (isClient) {
  i18n.use(LanguageDetector);
}

i18n
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
    
    // 只在客户端使用语言检测
    detection: isClient ? {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
      cookieMinutes: 160,
    } : undefined,
    
    interpolation: {
      escapeValue: false,
    },
    
    // 只在开发环境开启调试
    debug: process.env.NODE_ENV === 'development' && isClient,
    
    react: {
      useSuspense: false, // 改为false以解决SSR问题
      bindI18n: 'languageChanged loaded', // 监听语言变化和加载事件
      bindI18nStore: 'added removed', // 监听资源添加和移除事件
      transEmptyNodeValue: '', // 空值的默认显示
    },

    // SSR兼容性配置
    initImmediate: false, // 允许同步初始化
    cleanCode: true, // 清理语言代码
    
    // 确保所有资源都已预加载
    partialBundledLanguages: true,
    preload: ['en', 'zh'], // 预加载所有语言
  });

// 只在客户端添加语言变化监听器
if (isClient && i18n.isInitialized) {
  i18n.on('languageChanged', (lng) => {
    console.log('Language changed to:', lng);
    if (document && document.documentElement) {
      document.documentElement.lang = lng; // 更新 HTML lang 属性
    }
  });
}

export default i18n; 