# 🎮 MiniPlayGame - Next.js 15 Gaming Platform

A modern, responsive gaming platform built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎯 Core Features
- **🎮 Game Gallery**: Curated collection of mini games with detailed pages
- **🔍 Smart Search**: Real-time search with auto-complete suggestions
- **🏷️ Category System**: Organized game categories with filtering
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🌙 Dark Mode**: Complete dark/light theme support with system preference detection
- **🌐 Internationalization**: Multi-language support (English/Chinese)
- **⚡ Performance Optimized**: Next.js 15 with optimized loading and caching

### 🎨 UI/UX Features
- **🎪 Hero Carousel**: Featured games with auto-play carousel
- **📋 Horizontal Scrolling Lists**: Smooth scrolling game categories
- **🎯 Advanced Filtering**: Filter by category, tags, and game status
- **💫 Smooth Animations**: Tailwind CSS powered transitions
- **🔄 Loading States**: Skeleton loading for better UX

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Internationalization**: react-i18next
- **Deployment**: Vercel Ready

## 📁 Project Structure

```
src/
  ├── app/              # Next.js app router 页面
  │   ├── games/        # 游戏页面
  │   │   ├── [slug]/   # 动态游戏路由
  │   │   └── category/ # 分类和标签页面
  │   │       └── [slug]/ # 动态分类路由
  │   ├── layout.tsx    # 根布局
  │   └── page.tsx      # 主页
  ├── components/       # React 组件
  │   ├── ui/           # Shadcn UI 组件
  │   ├── MainLayout.tsx # 主布局组件（含侧边栏）
  │   ├── Sidebar.tsx   # 左侧侧边栏组件
  │   ├── GameCard.tsx  # 通用游戏卡片组件
  │   ├── Header.tsx    # 头部导航栏
  │   ├── SearchBar.tsx # 搜索功能
  │   ├── ThemeToggle.tsx # 深色/浅色模式切换
  │   ├── HeroSection.tsx # Hero 轮播
  │   └── HorizontalGamesList.tsx # 可滚动游戏列表
  ├── lib/             # 工具和配置
  │   ├── i18n/        # 国际化设置
  │   ├── games.ts     # 统一游戏数据配置（合并后）
  │   └── utils.ts     # 工具函数
  └── styles/          # 全局样式
```

## 🔧 最新错误修复和更新

### ⚙️ 主页分类显示配置系统 - 可控制分类在主页的显示 (2025-01-23)

#### ✨ **新功能描述**:
为主页分类游戏添加了可配置的显示控制参数，可以灵活控制哪些游戏分类在主页显示，除了固定的"特色游戏"和"新游戏"两栏。

#### 🔧 **实现方案**:

1. **分类配置接口** - 新增主页分类配置系统:
   ```typescript
   export interface HomepageCategoryConfig {
     key: string;           // 分类key（对应gameCategories的key）
     title: string;         // 显示标题
     showOnHomepage: boolean; // 是否在主页显示 ⭐ 核心控制参数
     order: number;         // 显示顺序（数字越小越靠前）
     maxGames?: number;     // 最大显示游戏数量（默认8个）
   }
   ```

2. **默认配置** - 当前主页显示的分类:
   ```typescript
   export const homepageCategoryConfig: HomepageCategoryConfig[] = [
     { key: "casual", title: "Casual Games", showOnHomepage: true, order: 3 },
     { key: "action", title: "Action Games", showOnHomepage: true, order: 4 },
     { key: "adventure", title: "Adventure Games", showOnHomepage: true, order: 5 },
     { key: "puzzle", title: "Puzzle Games", showOnHomepage: false, order: 6 }, // 暂时隐藏
     { key: "sports", title: "Sports Games", showOnHomepage: false, order: 7 }, // 暂时隐藏
     { key: "shooting", title: "Shooting Games", showOnHomepage: false, order: 8 } // 暂时隐藏
   ];
   ```

3. **动态渲染** - 主页自动根据配置显示分类:
   ```tsx
   // 主页动态渲染启用的分类
   {Object.entries(gameData.homepageCategoryData).map(([categoryKey, categoryData]) => (
     <HorizontalGamesList
       key={categoryKey}
       title={categoryData.config.title}
       games={categoryData.games}
       viewMoreHref={`/games/category/${categoryKey}`}
     />
   ))}
   ```

