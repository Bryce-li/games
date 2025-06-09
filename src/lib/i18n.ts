import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 基础配置
const resources = {
    en: {
        common: {
            header: {
                title: "CrazyGames",
                language: "English"
            },
            home: {
                welcome: "Welcome to CrazyGames",
                feature1: "Free Games",
                feature2: "Mobile Games",
                feature3: "Browser Games",
                feature4: "Multiplayer Games",
                feature5: "No Download"
            }
            // ... 其他翻译
        }
    },
    zh: {
        common: {
            header: {
                title: "疯狂游戏",
                language: "中文"
            },
            home: {
                welcome: "欢迎来到疯狂游戏",
                feature1: "免费游戏",
                feature2: "手机游戏",
                feature3: "浏览器游戏",
                feature4: "多人游戏",
                feature5: "无需下载"
            }
            // ... 其他翻译
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n; 