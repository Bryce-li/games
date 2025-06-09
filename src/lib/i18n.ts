import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

// 预加载翻译资源
const resources = {
  en: {
    common: require('../../public/locales/en.json')
  },
  zh: {
    common: require('../../public/locales/zh.json')
  }
};

// 创建 i18n 实例
const i18nInstance = i18n.createInstance();

// 配置 i18n
if (isClient) {
  i18nInstance
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next);
} else {
  i18nInstance.use(initReactI18next);
}

i18nInstance.init({
  // 默认语言
  fallbackLng: 'en',
  // 支持的语言
  supportedLngs: ['en', 'zh'],
  // 调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 预加载的翻译资源
  resources,
  
  // 后端配置（仅客户端）
  backend: isClient ? {
    loadPath: '/locales/{{lng}}.json',
    allowMultiLoading: false,
  } : undefined,
  
  // 检测语言的选项（仅客户端）
  detection: isClient ? {
    order: ['querystring', 'localStorage', 'cookie', 'navigator'],
    caches: ['localStorage'],
  } : undefined,
  
  interpolation: {
    escapeValue: false, // 不转义 HTML
  },

  // SSR 配置
  react: {
    useSuspense: true, // 启用 Suspense
    defaultTransParent: 'span', // 默认的包装元素
    transEmptyNodeValue: '', // 空节点的值
    transSupportBasicHtmlNodes: true, // 支持基本的 HTML 节点
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'], // 保留的基本 HTML 节点
  },

  // 确保在 SSR 时不会尝试加载翻译文件
  partialBundledLanguages: true,
  
  // 预加载所有命名空间
  ns: ['common'],
  defaultNS: 'common',
});

export default i18nInstance; 