4. **便捷管理工具** - 提供简单的控制函数:
   ```typescript
   // 单个分类显示控制
   updateCategoryVisibility("puzzle", true)  // 显示Puzzle Games分类
   updateCategoryVisibility("sports", false) // 隐藏Sports Games分类
   
   // 批量控制
   updateMultipleCategoriesVisibility({
     "puzzle": true,
     "sports": true,
     "shooting": false
   })
   
   // 查看当前状态
   getCategoryVisibilityStatus() // 返回所有分类的显示状态
   ```

#### 📋 **主要优势**:
- ✅ **灵活控制**: 通过 `showOnHomepage` 参数轻松控制分类显示
- ✅ **有序排列**: 通过 `order` 参数控制分类在主页的显示顺序
- ✅ **数量控制**: 通过 `maxGames` 参数控制每个分类显示的游戏数量
- ✅ **动态渲染**: 主页自动根据配置动态生成分类列表
- ✅ **保持固定**: "特色游戏"和"新游戏"保持固定显示，不受配置影响
- ✅ **易于管理**: 提供便捷的管理工具函数，无需复杂的后台系统

#### 🎯 **使用方法**:
1. **调整显示**: 修改 `src/lib/games.ts` 中 `homepageCategoryConfig` 的 `showOnHomepage` 值
2. **调整顺序**: 修改 `order` 值来改变分类在主页的显示顺序
3. **调整数量**: 修改 `maxGames` 值来控制每个分类显示的游戏数量

#### 📁 **修改文件**:
- ✅ `src/lib/games.ts` - 添加分类配置系统和管理工具
- ✅ `src/app/page.tsx` - 更新主页使用动态分类渲染

### 🔗 游戏URL路由修复 - "Br Br Patapim: Obby Challenge" 游戏链接错误 (2025-01-23)

#### ❌ **问题描述**:
新添加的游戏 "Br Br Patapim: Obby Challenge" 在主页点击时显示404错误，无法正常访问游戏页面。

#### 🔍 **根本原因分析**:
1. **URL编码问题**: 游戏ID包含冒号 `:` (`br-br-patapim:-obby-challenge`)，在URL中被解释为端口分隔符
2. **分类名称不一致**: 游戏分类设置为 `"Adventure"`（首字母大写），但主页分类筛选使用小写 `"adventure"`
3. **静态路径缺失**: 新游戏未添加到 `generateStaticParams()` 预生成路径中
4. **图片路径错误**: thumbnail字段使用了错误的图片路径

#### 🔧 **完整修复方案**:

1. **修复游戏ID** - 移除URL中的特殊字符:
   ```typescript
   // ❌ 修复前 - 包含冒号的ID
   "br-br-patapim:-obby-challenge"
   
   // ✅ 修复后 - URL安全的ID
   "br-br-patapim-obby-challenge"
   ```

2. **统一分类名称** - 确保分类名称格式一致:
   ```typescript
   // ❌ 修复前
   category: "Adventure"  // 首字母大写
   
   // ✅ 修复后  
   category: "adventure"  // 全小写，与筛选逻辑一致
   ```

3. **添加静态路径** - 预生成游戏页面:
   ```typescript
   // 在 src/app/games/[slug]/page.tsx 中添加
   export async function generateStaticParams() {
     return [
       // 现有游戏...
       { slug: 'cat-mini-restaurant' },
       { slug: 'br-br-patapim-obby-challenge' }, // 新增
     ];
   }
   ```

4. **修复图片路径** - 使用正确的缩略图:
   ```typescript
   // ❌ 修复前 - 使用错误的图片
   thumbnail: "/images/game-thumbnails/stone-grass-mowing-simulator_16x9-cover.jpg"
   
   // ✅ 修复后 - 使用正确的图片  
   thumbnail: "/images/game-thumbnails/br-br-patapim-obby-challenge.jpg"
   ```

5. **主页分类显示** - 添加Adventure游戏分类:
   ```typescript
   // 在 src/app/page.tsx 中添加adventure分类
   const adventureGames = getGamesByCategory("adventure")
   
   // 在JSX中添加Adventure Games列表
   <HorizontalGamesList
     title="Adventure Games"
     games={gameData.adventureGames}
     viewMoreHref="/games/category/adventure"
   />
   ```

