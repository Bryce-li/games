// 统一游戏数据配置文件 - 合并games-config.ts和games-data.ts

// 基础游戏接口
export interface BaseGame {
  id: string;
  title: string;
  image: string; // 用于列表显示的图片
  category: string;
  tags: string[];
  isOriginal?: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

// 详细游戏配置接口（用于游戏页面）
export interface GameConfig extends BaseGame {
  description: string;
  embedUrl: string;
  thumbnail: string; // 用于缩略图显示
  publishDate?: string;    // 发布日期 (ISO 8601格式)
  lastUpdated?: string;    // 最后更新日期 (ISO 8601格式)
  instructions: string;    // 游戏说明/操作指南 (统一为单个字符串字段)
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

// 主页分类显示配置接口
export interface HomepageCategoryConfig {
  key: string;           // 分类key（对应gameCategories的key）
  title: string;         // 显示标题
  showOnHomepage: boolean; // 是否在主页显示
  order: number;         // 显示顺序（数字越小越靠前）
  maxGames?: number;     // 最大显示游戏数量（默认8个）
}

// 主页分类显示配置（可配置哪些分类在主页显示）
export const homepageCategoryConfig: HomepageCategoryConfig[] = [
  {
    key: "casual",
    title: "Casual Games",
    showOnHomepage: true,
    order: 3,
    maxGames: 8
  },
  {
    key: "action", 
    title: "Action Games",
    showOnHomepage: true,
    order: 4,
    maxGames: 8
  },
  {
    key: "adventure",
    title: "Adventure Games", 
    showOnHomepage: true,
    order: 5,
    maxGames: 8
  },
  {
    key: "puzzle",
    title: "Puzzle Games",
    showOnHomepage: false, // 暂时不在主页显示
    order: 6,
    maxGames: 8
  },
  {
    key: "sports",
    title: "Sports Games",
    showOnHomepage: false, // 暂时不在主页显示
    order: 7,
    maxGames: 8
  },
  {
    key: "shooting",
    title: "Shooting Games",
    showOnHomepage: false, // 暂时不在主页显示
    order: 8,
    maxGames: 8
  }
];

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
    publishDate: "2025-01-10",    // 发布日期
    lastUpdated: "2025-01-15",    // 最后更新日期
    instructions: "Use the left and right arrow keys to move your character. You can also move by moving the mouse left or right. Press space or left-click to select actions and navigate through obstacles while gathering your stickman army."
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
    publishDate: "2025-01-18",    // 发布日期（5天前，符合NEW标识）
    lastUpdated: "2025-01-19",    // 最后更新日期
    instructions: "Use your mouse to control the mowing direction, or use WASD or arrow keys to move around. Simply guide your lawn mowing machine across the grass to create the perfect lawn while enjoying this relaxing simulator."
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
    publishDate: "2024-12-01",    // 发布日期（较早，不算新游戏）
    lastUpdated: "2025-01-16",    // 最近更新（符合UPDATED标识）
    instructions: "Click and drag with your mouse to aim your bow, then release to shoot arrows at your ragdoll opponents. Use arrow keys for fine-tuned aiming adjustments. Master the physics-based mechanics to defeat all challengers!"
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
    isNew: true, // 添加isNew属性替代之前的badge="NEW"
    instructions: "Use WASD keys to move your character around the map. Click with your mouse to build structures and interact with objects. Use number keys (1-9) for quick building shortcuts. Gather resources, build defenses, and survive against endless waves of zombies!"
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
    isNew: true, // 添加isNew属性替代之前的badge="NEW"
    instructions: "Press the Spacebar or Up arrow key to make your character jump over obstacles. You can also click with your mouse to jump. Time your jumps carefully to avoid obstacles and achieve the highest score possible in this challenging platformer!"
  },
  "cat-mini-restaurant": {
    id: "cat-mini-restaurant",
    title: "Cat Mini Restaurant",
    description: "In this heartwarming and healing simulation management game \"Meow Flavor Restaurant\", you will become a little cat owner who loves cooking and personally create your own dream restaurant. Starting from a small cat house kitchen, gradually upgrading equipment, developing new recipes, recruiting cute cat employees, until becoming the most popular internet celebrity restaurant in the city! More than 30 cats with different personalities and skills are waiting for you to collect!",
    image: "/images/game-thumbnails/stone-grass-mowing-simulator_16x9-cover.jpg",
    embedUrl: "https://html5.gamedistribution.com/196df99b32324438b39a4dcf18f0f838/?gd_sdk_referrer_url=https://www.miniplaygame.online/games/cat-mini-restaurant",
    thumbnail: "/images/game-thumbnails/stone-grass-mowing-simulator_16x9-cover.jpg",
    category: "casual",
    tags: ["simulation", "restaurant", "management", "cute", "cats"],
    isNew: true,
    publishDate: "2025-01-20",    // 发布日期（3天前，符合NEW标识）
    lastUpdated: "2025-01-21",    // 最后更新日期
    instructions: "Use your mouse to click and interact with various objects, ingredients, and cat employees in your restaurant. Manage your kitchen, take customer orders, cook delicious meals, and expand your restaurant empire with the help of adorable cat staff!"
  },
  "br-br-patapim-obby-challenge": {
    id: "br-br-patapim-obby-challenge",
    title: "Br Br Patapim: Obby Challenge",
    description: "Br Br Patapim: Obby Challenge is a wild meme-fueled obby game where you’ll jump, fall, and laugh your way through chaos! Inspired by the viral spirit of Italian Brainrot Animals of TikTok trends, this game turns parkour madness into pure comedy. Take control of the legendary Brr Brr Patapim and conquer ridiculous levels full of traps, platforms, and meme-powered surprises.",
    image: "/images/game-thumbnails/br-br-patapim-obby-challenge.jpg",
    embedUrl: "https://html5.gamedistribution.com/c2c539077905410bb2114297cf24255b/?gd_sdk_referrer_url=https://www.miniplaygame.online/games",
    thumbnail: "/images/game-thumbnails/br-br-patapim-obby-challenge.jpg",
    category: "adventure",
    tags: ["Agility","animal","obstacle","parkour","platformer","roblox"],
    isNew: true,
    publishDate: "2025-06-01",    // 发布日期（3天前，符合NEW标识）
    lastUpdated: "2025-06-01",    // 最后更新日期
    instructions: "Controls: W, A, S, D – Move Spacebar – Jump Shift - Run Mouse – Look Around"
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
    .filter(game => game.isNew)
    .map(configToBaseGame);
}

// 获取热门游戏
export function getHotGames(): BaseGame[] {
  return Object.values(gamesConfig)
    .filter(game => game.isHot)
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

// 获取主页显示的分类配置（按顺序排序，只返回启用的分类）
export function getHomepageCategories(): HomepageCategoryConfig[] {
  return homepageCategoryConfig
    .filter(config => config.showOnHomepage)
    .sort((a, b) => a.order - b.order);
}

// 获取主页分类游戏数据
export function getHomepageCategoryData(categoryKey: string, maxGames?: number): BaseGame[] {
  const games = getGamesByCategory(categoryKey);
  const limit = maxGames || 8;
  return games.slice(0, limit);
}

// 获取所有主页分类的游戏数据
export function getAllHomepageCategoryData(): Record<string, { config: HomepageCategoryConfig; games: BaseGame[] }> {
  const result: Record<string, { config: HomepageCategoryConfig; games: BaseGame[] }> = {};
  
  getHomepageCategories().forEach(config => {
    const games = getHomepageCategoryData(config.key, config.maxGames);
    if (games.length > 0) { // 只包含有游戏的分类
      result[config.key] = {
        config,
        games
      };
    }
  });
  
  return result;
}

// 便捷工具：更新分类显示状态
export function updateCategoryVisibility(categoryKey: string, showOnHomepage: boolean): void {
  const category = homepageCategoryConfig.find(config => config.key === categoryKey);
  if (category) {
    category.showOnHomepage = showOnHomepage;
    console.log(`📝 分类 "${categoryKey}" 主页显示状态已更新为: ${showOnHomepage ? '显示' : '隐藏'}`);
  } else {
    console.warn(`⚠️ 未找到分类: ${categoryKey}`);
  }
}

// 便捷工具：批量更新分类显示状态
export function updateMultipleCategoriesVisibility(updates: Record<string, boolean>): void {
  Object.entries(updates).forEach(([categoryKey, showOnHomepage]) => {
    updateCategoryVisibility(categoryKey, showOnHomepage);
  });
}

// 便捷工具：获取当前分类显示状态概览
export function getCategoryVisibilityStatus(): Record<string, boolean> {
  const status: Record<string, boolean> = {};
  homepageCategoryConfig.forEach(config => {
    status[config.key] = config.showOnHomepage;
  });
  return status;
} 