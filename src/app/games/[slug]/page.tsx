import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import { GamePageContent } from './GamePageContent';
import { getGameConfig, getRecommendedGames } from '@/lib/games';

interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 生成页面元数据
export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameConfig(slug);

  if (!game) {
    return {
      title: 'Game Not Found - MiniPlayGame',
      description: 'The requested game could not be found.',
    };
  }

  return {
    title: `${game.title} - Play Free Online Game - MiniPlayGame`,
    description: game.description,
    openGraph: {
      title: game.title,
      description: game.description,
      type: 'website',
      images: [game.thumbnail],
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  
  // 获取游戏配置
  const game = await getGameConfig(slug);
  
  if (!game) {
    notFound();
  }

  // 获取推荐游戏（排除当前游戏）
  const recommendedGames = await getRecommendedGames(game.id, 8);

  return (
    <MainLayout>
      <GamePageContent 
        game={game} 
        recommendedGames={recommendedGames}
      />
    </MainLayout>
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
    { slug: 'cat-mini-restaurant' },
    { slug: 'br-br-patapim-obby-challenge' },
  ];
} 