#### 📋 **修复的文件列表**:
- ✅ `src/lib/games.ts` - 修复游戏ID、分类名称、图片路径
- ✅ `src/app/games/[slug]/page.tsx` - 添加静态路径生成
- ✅ `src/app/page.tsx` - 添加Adventure分类显示

#### 🎯 **结果**:
- ✅ 游戏链接正常工作，不再出现404错误
- ✅ 游戏正确显示在主页的"Adventure Games"分类中
- ✅ 游戏正确显示在"New Games"分类中（isNew: true）
- ✅ 图片正确加载和显示
- ✅ URL路径标准化，符合Web标准

### 🏷️ Badge参数重构 - 使用布尔值控制显示 (2025-01-23)

#### ✅ **重构目标**:
改用 `isNew`、`isHot`、`isOriginal` 等布尔值参数来控制badge显示，去掉直接的 `badge` 字符串参数判断，让逻辑更清晰和统一。

#### 🔧 **主要修改**:

1. **接口定义更新**:
   ```typescript
   // ✅ 修改前
   export interface BaseGame {
     badge?: string; // 直接使用字符串
     isNew?: boolean;
     isHot?: boolean;
     isOriginal?: boolean;
   }
   
   // ✅ 修改后 - 移除badge字符串，只用布尔值控制
   export interface BaseGame {
     // 移除badge字符串参数
     isNew?: boolean;
     isHot?: boolean;
     isOriginal?: boolean;
   }
   ```

2. **数据配置清理**:
   - ✅ 从 `gamesConfig` 中移除所有 `badge: "NEW"` 等字符串配置
   - ✅ 添加相应的 `isNew: true` 布尔值配置
   - ✅ 保持数据一致性，确保badge显示不中断

3. **组件逻辑重构**:
   ```tsx
   // ✅ 修改前 - 直接使用badge字符串
   {game.badge && (
     <div className="badge">{game.badge}</div>
   )}
   
   // ✅ 修改后 - 根据布尔值动态生成badge，按优先级显示
   {game.isNew && (
     <div className="badge bg-red-500">NEW</div>
   )}
   {game.isHot && !game.isNew && (
     <div className="badge bg-orange-500">HOT</div>
   )}
   {game.isOriginal && !game.isNew && !game.isHot && (
     <div className="badge bg-yellow-400">ORIGINAL</div>
   )}
   ```

4. **更新的组件列表**:
   - ✅ `GameCard.tsx` - 游戏卡片badge显示逻辑
   - ✅ `HorizontalGamesList.tsx` - 水平游戏列表badge显示
   - ✅ `SearchResults.tsx` - 搜索结果badge显示
   - ✅ `SearchBar.tsx` - 搜索建议badge显示
   - ✅ `search-utils.ts` - SearchResult接口更新
   - ✅ `SearchPageContent.tsx` - 搜索页面数据传递

5. **函数逻辑优化**:
   ```typescript
   // ✅ 修改前 - 混合判断
   .filter(game => game.isNew || game.badge === "NEW")
   
   // ✅ 修改后 - 统一布尔值判断
   .filter(game => game.isNew)
   ```

6. **相关文件清理**:
   - ✅ 删除 `src/lib/badge-updater.ts` - badge自动更新系统
   - ✅ 删除 `src/lib/test-badge-updater.ts` - badge测试工具
   - ✅ 删除 `src/app/admin/badge-manager/` - badge管理后台页面

#### 🎯 **Badge显示优先级**:
1. **NEW** (红色) - `isNew: true` 
2. **HOT** (橙色) - `isHot: true` (仅当不是NEW时)
3. **ORIGINAL** (黄色) - `isOriginal: true` (仅当不是NEW和HOT时)

#### 📋 **优势**:
- ✅ **逻辑清晰**: 布尔值比字符串更直观
- ✅ **类型安全**: TypeScript能更好地检查布尔值
- ✅ **维护简单**: 不需要记住具体的badge字符串值
- ✅ **扩展性好**: 可以轻松添加新的布尔值标识
- ✅ **性能优化**: 减少字符串比较，提高渲染效率
- ✅ **一致性**: 所有组件使用相同的判断逻辑

### 🎮 游戏配置文件整合 (2025-06-19)

#### ❌ **问题根源**:
- 项目中存在多个游戏配置文件导致数据不一致
- 新添加的游戏无法在主页显示
- 存在重复的配置文件和混乱的导入关系

