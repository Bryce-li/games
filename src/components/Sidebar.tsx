"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  icon: string;
  label: string;
  href?: string;
  active?: boolean;
  badge?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, href, active, badge, onClick }: NavItemProps) {
  const baseClasses = "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer";
  const activeClasses = active 
    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium" 
    : "text-gray-700 dark:text-gray-300";

  const content = (
    <>
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${activeClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={`${baseClasses} ${activeClasses}`}>
      {content}
    </div>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  className?: string;
}

export function Sidebar({ isCollapsed, className = "" }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <aside
      className={`${
        isCollapsed ? "w-0 opacity-0" : "w-64 opacity-100"
      } transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${className}`}
    >
      <nav className="h-full overflow-y-auto p-4 scrollbar-light dark:scrollbar-dark">
        {/* Primary Navigation */}
        <div className="space-y-1 mb-6">
          <NavItem 
            icon="🏠" 
            label={t("navigation.home", "Home")} 
            href="/"
            active={pathname === "/"}
          />
          <NavItem 
            icon="🕒" 
            label={t("navigation.recentlyPlayed", "Recently Played")} 
            href="/recently-played"
            active={pathname === "/recently-played"}
          />
          <NavItem 
            icon="✨" 
            label={t("navigation.new", "New")} 
            href="/games/category/new"
            badge 
            active={pathname === "/games/category/new"}
          />
          <NavItem 
            icon="🔥" 
            label={t("navigation.trending", "Trending Now")} 
            href="/games/category/trending"
            badge 
            active={pathname === "/games/category/trending"}
          />
          <NavItem 
            icon="🔄" 
            label={t("navigation.updated", "Updated")} 
            href="/games/category/updated"
            badge 
            active={pathname === "/games/category/updated"}
          />
          <NavItem 
            icon="👥" 
            label={t("navigation.multiplayer", "Multiplayer")} 
            href="/games/category/multiplayer"
            badge 
            active={pathname === "/games/category/multiplayer"}
          />
          <NavItem 
            icon="👫" 
            label={t("navigation.twoPlayer", "2 Player")} 
            href="/games/category/two-player"
            badge 
            active={pathname === "/games/category/two-player"}
          />
        </div>



        {/* Categories */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t("common.categories", "Categories")}
          </h3>
          
          <NavItem 
            icon="⚔️" 
            label={t("categories.action", "Action")} 
            href="/games/category/action"
            active={pathname === "/games/category/action"}
          />
          <NavItem 
            icon="🗺️" 
            label={t("categories.adventure", "Adventure")} 
            href="/games/category/adventure"
            active={pathname === "/games/category/adventure"}
          />
          <NavItem 
            icon="🏀" 
            label={t("categories.basketball", "Basketball")} 
            href="/games/category/basketball"
            active={pathname === "/games/category/basketball"}
          />
          <NavItem 
            icon="💄" 
            label={t("categories.beauty", "Beauty")} 
            href="/games/category/beauty"
            active={pathname === "/games/category/beauty"}
          />
          <NavItem 
            icon="🚴" 
            label={t("categories.bike", "Bike")} 
            href="/games/category/bike"
            active={pathname === "/games/category/bike"}
          />
          <NavItem 
            icon="🚗" 
            label={t("categories.car", "Car")} 
            href="/games/category/car"
            active={pathname === "/games/category/car"}
          />
          <NavItem 
            icon="🎴" 
            label={t("categories.card", "Card")} 
            href="/games/category/card"
            active={pathname === "/games/category/card"}
          />
          <NavItem 
            icon="🎮" 
            label={t("categories.casual", "Casual")} 
            href="/games/category/casual"
            active={pathname === "/games/category/casual"}
          />
          <NavItem 
            icon="👆" 
            label={t("categories.clicker", "Clicker")} 
            href="/games/category/clicker"
            active={pathname === "/games/category/clicker"}
          />
          <NavItem 
            icon="🎮" 
            label={t("categories.controller", "Controller")} 
            href="/games/category/controller"
            active={pathname === "/games/category/controller"}
          />
          <NavItem 
            icon="👗" 
            label={t("categories.dressUp", "Dress Up")} 
            href="/games/category/dress-up"
            active={pathname === "/games/category/dress-up"}
          />
          <NavItem 
            icon="🚗" 
            label={t("categories.driving", "Driving")} 
            href="/games/category/driving"
            active={pathname === "/games/category/driving"}
          />
          <NavItem 
            icon="🚪" 
            label={t("categories.escape", "Escape")} 
            href="/games/category/escape"
            active={pathname === "/games/category/escape"}
          />
          <NavItem 
            icon="⚡" 
            label={t("categories.flash", "Flash")} 
            href="/games/category/flash"
            active={pathname === "/games/category/flash"}
          />
          <NavItem 
            icon="🎯" 
            label={t("categories.fps", "FPS")} 
            href="/games/category/fps"
            active={pathname === "/games/category/fps"}
          />
          <NavItem 
            icon="👻" 
            label={t("categories.horror", "Horror")} 
            href="/games/category/horror"
            active={pathname === "/games/category/horror"}
          />
          <NavItem 
            icon="🌐" 
            label={t("categories.io", ".io")} 
            href="/games/category/io"
            active={pathname === "/games/category/io"}
          />
          <NavItem 
            icon="🀄" 
            label={t("categories.mahjong", "Mahjong")} 
            href="/games/category/mahjong"
            active={pathname === "/games/category/mahjong"}
          />
          <NavItem 
            icon="⛏️" 
            label={t("categories.minecraft", "Minecraft")} 
            href="/games/category/minecraft"
            active={pathname === "/games/category/minecraft"}
          />
          <NavItem 
            icon="🎱" 
            label={t("categories.pool", "Pool")} 
            href="/games/category/pool"
            active={pathname === "/games/category/pool"}
          />
          <NavItem 
            icon="🧩" 
            label={t("categories.puzzle", "Puzzle")} 
            href="/games/category/puzzle"
            active={pathname === "/games/category/puzzle"}
          />
          <NavItem 
            icon="🔫" 
            label={t("categories.shooting", "Shooting")} 
            href="/games/category/shooting"
            active={pathname === "/games/category/shooting"}
          />
          <NavItem 
            icon="⚽" 
            label={t("categories.soccer", "Soccer")} 
            href="/games/category/soccer"
            active={pathname === "/games/category/soccer"}
          />
          <NavItem 
            icon="🏈" 
            label={t("categories.sports", "Sports")} 
            href="/games/category/sports"
            active={pathname === "/games/category/sports"}
          />
          <NavItem 
            icon="🏃" 
            label={t("categories.stickman", "Stickman")} 
            href="/games/category/stickman"
            active={pathname === "/games/category/stickman"}
          />
          <NavItem 
            icon="🗼" 
            label={t("categories.towerDefense", "Tower Defense")} 
            href="/games/category/tower-defense"
            active={pathname === "/games/category/tower-defense"}
          />
        </div>
      </nav>
    </aside>
  );
} 