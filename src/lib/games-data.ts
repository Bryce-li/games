// 游戏数据配置文件

export interface Game {
  id: string;
  title: string;
  image: string;
  badge?: string;
  isOriginal?: boolean;
  category: string;
  description?: string;
}

export interface HeroGame extends Game {
  description: string;
  isNew?: boolean;
  isHot?: boolean;
}

// 英雄区游戏数据
export const heroGames: HeroGame[] = [
  {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    description: "A fast-paced running game where you gather a growing army of stickmen to clash against rival crowds. Navigate through obstacles and lead your team to victory!",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "Action",
    isHot: true
  },
  {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    description: "A relaxed and enjoyable lawn mowing simulator. Constantly upgrade your lawn mowing machine and create the perfect lawn!",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "Casual",
    isNew: true
  },
  {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    description: "A physics-based archery game with ragdoll characters. Aim and shoot to defeat your opponents in this hilarious battle!",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    category: "Action",
    isHot: true
  }
];

// 新游戏
export const newGames: Game[] = [
  {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    badge: "NEW",
    category: "casual"
  },
  {
    id: "zombie-horde-build-survive",
    title: "Zombie Horde: Build & Survive",
    image: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    badge: "NEW",
    category: "action"
  },
  {
    id: "leap-and-avoid-2",
    title: "Leap and Avoid 2",
    image: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    badge: "NEW",
    category: "casual"
  },
  {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    badge: "NEW",
    category: "action"
  },
  {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    badge: "NEW",
    category: "action"
  },
  // 添加更多游戏以支持水平滚动
  {
    id: "ninja-warrior",
    title: "Ninja Warrior",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    badge: "NEW",
    category: "action"
  }
];

// 动作游戏
export const actionGames: Game[] = [
  {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "action"
  },
  {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    category: "action"
  },
  {
    id: "zombie-horde-build-survive",
    title: "Zombie Horde: Build & Survive",
    image: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    category: "action"
  },
  {
    id: "ninja-warrior",
    title: "Ninja Warrior",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "action"
  },
  {
    id: "battle-royale",
    title: "Battle Royale",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "action"
  },
  {
    id: "space-shooter",
    title: "Space Shooter",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "action"
  }
];

// 休闲游戏
export const casualGames: Game[] = [
  {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual"
  },
  {
    id: "leap-and-avoid-2",
    title: "Leap and Avoid 2",
    image: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    category: "casual"
  },
  {
    id: "puzzle-master",
    title: "Puzzle Master",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual"
  },
  {
    id: "bubble-shooter",
    title: "Bubble Shooter",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual"
  },
  {
    id: "match-three",
    title: "Match Three",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual"
  },
  {
    id: "word-puzzle",
    title: "Word Puzzle",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual"
  }
];

// 射击游戏
export const shootingGames: Game[] = [
  {
    id: "space-shooter",
    title: "Space Shooter",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "shooting"
  },
  {
    id: "zombie-shooter",
    title: "Zombie Shooter",
    image: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    category: "shooting"
  },
  {
    id: "fps-arena",
    title: "FPS Arena",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "shooting"
  },
  {
    id: "sniper-elite",
    title: "Sniper Elite",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "shooting"
  },
  {
    id: "battle-tanks",
    title: "Battle Tanks",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "shooting"
  }
];

// 原创游戏
export const originalGames: Game[] = [
  {
    id: "boom-karts",
    title: "Boom Karts",
    image: "https://imgs.crazygames.com/boom-karts_2x3/20250522041619/boom-karts_2x3-cover",
    isOriginal: true,
    category: "racing"
  },
  {
    id: "mini-golf-master",
    title: "Mini Golf Master",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    isOriginal: true,
    category: "sports"
  },
  {
    id: "pixel-adventure",
    title: "Pixel Adventure",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    isOriginal: true,
    category: "adventure"
  },
  {
    id: "magic-kingdom",
    title: "Magic Kingdom",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    isOriginal: true,
    category: "adventure"
  }
];

// 获取所有游戏分类
export const gameCategories = [
  { id: 'new', title: 'New Games', games: newGames },
  { id: 'action', title: 'Action Games', games: actionGames },
  { id: 'casual', title: 'Casual Games', games: casualGames },
  { id: 'shooting', title: 'Shooting Games', games: shootingGames },
  { id: 'original', title: 'Original Games', games: originalGames },
]; 