#### 🔍 **发现的问题**:
1. **多个配置文件**:
   - ❌ `src/lib/games-config.ts` - 您添加新游戏的文件
   - ❌ `src/lib/games-data.ts` - 老的数据文件
   - ✅ `src/lib/games.ts` - 主页实际使用的统一配置文件

2. **数据不同步**:
   - ❌ 新游戏 "cat-mini-restaurant" 只在 games-config.ts 中
   - ❌ 主页使用 games.ts 中的数据，导致新游戏不显示
   - ❌ 不同组件使用不同的配置文件

#### 🔧 **完整解决方案**:

1. **文件整合**:
   - ✅ **删除冗余文件**: 移除 `games-config.ts` 和 `games-data.ts`
   - ✅ **统一数据源**: 所有游戏数据统一存储在 `games.ts` 中
   - ✅ **添加新游戏**: 将 "Cat Mini Restaurant" 正确添加到统一配置中

2. **数据结构优化**:
   ```typescript
   // 新的统一接口结构
   export interface BaseGame {
     id: string;
     title: string;
     image: string;
     category: string;
     tags: string[];
     badge?: string;
     isOriginal?: boolean;
     isNew?: boolean;
     isHot?: boolean;
   }
   
   export interface GameConfig extends BaseGame {
     description: string;
     embedUrl: string;
     thumbnail: string;
     instructions: { mouse?: string; keyboard?: string; };
     features: string[];
   }
   ```

3. **组件更新**:
   - ✅ **更新导入**: 所有组件统一从 `@/lib/games` 导入
   - ✅ **修复类型错误**: GameCard 组件适配新的 BaseGame 接口
   - ✅ **搜索功能**: 更新 search-utils.ts 使用统一数据源

4. **新游戏信息**:
   ```typescript
   "cat-mini-restaurant": {
     id: "cat-mini-restaurant",
     title: "Cat Mini Restaurant",
     category: "casual",
     tags: ["simulation", "restaurant", "management", "cute", "cats"],
     isNew: true,
     badge: "NEW",
     // 完整的游戏配置...
   }
   ```

#### 📋 **修复结果**:
- ✅ **统一数据源**: 项目现在只有一个游戏配置文件
- ✅ **新游戏显示**: "Cat Mini Restaurant" 现在会在主页的休闲游戏和新游戏分类中显示
- ✅ **0冗余代码**: 删除了重复的配置文件和导入
- ✅ **类型安全**: 所有组件都使用相同的TypeScript接口
- ✅ **搜索功能**: 新游戏可以被搜索和过滤

#### 🎯 **现在的项目结构**:
```
src/lib/
  ├── games.ts          # ✅ 唯一的游戏配置文件
  ├── search-utils.ts   # ✅ 使用统一数据源的搜索功能
  └── i18n/            # 国际化配置
```

### 📊 Google Analytics全局集成 (2025-06-19)

#### ✅ **实现的功能**:
1. **全局GA集成**:
   - ✅ 在根布局 `src/app/layout.tsx` 中添加Google Analytics脚本
   - ✅ 使用正确的GA ID: `G-EMGT22HG1L`
   - ✅ 采用Next.js最佳实践，使用 `next/script` 组件
   - ✅ 设置 `strategy="afterInteractive"` 确保性能优化

2. **代码清理**:
   - ✅ 从首页 `src/app/page.tsx` 移除重复的GA代码
   - ✅ 清理了占位符GA ID `G-XXXXXXXXXX`
   - ✅ 简化首页JSX结构，移除不必要的Fragment

3. **覆盖范围**:
   - ✅ **首页** (`/`) - 自动包含GA
   - ✅ **游戏详情页** (`/games/[slug]`) - 自动包含GA
   - ✅ **分类页面** (`/games/category/[slug]`) - 自动包含GA
   - ✅ **搜索页面** (`/search`) - 自动包含GA
   - ✅ **所有未来页面** - 自动包含GA

#### 🎯 **技术实现**:
```tsx
// src/app/layout.tsx
<Script
    src="https://www.googletagmanager.com/gtag/js?id=G-EMGT22HG1L"
    strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
    {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-EMGT22HG1L');
    `}
