"use client";

import type { HeroGame as Game } from "@/lib/games";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// 帮助 TypeScript 理解 Swiper.js 的自定义 Web Components 元素
// 这使得我们可以在 JSX 中安全地使用 <swiper-container> 和 <swiper-slide>
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref: React.RefObject<HTMLElement>;
        init: string;
      };
      'swiper-slide': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}


/**
 * 英雄区域的游戏卡片组件
 * @param game - 游戏数据
 */
function HeroGameCard({ game }: { game: Game }) {
    return (
      <Link href={`/games/${game.id}`} className="block w-full h-full group">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
           <Image
              src={game.image || "/placeholder.png"}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              sizes="(min-width: 1280px) 16.66vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-3">
            <h3 className="font-bold text-white drop-shadow-lg">
              {game.title}
            </h3>
          </div>
        </div>
      </Link>
    );
}

interface HeroSectionProps {
    games: Game[];
}

/**
 * 网站主页的英雄区域，使用 Swiper.js 实现响应式轮播效果
 * @param games - 要在英雄区域展示的游戏列表
 */
export function HeroSection({ games }: HeroSectionProps) {
  const swiperElRef = useRef<HTMLElement>(null);
  const navigationPrevRef = useRef<HTMLButtonElement>(null);
  const navigationNextRef = useRef<HTMLButtonElement>(null);

  // 状态用于跟踪 Swiper.js 脚本是否已成功加载
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Effect Hook: 动态加载 Swiper.js 库
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-element-bundle.min.js';
    script.async = true;
    // 脚本加载完成后，更新状态以触发组件重新渲染
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    // 组件卸载时清理脚本
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []); // 空依赖数组确保此 effect 只在组件挂载时运行一次

  // Effect Hook: 初始化 Swiper 实例
  useEffect(() => {
    // 仅在脚本加载完毕且 swiper-container 元素可用时执行
    if (!isScriptLoaded || !swiperElRef.current) return;

    const swiperEl = swiperElRef.current as any;

    // Swiper.js 的参数配置对象
    const swiperParams = {
      loop: true,
      spaceBetween: 16, // Slide 之间的间距
      slidesPerGroup: 1, // 每次滚动1个
      // 自动播放配置
      autoplay: {
        delay: 3000,
        disableOnInteraction: false, // 用户交互后不禁用自动播放
      },
      // 导航按钮配置
      navigation: {
        prevEl: navigationPrevRef.current,
        nextEl: navigationNextRef.current,
      },
      // 响应式断点：根据屏幕宽度调整每屏显示的 Slide 数量
      breakpoints: {
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
        1280: { slidesPerView: 6 },
      },
       // 默认（移动端）显示2个
      slidesPerView: 2,
    };

    // 将参数应用到 Swiper 元素上
    Object.assign(swiperEl, swiperParams);

    // 初始化 Swiper
    swiperEl.initialize();
  }, [isScriptLoaded, games]); // 当脚本加载状态或游戏数据变化时，重新运行此 effect

  if (!games || games.length === 0) return null;

  return (
    // group 类用于控制子元素在父元素 hover 时的样式 (例如，显示导航按钮)
    <section className="mb-3 overflow-hidden group relative">
      {isScriptLoaded ? (
        <>
          <swiper-container ref={swiperElRef} init="false">
            {games.map((game) => (
              <swiper-slide key={game.id}>
                <HeroGameCard game={game} />
              </swiper-slide>
            ))}
          </swiper-container>

          {/* 自定义导航按钮 */}
          <button
            ref={navigationPrevRef}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 hover:bg-white/20 active:scale-95"
            aria-label="上一个游戏"
          >
            &#x2190;
          </button>
          <button
            ref={navigationNextRef}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 hover:bg-white/20 active:scale-95"
            aria-label="下一个游戏"
          >
            &#x2192;
          </button>
        </>
      ) : (
        // 在 Swiper.js 加载期间显示占位符，以防止布局抖动
        <div className="h-[25vh] w-full flex items-center justify-center bg-gray-900/50 rounded-lg">
          <p className="text-gray-400 animate-pulse">正在加载精彩游戏...</p>
        </div>
      )}
    </section>
  );
} 