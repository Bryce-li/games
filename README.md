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

### 🧹 Vercel部署准备 - 项目清理 (2024-12-19)

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

### 🛠️ 主页深色模式滚动条完全修复 (2024-12-19 终极修复)

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

### 🛠️ 主页滚动条和Hero按钮功能完善 (2024-12-19 修复)

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

### 🛠️ React Key 重复错误修复 (2024-12-19 热修复)

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

### 🛠️ 深色模式和轮播问题修复 (2024-12-19 更新)

#### ✅ **问题修复**:

1. **深色模式滚动条修复**:
   - ✅ 修复左侧导航栏滚动条在深色模式下背景仍为浅色的问题
   - ✅ 添加了`.scrollbar-dark`和`.scrollbar-light`样式类
   - ✅ 滚动条现在会根据主题自动调整颜色
   - ✅ 支持WebKit和Firefox的滚动条样式

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

### 🗂️ 左侧侧边栏和分类页面功能 (2024-12-19)
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
