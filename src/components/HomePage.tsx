// 客户端组件，处理主页的交互逻辑
"use client";

import { Menu, Globe, ChevronDown } from "lucide-react"
import { useTranslation } from 'react-i18next'

// Game data from the original site
const featuredGames = [
  { id: "count-masters", title: "Count Masters: Stickman Games", image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover" },
]

const originalGames = [
  { id: "boom-karts", title: "Boom Karts", image: "https://imgs.crazygames.com/boom-karts_2x3/20250522041619/boom-karts_2x3-cover" },
]

const newGames = [
  { id: "squish", title: "Squish", image: "https://imgs.crazygames.com/squish-uwy_16x9/20250605094550/squish-uwy_16x9-cover", badge: "NEW" },
]

const casualGames = [
  { id: "stone-grass-casual", title: "Stone Grass: Mowing Simulator", image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover" },
  { id: "count-masters-casual", title: "Count Masters: Stickman Games", image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover" },
]

// 导航项组件
function NavItem({ icon, label, active = false, badge = false }: {
  icon: string;
  label: string;
  active?: boolean;
  badge?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${
        active
          ? "bg-purple-50 text-purple-600 font-medium"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
          NEW
        </span>
      )}
    </button>
  )
}

// 游戏卡片组件
function GameCard({ title, image, badge, isOriginal = false }: {
  title: string;
  image?: string;
  badge?: string;
  isOriginal?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
        )}
        {badge && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
            {badge}
          </div>
        )}
        {isOriginal && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">
            ORIGINAL
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors">
          {title}
        </h3>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
          <nav className="p-4">
            {/* Primary Navigation */}
            <div className="space-y-1 mb-6">
              <NavItem icon="🏠" label={t('navigation.home')} active />
              <NavItem icon="🕒" label={t('navigation.recentlyPlayed')} />
              <NavItem icon="✨" label={t('navigation.new')} badge />
              <NavItem icon="🔥" label={t('navigation.trending')} badge />
              <NavItem icon="🔄" label={t('navigation.updated')} badge />
              <NavItem icon="⭐" label={t('navigation.originals')} badge />
              <NavItem icon="👥" label={t('navigation.multiplayer')} badge />
              <NavItem icon="👫" label={t('navigation.twoPlayer')} badge />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                <NavItem icon="🎮" label={t('categories.action')} />
                <NavItem icon="🗺️" label={t('categories.adventure')} />
                <NavItem icon="🏀" label={t('categories.basketball')} />
                <NavItem icon="💄" label={t('categories.beauty')} />
                <NavItem icon="🚲" label={t('categories.bike')} />
                <NavItem icon="🚗" label={t('categories.car')} />
                <NavItem icon="🃏" label={t('categories.card')} />
                <NavItem icon="🎲" label={t('categories.casual')} />
                <NavItem icon="🖱️" label={t('categories.clicker')} />
                <NavItem icon="🎮" label={t('categories.controller')} />
                <NavItem icon="👗" label={t('categories.dressUp')} />
                <NavItem icon="🚙" label={t('categories.driving')} />
                <NavItem icon="🚪" label={t('categories.escape')} />
                <NavItem icon="⚡" label={t('categories.flash')} />
                <NavItem icon="🎯" label={t('categories.fps')} />
                <NavItem icon="👻" label={t('categories.horror')} />
                <NavItem icon="🌐" label={t('categories.io')} />
                <NavItem icon="🀄" label={t('categories.mahjong')} />
                <NavItem icon="⛏️" label={t('categories.minecraft')} />
                <NavItem icon="🎱" label={t('categories.pool')} />
                <NavItem icon="🧩" label={t('categories.puzzle')} />
                <NavItem icon="🎯" label={t('categories.shooting')} />
                <NavItem icon="⚽" label={t('categories.soccer')} />
                <NavItem icon="🏃" label={t('categories.sports')} />
                <NavItem icon="🤺" label={t('categories.stickman')} />
                <NavItem icon="🗼" label={t('categories.towerDefense')} />
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Mobile Header */}
          <header className="lg:hidden container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex items-center justify-between">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">CrazyGames</h1>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Globe className="w-6 h-6" />
              </button>
            </div>
          </header>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <section className="mb-12">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 to-purple-800">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 p-8 md:p-12">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {t('home.welcome')}
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-white">
                    <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="block text-2xl mb-2">🎮</span>
                      <span className="text-sm">{t('home.features.feature1')}</span>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="block text-2xl mb-2">📱</span>
                      <span className="text-sm">{t('home.features.feature2')}</span>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="block text-2xl mb-2">🌐</span>
                      <span className="text-sm">{t('home.features.feature3')}</span>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="block text-2xl mb-2">👥</span>
                      <span className="text-sm">{t('home.features.feature4')}</span>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="block text-2xl mb-2">⚡</span>
                      <span className="text-sm">{t('home.features.feature5')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Games */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('home.sections.featured')}</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  {t('home.sections.viewMore')}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {featuredGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            </section>

            {/* Original Games */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('home.sections.originals')}</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  {t('home.sections.viewMore')}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {originalGames.map((game) => (
                  <GameCard key={game.id} {...game} isOriginal />
                ))}
              </div>
            </section>

            {/* New Games */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('home.sections.new')}</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  {t('home.sections.viewMore')}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {newGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            </section>

            {/* Casual Games */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('home.sections.casual')}</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  {t('home.sections.viewMore')}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {casualGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><button className="hover:text-purple-600 text-left">About</button></li>
                    <li><button className="hover:text-purple-600 text-left">Developers</button></li>
                    <li><button className="hover:text-purple-600 text-left">Kids site</button></li>
                    <li><button className="hover:text-purple-600 text-left">Jobs</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><button className="hover:text-purple-600 text-left">Info for parents</button></li>
                    <li><button className="hover:text-purple-600 text-left">Terms & conditions</button></li>
                    <li><button className="hover:text-purple-600 text-left">Privacy</button></li>
                    <li><button className="hover:text-purple-600 text-left">All games</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Popular Games</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><button className="hover:text-purple-600 text-left">Shell Shockers</button></li>
                    <li><button className="hover:text-purple-600 text-left">Agar.io</button></li>
                    <li><button className="hover:text-purple-600 text-left">Uno Online</button></li>
                    <li><button className="hover:text-purple-600 text-left">Geometry Dash</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><button className="hover:text-purple-600 text-left">Twitter</button></li>
                    <li><button className="hover:text-purple-600 text-left">Facebook</button></li>
                    <li><button className="hover:text-purple-600 text-left">Instagram</button></li>
                    <li><button className="hover:text-purple-600 text-left">Discord</button></li>
                  </ul>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 pb-8">
                {t('common.footer.copyright')}
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
} 