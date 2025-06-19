// 统一游戏数据配置文件 - 合并games-config.ts和games-data.ts

// 基础游戏接口
export interface BaseGame {
  id: string;
  title: string;
  image: string; // 用于列表显示的图片
  category: string;
  tags: string[];
  badge?: string; // NEW, HOT等标识
  isOriginal?: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

// 详细游戏配置接口（用于游戏页面）
export interface GameConfig extends BaseGame {
  description: string;
  embedUrl: string;
  thumbnail: string; // 用于缩略图显示
  instructions: {
    mouse?: string;
    keyboard?: string;
    controls?: string[];
  };
  features: string[];
}

// 英雄区游戏接口
export interface HeroGame extends BaseGame {
  description: string;
}

// 游戏分类映射
export const gameCategories = {
  action: "Action",
  adventure: "Adventure", 
  basketball: "Basketball",
  beauty: "Beauty",
  bike: "Bike",
  car: "Car",
  card: "Card",
  casual: "Casual",
  clicker: "Clicker",
  controller: "Controller",
  dressUp: "Dress Up",
  driving: "Driving",
  escape: "Escape",
  flash: "Flash",
  fps: "FPS",
  horror: "Horror",
  io: ".io",
  mahjong: "Mahjong",
  minecraft: "Minecraft",
  pool: "Pool",
  puzzle: "Puzzle",
  shooting: "Shooting",
  soccer: "Soccer",
  sports: "Sports",
  stickman: "Stickman",
  towerDefense: "Tower Defense"
} as const;

// 完整游戏配置数据（包含游戏页面所需的详细信息）
export const gamesConfig: Record<string, GameConfig> = {
  "count-masters-stickman-games": {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    description: "A fast-paced running game where you gather a growing army of stickmen to clash against rival crowds. Navigate through obstacles, choose the best paths to multiply your numbers, and lead your team to victory.",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    embedUrl: "https://games.crazygames.com/en_US/count-masters-stickman-games/index.html",
    thumbnail: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "action",
    tags: ["running", "stickman", "action", "multiplayer"],
    isHot: true,
    instructions: {
      mouse: "Move the character by moving the mouse left or right. Left-click to select buttons.",
      keyboard: "Use the left and right arrow keys to move. Press space to select actions."
    },
    features: [
      "Fast-paced running gameplay",
      "Strategic army building",
      "Multiple levels and challenges",
      "Simple one-touch controls"
    ]
  },
  "stone-grass-mowing-simulator": {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    description: "A relaxed and enjoyable lawn mowing simulator. Constantly upgrade your lawn mowing machine and create the perfect lawn!",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    embedUrl: "https://games.crazygames.com/en_US/stone-grass-mowing-simulator/index.html",
    thumbnail: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual",
    tags: ["simulation", "casual", "relaxing"],
    isNew: true,
    badge: "NEW",
    instructions: {
      mouse: "Use mouse to control the mowing direction",
      keyboard: "WASD or arrow keys to move"
    },
    features: [
      "Relaxing gameplay",
      "Machine upgrades",
      "Beautiful graphics",
      "Simple controls"
    ]
  },
  "ragdoll-archers": {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    description: "A physics-based archery game with ragdoll characters. Aim and shoot to defeat your opponents in this hilarious battle!",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    embedUrl: "https://games.crazygames.com/en_US/ragdoll-archers/index.html",
    thumbnail: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    category: "action",
    tags: ["archery", "physics", "ragdoll", "shooting"],
    isHot: true,
    instructions: {
      mouse: "Click and drag to aim, release to shoot",
      keyboard: "Use arrow keys for fine aiming"
    },
    features: [
      "Physics-based gameplay",
      "Ragdoll characters",
      "Multiple levels",
      "Challenging opponents"
    ]
  },
  "zombie-horde-build-survive": {
    id: "zombie-horde-build-survive",
    title: "Zombie Horde: Build & Survive",
    description: "Build your base and survive waves of zombies in this intense survival game!",
    image: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    embedUrl: "https://games.crazygames.com/en_US/zombie-horde-build-survive/index.html",
    thumbnail: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    category: "action",
    tags: ["survival", "zombie", "building", "strategy"],
    badge: "NEW",
    instructions: {
      mouse: "Click to build and interact",
      keyboard: "WASD to move, number keys for building shortcuts"
    },
    features: [
      "Base building mechanics",
      "Survival gameplay",
      "Zombie waves",
      "Resource management"
    ]
  },
  "leap-and-avoid-2": {
    id: "leap-and-avoid-2",
    title: "Leap and Avoid 2",
    description: "Jump and avoid obstacles in this challenging platformer sequel!",
    image: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    embedUrl: "https://games.crazygames.com/en_US/leap-and-avoid-2/index.html?v=1.332",
    thumbnail: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    category: "casual",
    tags: ["platformer", "jumping", "obstacles", "arcade"],
    badge: "NEW",
    instructions: {
      keyboard: "Spacebar or Up arrow to jump",
      mouse: "Click to jump"
    },
    features: [
      "Challenging platforming",
      "Progressive difficulty",
      "Simple controls",
      "Retro style graphics"
    ]
  }
};

// 数据转换函数：从GameConfig转换为BaseGame
function configToBaseGame(config: GameConfig): BaseGame {
  return {
    id: config.id,
    title: config.title,
    image: config.image,
    category: config.category,
    tags: config.tags,
    badge: config.badge,
    isOriginal: config.isOriginal,
    isNew: config.isNew,
    isHot: config.isHot
  };
}

// 英雄区游戏数据
export const heroGames: HeroGame[] = [
  {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    description: "A fast-paced running game where you gather a growing army of stickmen to clash against rival crowds. Navigate through obstacles and lead your team to victory!",
    image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "Action",
    isHot: true,
    tags: ["action", "running", "stickman", "multiplayer", "casual"]
  },
  {
    id: "stone-grass-mowing-simulator",
    title: "Stone Grass: Mowing Simulator",
    description: "A relaxed and enjoyable lawn mowing simulator. Constantly upgrade your lawn mowing machine and create the perfect lawn!",
    image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "Casual",
    isNew: true,
    tags: ["casual", "simulator", "relaxing", "upgrade"]
  },
  {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    description: "A physics-based archery game with ragdoll characters. Aim and shoot to defeat your opponents in this hilarious battle!",
    image: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    category: "Action",
    isHot: true,
    tags: ["action", "physics", "archery", "ragdoll", "battle"]
  }
];

// 按分类获取游戏列表
export function getGamesByCategory(category: string): BaseGame[] {
  return Object.values(gamesConfig)
    .filter(game => game.category.toLowerCase() === category.toLowerCase())
    .map(configToBaseGame);
}

// 获取新游戏
export function getNewGames(): BaseGame[] {
  return Object.values(gamesConfig)
    .filter(game => game.isNew || game.badge === "NEW")
    .map(configToBaseGame);
}

// 获取热门游戏
export function getHotGames(): BaseGame[] {
  return Object.values(gamesConfig)
    .filter(game => game.isHot || game.badge === "HOT")
    .map(configToBaseGame);
}

// 获取推荐游戏（排除当前游戏）
export function getRecommendedGames(currentGameId: string, limit: number = 8): GameConfig[] {
  return Object.values(gamesConfig)
    .filter(game => game.id !== currentGameId)
    .slice(0, limit);
}

// 根据分类获取相关游戏
export function getRelatedGames(category: string, currentGameId: string, limit: number = 8): GameConfig[] {
  return Object.values(gamesConfig)
    .filter(game => game.category === category && game.id !== currentGameId)
    .slice(0, limit);
}

// 获取游戏配置
export function getGameConfig(gameId: string): GameConfig | null {
  return gamesConfig[gameId] || null;
}

// 获取所有游戏（转换为BaseGame格式）
export function getAllGames(): BaseGame[] {
  return Object.values(gamesConfig).map(configToBaseGame);
}

// 搜索游戏
export function searchGames(query: string, limit: number = 10): BaseGame[] {
  const searchTerm = query.toLowerCase();
  return Object.values(gamesConfig)
    .filter(game => 
      game.title.toLowerCase().includes(searchTerm) ||
      game.category.toLowerCase().includes(searchTerm) ||
      game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
    .slice(0, limit)
    .map(configToBaseGame);
} 