</Script>
```

#### 📋 **优势**:
- ✅ **维护简单**: 一处配置，全站生效
- ✅ **性能优化**: 在根布局级别加载，避免重复
- ✅ **符合规范**: 遵循Next.js App Router最佳实践
- ✅ **0重复代码**: 所有页面自动继承GA配置

### 🧹 Vercel部署准备 - 项目清理 (2025-06-19)

#### ✅ **清理完成的无用文件**:
1. **删除空文件**:
   - ❌ `src/components/HomePage.tsx` - 完全空的文件，只有一个空格
   
2. **删除冲突的国际化配置**:
   - ❌ `src/lib/dictionary.ts` - 有linter错误且与react-i18next系统冲突
   - ❌ 缺失的 `src/dictionaries/en.json`, `zh.json` 文件引用

3. **删除错误的部署配置**:
   - ❌ `netlify.toml` - 项目要部署到Vercel，不需要Netlify配置

4. **新增Vercel优化配置**:
   - ✅ 创建 `vercel.json` - 专门的Vercel部署配置
   - ✅ 设置香港地区节点 (hkg1) 加速访问
   - ✅ 配置静态资源缓存策略
   - ✅ 添加安全头部设置

5. **修复Vercel部署错误**:
   - ❌ 初始配置包含无效的函数运行时配置 (`runtime: "nodejs18.x"`)
   - ✅ 简化为最佳实践配置 - Vercel自动处理Next.js函数路由
   - ✅ 移除不必要的构建命令配置 - Vercel自动检测Next.js项目

#### 🎯 **清理后的项目状态**:
- ✅ **0个linter错误**: 删除了导致TypeScript错误的缺失模块引用
- ✅ **单一国际化系统**: 只保留react-i18next，删除冲突的Next.js字典系统
- ✅ **Vercel优化**: 专门为Vercel平台优化的配置和缓存策略
- ✅ **更新文档**: README中移除Netlify相关内容，更新为Vercel部署指南

#### 📋 **清理的技术债务**:
```typescript
// 修复前的错误 (src/lib/dictionary.ts)
❌ import('../dictionaries/en.json') // 找不到模块错误
❌ import('../dictionaries/zh.json') // 找不到模块错误

