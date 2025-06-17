import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGameConfig, getRecommendedGames } from '@/lib/games-config';
import { GamePageContent } from './GamePageContent';

interface GamePageProps {
  params: {
    slug: string;
  };
}

// 生成页面元数据
export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const gameConfig = getGameConfig(params.slug);

  if (!gameConfig) {
    return {
      title: 'Game Not Found',
      description: 'The requested game could not be found.',
    };
  }

  return {
    title: `${gameConfig.title} - MiniPlayGame`,
    description: gameConfig.description,
    openGraph: {
      title: gameConfig.title,
      description: gameConfig.description,
      images: [gameConfig.thumbnail],
    },
  };
}

export default function GamePage({ params }: GamePageProps) {
  const gameConfig = getGameConfig(params.slug);

  if (!gameConfig) {
    notFound();
  }

  const recommendedGames = getRecommendedGames(gameConfig.id);

  return (
    <GamePageContent 
      game={gameConfig} 
      recommendedGames={recommendedGames} 
    />
  );
}

// 生成静态路径（可选，用于预渲染已知游戏页面）
export async function generateStaticParams() {
  // 可以返回已知的游戏ID列表
  return [
    { slug: 'count-masters-stickman-games' },
    { slug: 'stone-grass-mowing-simulator' },
    { slug: 'ragdoll-archers' },
    { slug: 'zombie-horde-build-survive' },
    { slug: 'leap-and-avoid-2' },
  ];
} 