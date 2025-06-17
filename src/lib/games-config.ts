// 游戏配置数据结构
export interface GameConfig {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  thumbnail: string;
  category: string;
  tags: string[];
  instructions: {
    mouse?: string;
    keyboard?: string;
    controls?: string[];
  };
  features: string[];
  isNew?: boolean;
  isOriginal?: boolean;
}

// 游戏数据配置
export const gamesConfig: Record<string, GameConfig> = {
  "count-masters-stickman-games": {
    id: "count-masters-stickman-games",
    title: "Count Masters: Stickman Games",
    description: "A fast-paced running game where you gather a growing army of stickmen to clash against rival crowds. Navigate through obstacles, choose the best paths to multiply your numbers, and lead your team to victory.",
    embedUrl: "https://games.crazygames.com/en_US/count-masters-stickman-games/index.html",
    thumbnail: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover",
    category: "action",
    tags: ["running", "stickman", "action", "multiplayer"],
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
    description: "A relaxed and enjoyable lawn mowing simulator. Constantly upgrade your lawn mowing machine in the game!",
    embedUrl: "https://games.crazygames.com/en_US/stone-grass-mowing-simulator/index.html",
    thumbnail: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover",
    category: "casual",
    tags: ["simulation", "casual", "relaxing"],
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
    description: "A physics-based archery game with ragdoll characters. Aim and shoot to defeat your opponents!",
    embedUrl: "https://games.crazygames.com/en_US/ragdoll-archers/index.html",
    thumbnail: "/images/game-thumbnails/ragdoll-archers_16x9-cover.jpg",
    category: "action",
    tags: ["archery", "physics", "ragdoll", "shooting"],
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
    embedUrl: "https://games.crazygames.com/en_US/zombie-horde-build-survive/index.html",
    thumbnail: "/images/game-thumbnails/zombie-horde-build-survive_16x9-cover.jpg",
    category: "action",
    tags: ["survival", "zombie", "building", "strategy"],
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
    embedUrl: "https://games.crazygames.com/en_US/leap-and-avoid-2/index.html?v=1.332",
    thumbnail: "/images/game-thumbnails/leap-and-avoid-2_16x9-cover.jpg",
    category: "casual",
    tags: ["platformer", "jumping", "obstacles", "arcade"],
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