// 修复后 - 完全删除冲突系统，使用统一的react-i18next
✅ 使用 src/lib/i18n/locales/en.json, zh.json
✅ 通过 useTranslation() hook 统一访问翻译
```

### 🛠️ 主页深色模式滚动条完全修复 (2025-06-18 终极修复)

#### ❌ **问题根源**:
之前的修复方案没有彻底解决问题，主页的滚动条在深色模式下仍然显示浅色。

#### 🔍 **深度分析**:
- ✅ **滚动层级问题**: 主页的滚动发生在 `body` 元素层级，而不是容器层级
- ✅ **样式优先级**: 需要直接为 `body` 元素设置滚动条样式
- ✅ **主题切换**: 深色模式的滚动条样式需要通过 `.dark body` 选择器覆盖

#### 🔧 **最终解决方案**:

1. **全局滚动条样式设置** (`src/app/globals.css`):
   ```css
   /* 默认为浅色模式滚动条 */
   body {
     @apply bg-background text-foreground;
     scrollbar-width: thin;
     scrollbar-color: #d1d5db #f9fafb;
   }
   
   body::-webkit-scrollbar {
     width: 8px;
   }
   
   body::-webkit-scrollbar-track {
     background: #f9fafb;
     border-radius: 4px;
   }
   
   body::-webkit-scrollbar-thumb {
     background: #d1d5db;
     border-radius: 4px;
   }
   
   /* 深色模式下的滚动条样式 */
   .dark body {
     scrollbar-width: thin;
     scrollbar-color: #4b5563 #1f2937;
   }
   
   .dark body::-webkit-scrollbar-track {
     background: #1f2937;
   }
   
   .dark body::-webkit-scrollbar-thumb {
     background: #4b5563;
   }
   
   .dark body::-webkit-scrollbar-thumb:hover {
     background: #6b7280;
   }
   ```

2. **主页布局简化** (`src/app/page.tsx`):
   ```tsx
   // 移除不必要的滚动容器，使用body级别滚动
   <MainLayout onSearch={handleSearch}>
     <div className="container mx-auto px-4 py-8">
       {/* 内容正常显示，滚动由body处理 */}
     </div>
   </MainLayout>
   ```

#### 🎯 **修复效果**:
- ✅ **完全解决**: 主页滚动条在深色模式下正确显示深色主题
- ✅ **全局一致**: 整个应用的滚动条样式保持统一
- ✅ **浏览器兼容**: 支持WebKit（Chrome、Safari）和Firefox的滚动条样式
- ✅ **主题响应**: 切换深色/浅色模式时滚动条立即更新
- ✅ **性能优化**: 移除了不必要的嵌套滚动容器

#### 🔄 **技术要点**:
- **层级选择器**: 使用 `.dark body` 确保深色模式样式正确应用
- **滚动权重**: body级别的滚动优先于容器滚动
- **样式继承**: 滚动条样式从body元素开始，覆盖默认浏览器样式

#### 📋 **修改文件**:
- ✅ `src/app/globals.css` - 添加body级别的滚动条样式
- ✅ `src/app/page.tsx` - 简化页面布局，使用body滚动
- ✅ `README.md` - 更新修复文档

### 🛠️ 主页滚动条和Hero按钮功能完善 (2025-06-14 修复)

#### ✅ **问题修复**:

1. **Hero区域"Learn More"按钮功能完善**:
   - ✅ **问题**: "Learn More" 按钮没有实际功能，只是静态展示
   - ✅ **解决**: 将按钮改为可点击的链接，跳转到对应游戏详情页
   - ✅ **新增**: 添加了信息图标（Info icon）提升用户体验
   ```tsx
   // 修复前
   <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 backdrop-blur-sm">
     Learn More
   </button>
   
   // 修复后
   <Link
     href={`/games/${game.id}`}
     className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 backdrop-blur-sm flex items-center gap-2"
   >
     <Info className="w-5 h-5" />
     Learn More
   </Link>
   ```

#### 🎯 **功能改进**:
- ✅ **一致性**: 确保所有页面和组件的滚动条样式在深色/浅色模式下保持一致
- ✅ **可用性**: "Learn More" 按钮现在具有实际功能，提升用户交互体验
- ✅ **视觉效果**: 添加图标让按钮功能更加直观
- ✅ **响应式**: 保持在不同设备上的良好体验

### 🛠️ React Key 重复错误修复 (2025-06-15 热修复)

#### ❌ **问题描述**:
```
Error: Encountered two children with the same key, `stone-grass-mowing-simulator`. 
Keys should be unique so that components maintain their identity across updates.
```

#### ✅ **根本原因**:
`stone-grass-mowing-simulator` 游戏同时满足多个条件：
- ✅ 是新游戏 (`isNew: true` 和 `badge: "NEW"`)
- ✅ 是休闲游戏 (`category: "casual"`)
- ✅ 被包含在精选游戏列表中

这导致同一游戏在主页的多个 `HorizontalGamesList` 组件中出现，产生了React key冲突。

#### 🔧 **解决方案**:

1. **主页数据去重逻辑** (`src/app/page.tsx`):
   ```typescript
   // 使用useMemo优化数据获取和去重处理
   const gameData = useMemo(() => {
     // 为避免重复key，我们为精选游戏创建一个去重的列表
     // 优先级：动作游戏 > 休闲游戏 > 新游戏
     const usedGameIds = new Set<string>()
     const featuredGames: BaseGame[] = []
     
     // 按优先级添加游戏，确保不重复
     actionGames.slice(0, 2).forEach(game => {
       if (!usedGameIds.has(game.id)) {
         featuredGames.push(game)
         usedGameIds.add(game.id)
       }
     })
     // ... 类似的逻辑处理其他分类
   }, [])
   ```

2. **组件级别唯一Key** (`src/components/HorizontalGamesList.tsx`):
   ```typescript
   // 生成唯一的key前缀，基于title生成标识符
   const keyPrefix = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
   
   // 渲染时使用唯一key
   {games.map((game) => (
     <GameCard key={`${keyPrefix}-${game.id}`} game={game} />
   ))}
   ```

#### 🎯 **修复效果**:
- ✅ **消除了React Key重复警告**
- ✅ **保持了游戏数据的完整性**
- ✅ **优化了性能**：使用 `useMemo` 避免不必要的重新计算
- ✅ **提供了双重保护**：数据层去重 + 组件层唯一Key
- ✅ **保持了用户体验**：所有游戏列表正常显示

### 🛠️ 深色模式和轮播问题修复 (2025-06-18 更新)

#### ✅ **问题修复**:

1. **深色模式滚动条修复**:
   - ✅ 修复左侧导航栏滚动条在深色模式下背景仍为浅色的问题
   - ✅ 添加了`.scrollbar-dark`和`.scrollbar-light`样式类
   - ✅ 滚动条现在会根据主题自动调整颜色
   - ✅ 支持WebKit和Firefox的滚动条样式

### 🤖 **游戏标识自动更新系统 (2025-01-23 新增)**

#### ✅ **第一阶段：基于时间的自动标识更新**

实现了定时更新游戏标识的基础系统，基于发布时间和更新时间自动计算标识：

1. **核心功能**:
   ```typescript
   // 自动标识计算逻辑
   - NEW: 发布日期在7天内的游戏
   - UPDATED: 更新日期在14天内的非新游戏
   - HOT/ORIGINAL: 保留手动设置的标识
   ```

2. **新增文件**:
   - ✅ `src/lib/badge-updater.ts` - 核心标识更新逻辑
   - ✅ `src/lib/test-badge-updater.ts` - 测试脚本
   - ✅ `src/app/admin/badge-manager/` - 管理页面

3. **数据结构扩展**:
   ```typescript
   interface GameConfig {
     publishDate?: string;    // 发布日期
     lastUpdated?: string;    // 最后更新日期
     autoGeneratedBadge?: string; // 自动生成的标识
     manualBadge?: string;    // 手动设置的标识
   }
   ```

4. **配置化管理**:
   ```typescript
   const badgeConfig = {
     newGameDays: 7,          // NEW标识天数
     updatedGameDays: 14,     // UPDATED标识天数
     enableAutoUpdate: true   // 启用自动更新
   };
   ```

#### 🎯 **访问管理页面**:
- 管理界面: `http://localhost:3002/admin/badge-manager`
- 功能: 测试标识更新逻辑、查看统计信息、预览结果

