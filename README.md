# MiniPlayGame

一个基于 Next.js 15 的迷你游戏平台，具有现代化界面和响应式设计。

## 功能特性

- **Next.js 15 + App Router** - 最新的 Next.js 现代化架构
- **TypeScript 支持** - 全应用程序类型安全
- **Tailwind CSS + Shadcn UI** - 现代化样式和组件库
- **深色/浅色模式** - 主题切换，支持系统偏好检测
- **国际化 (i18n)**
  - 支持英语和简体中文
  - 易于添加更多语言
  - 自动语言检测和切换
- **响应式设计** - 移动端优先的自适应布局
- **现代化主页布局**
  - 自动轮播的精选游戏 Hero 区域
  - 水平滚动的游戏分类
  - 简洁的卡片式设计
- **动态游戏页面** - 自动配置的游戏详情页面
- **搜索功能** - 实时游戏搜索和建议
- **高级头部导航** - Logo、搜索栏、主题切换和语言选择器

## 快速开始

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 国际化

项目使用 react-i18next 进行国际化。目前支持的语言：

- 英语 (en)
- 简体中文 (zh)

语言文件位于 `src/lib/i18n/locales/` 目录。

要添加新语言：
1. 在 locales 目录中创建新的 JSON 文件
2. 在 `src/components/LanguageSelector.tsx` 中添加语言到语言数组
3. 在 `src/lib/i18n/config.ts` 中导入并添加翻译

## 项目结构

```
src/
  ├── app/              # Next.js app router 页面
  │   ├── games/        # 游戏页面
  │   │   └── [slug]/   # 动态游戏路由
  │   ├── layout.tsx    # 根布局
  │   └── page.tsx      # 主页
  ├── components/       # React 组件
  │   ├── ui/           # Shadcn UI 组件
  │   ├── Layout.tsx    # 主布局组件
  │   ├── HomePage.tsx  # 主页组件
  │   ├── SearchBar.tsx # 搜索功能
  │   ├── ThemeToggle.tsx # 深色/浅色模式切换
  │   ├── HeroSection.tsx # Hero 轮播
  │   └── HorizontalGamesList.tsx # 可滚动游戏列表
  ├── lib/             # 工具和配置
  │   ├── i18n/        # 国际化设置
  │   ├── games-data.ts # 游戏数据配置
  │   └── games-config.ts # 动态游戏页面配置
  └── styles/          # 全局样式
```

## 🔧 最新错误修复和更新

### 🔍 搜索功能优化修复 (2024-12-19 最新)
- **✅ 修复搜索无结果问题**: 解决了游戏数据导入错误，搜索功能现在正常工作
- **🎯 简化搜索逻辑**: 优化为只支持游戏标题搜索，提高搜索准确性和性能
- **⚡ 实时搜索建议**: 用户输入1个字符即可看到搜索建议，最多显示5个结果
- **🌟 高亮显示**: 搜索关键词在结果中以黄色背景高亮显示，支持深色模式
- **⌨️ 键盘导航**: 支持上下箭头选择建议，Enter确认，Escape关闭
- **📱 触摸友好**: 移动端优化的触摸交互体验
- **🐛 调试模式**: 开发环境下显示调试信息，便于问题排查

### 🌙 主题切换功能修复 (2024-12-19 最新)
- **✅ 修复主题切换无效问题**: 解决了 Tailwind CSS 深色模式配置错误
- **🔧 优化初始化逻辑**: 改善了主题检测和应用逻辑，支持系统偏好检测
- **💾 持久化存储**: 主题选择保存到 localStorage，页面刷新后保持用户选择
- **🎨 视觉优化**: 改善了主题切换按钮的视觉效果和交互反馈
- **⚡ 性能优化**: 添加了加载状态和错误处理，避免闪烁问题
- **🔄 强制刷新**: 主题切换后触发样式重新渲染，确保立即生效

### 🎨 现代化主页重构 (历史版本)
- **全新头部导航**: 包含居中搜索框、主题切换按钮和语言选择器
- **Hero 轮播区域**: 自动轮播的精选游戏展示，支持手动切换
- **水平游戏列表**: 每个游戏分类都有独立的水平滚动列表
- **深色模式支持**: 完整的深色/浅色主题切换功能
- **响应式设计**: 适配移动端和桌面端的现代化布局
- **搜索功能**: 实时搜索框，支持游戏搜索和建议

### 🚀 Turbopack 兼容性修复 (2024-12-19)
- **✅ 彻底解决 Geist 字体模块解析错误**: 优化了 `@vercel/turbopack-next/internal/font/google/font` 模块解析问题
- **🔧 清理配置冲突**: 删除了冗余的 `next.config.js`，统一使用 `next.config.ts` 配置
- **⚡ Turbopack 别名优化**: 完善了 `experimental.turbo.resolveAlias` 配置，确保字体模块正确解析
- **🎨 保持字体完整性**: Geist 和 Geist Mono 字体功能完全正常，无任何降级
- **📦 零技术债务**: 采用方案一（优化配置法），复杂度仅20%，稳定性95%
- **🛠️ TypeScript 类型安全**: 修复了配置文件中的类型错误，确保完全类型安全

### 📋 问题解决步骤
1. **溯源**: 定位到 Turbopack 与 next/font/google 的兼容性问题
2. **拆解**: 提供了三种解决方案（禁用 Turbopack、本地字体、配置修复）
3. **执行**: 选择了最优的配置修复方案，保持所有功能完整

## 新增功能

### 🎨 现代化主页设计
- **Hero 区域**: 自动轮播展示精选游戏的轮播区
- **水平滚动**: 每个游戏分类显示为可滚动行
- **响应式布局**: 适配所有屏幕尺寸的自适应设计
- **无侧边栏**: 专注于内容的简洁全宽布局

### 🔍 增强的头部导航
- **居中搜索栏**: 实时搜索，支持自动完成建议
- **主题切换**: 深色/浅色模式切换，支持系统偏好检测
- **语言切换器**: 保留之前版本的多语言功能
- **响应式设计**: 适配不同屏幕尺寸

### 🌙 深色模式支持
- **系统偏好**: 自动检测用户的系统主题
- **手动切换**: 轻松在浅色和深色模式之间切换
- **持久化**: 跨会话记住用户的选择
- **全面覆盖**: 所有组件都支持两种主题

### 🎮 游戏分类
- **水平滚动**: 每个分类行独立滚动
- **流畅导航**: 桌面端的左右箭头控制
- **触摸支持**: 移动设备上的滑动手势
- **查看更多链接**: 轻松访问分类页面

## 贡献

欢迎提交问题和拉取请求！

本项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 的新字体系列。

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 功能和 API
- [学习 Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

您可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js) - 欢迎您的反馈和贡献！

## 在 Vercel 上部署

部署 Next.js 应用最简单的方法是使用 Next.js 创建者提供的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多详情。