#### 🔄 **自动更新逻辑**:
1. **优先级**: 手动标识 > 自动NEW > 自动UPDATED > 原有标识
2. **时间计算**: 基于当前日期与发布/更新日期的差值
3. **安全保护**: 日期验证、错误处理、统计监控
4. **可扩展性**: 为后续数据库集成和viewCount字段预留接口

#### 📊 **实施效果**:
- ✅ **自动化**: 无需手动维护NEW/UPDATED标识
- ✅ **一致性**: 统一的标识计算逻辑
- ✅ **可配置**: 灵活调整标识规则
- ✅ **可监控**: 完整的更新统计和日志
- ✅ **向后兼容**: 保持现有手动标识不变

### 🎨 **游戏页面界面优化 (2025-01-23 更新)**

#### ✅ **页面结构重构**

完成了游戏详情页面的全面优化，提升用户体验和信息展示效果：

1. **页面布局优化**:
   ```typescript
   // 移除冗余元素
   - ❌ 游戏标题下的描述文本
   - ❌ About the Game 和 Game Features 部分
   - ❌ 复杂的 instructions 对象结构
   
   // 新增核心信息
   + ✅ Released 和 Last Updated 时间显示
   + ✅ 统一的 Game Description 部分
   + ✅ 简化的 How to play 说明
   ```

2. **数据结构简化**:
   ```typescript
   // 原来的复杂结构
   instructions: {
     mouse?: string;
     keyboard?: string;
     controls?: string[];
   };
   features: string[];
   
   // 简化后的结构
   instructions: string;  // 统一的操作说明
   ```

3. **视觉设计改进**:
   - ✅ **分层背景**: 游戏信息区使用灰色背景分层
   - ✅ **时间格式化**: 实现"Jun 19 2025"格式显示
   - ✅ **图标装饰**: 添加Calendar图标增强视觉效果
   - ✅ **响应式布局**: 时间信息自适应移动端和桌面端

4. **内容优先级调整**:
   ```
   1. 游戏标题 (无描述)
   2. 游戏播放器
   3. Released & Last Updated 时间信息
   4. Game Description 游戏描述
   5. How to play {游戏名} 操作说明
   ```

#### 🎯 **访问测试页面**:
- 游戏示例: `http://localhost:3002/games/count-masters-stickman-games`
- 效果展示: 简洁布局、清晰信息层次、优化的用户体验

2. **英雄区轮播功能修复**:
   - ✅ 修复了轮播容器宽度计算错误导致的显示问题
   - ✅ 修正了每个游戏卡片的宽度设置，确保每个都占满整个容器
   - ✅ 优化了轮播动画的流畅性和稳定性
   - ✅ 解决了"第一次滚动把三个游戏全部滚动"的问题

3. **游戏数据统一管理**:
   - ✅ 合并了`games-config.ts`和`games-data.ts`为统一的`games.ts`文件
   - ✅ 创建了统一的数据接口：`BaseGame`、`GameConfig`、`HeroGame`
   - ✅ 提供了按需获取数据的工具函数
   - ✅ 简化了数据管理，避免重复和不一致

#### 🎯 **具体改动**:

**滚动条样式改进**:
```css
/* 深色模式滚动条 */
.scrollbar-dark {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

/* 浅色模式滚动条 */
.scrollbar-light {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}
```

**轮播修复**:
```tsx
// 修复前的问题代码
style={{ width: `${games.length * 100}%` }}

// 修复后的正确代码
style={{ 
  width: '100%',
  minWidth: '100%' // 确保每个卡片占满容器
}}
```

**数据结构统一**:
```typescript
// 新的统一接口
export interface BaseGame {
  id: string;
  title: string;
  image: string;
  category: string;
  tags: string[];
  // ... 其他字段
}

// 获取函数示例
export function getNewGames(): BaseGame[]
export function getGamesByCategory(category: string): BaseGame[]
export function searchGames(query: string, limit?: number): BaseGame[]
```

### 🗂️ 左侧侧边栏和分类页面功能 (2025-06-18)
- **✅ 恢复左侧侧边栏**: 基于之前版本重新实现了完整的左侧导航栏
- **🔄 侧边栏折叠功能**: 点击头部按钮可展开/收起侧边栏，主内容区域自动适配
- **📊 分类导航**: 包含主要导航（首页、最新、热门等）和完整的游戏分类列表
- **🎯 分类页面**: 点击侧边栏分类可进入专门的分类游戏展示页面
- **🏷️ 标签功能**: 游戏页面的标签可点击，进入标签对应的游戏筛选页面
- **🎮 游戏卡片**: 创建了通用的 GameCard 组件，支持悬停效果和标签显示
- **📱 响应式设计**: 侧边栏在不同屏幕尺寸下的自适应表现
- **🔍 智能过滤**: 分类页面支持按分类、标签、新游戏、热门等多种过滤方式

#### 新增组件:
- **MainLayout**: 主布局组件，管理侧边栏状态和页面结构
- **Sidebar**: 左侧侧边栏组件，包含导航菜单和分类列表
- **GameCard**: 通用游戏卡片组件，支持不同尺寸和悬停效果
- **CategoryPageContent**: 分类页面内容组件，支持动态筛选

#### 数据结构优化:
- **扩展 Game 接口**: 添加了 `tags` 字段支持标签功能
- **统一数据管理**: 合并了重复的游戏数据配置文件
- **标准化分类系统**: 使用标准化的分类和标签系统

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd miniplaygame
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

### 🎮 Featured Games

The platform currently includes:
- **Count Masters: Stickman Games** - Fast-paced running game
- **Stone Grass: Mowing Simulator** - Relaxing lawn mowing experience
- **Ragdoll Archers** - Physics-based archery battles
- **Zombie Horde: Build & Survive** - Base building survival game
- **Leap and Avoid 2** - Challenging platformer sequel

## 🌐 Deployment

### Vercel Deployment
The easiest way to deploy is using [Vercel](https://vercel.com/new):

```bash
npm run build
vercel --prod
```

### Manual Deployment
```bash
npm run build
npm start
```

## 📝 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Adding New Games
Add game configurations to `src/lib/games.ts`:

```typescript
{
  id: "game-id",
  title: "Game Title",
  description: "Game description",
  embedUrl: "https://game-url.com",
  thumbnail: "/path/to/thumbnail.jpg",
  category: "action",
  tags: ["tag1", "tag2"],
  // ... other properties
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icon library
- [CrazyGames](https://crazygames.com/) - Game content source

---

Built with ❤️ using Next.js 15 and TypeScript
