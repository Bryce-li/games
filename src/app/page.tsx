"use client"

import { Menu } from "lucide-react"
import { LanguageSelector } from "../components/LanguageSelector"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import Script from "next/script"

// Game data from the original site
const featuredGames = [
  { 
    id: "leap-and-avoid-2", 
    title: "Leap and Avoid 2", 
    image: "https://imgs.crazygames.com/leap-and-avoid-2_16x9/20250513041850/leap-and-avoid-2_16x9-cover?metadata=none&quality=85&width=273&fit=crop",
    url: "/leap-and-avoid-2"
  },
  // { id: "stone-grass", title: "Stone Grass: Mowing Simulator", image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover" },
  // { id: "ragdoll-archers", title: "Ragdoll Archers", image: "https://imgs.crazygames.com/ragdoll-archers_16x9/20240205020743/ragdoll-archers_16x9-cover", badge: "HOT" },
  // { id: "slice-master", title: "Slice Master", image: "https://imgs.crazygames.com/slice-master_16x9/20240731033229/slice-master_16x9-cover" },
  // { id: "count-masters", title: "Count Masters: Stickman Games", image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover" },
  // { id: "polytrack", title: "PolyTrack", image: "https://imgs.crazygames.com/games/polytrack/cover_16x9-1746189517703.png" },
  // { id: "mahjongg", title: "Mahjongg Solitaire", image: "https://imgs.crazygames.com/games/mahjongg-solitaire/cover_16x9-1707829450935.png" },
  // { id: "brainrot-clicker", title: "Italian Brainrot Clicker Game", image: "https://imgs.crazygames.com/italian-brainrot-clicker-usp_16x9/20250430033904/italian-brainrot-clicker-usp_16x9-cover" },
  // { id: "planet-smash", title: "Planet Smash Destruction", image: "https://imgs.crazygames.com/solar-smash_16x9/20240722073047/solar-smash_16x9-cover" },
  // { id: "screw-out", title: "Screw Out: Bolts and Nuts", image: "https://imgs.crazygames.com/screw-out-bolts-and-nuts_16x9/20250507101325/screw-out-bolts-and-nuts_16x9-cover", badge: "NEW" },
]

const originalGames = [
  { id: "boom-karts", title: "Boom Karts", image: "https://imgs.crazygames.com/boom-karts_2x3/20250522041619/boom-karts_2x3-cover" },
  { id: "space-waves", title: "Space Waves", image: "https://imgs.crazygames.com/space-waves_2x3/20241203031650/space-waves_2x3-cover" },
  { id: "crazy-dummy-swing", title: "Crazy Dummy Swing Multiplayer", image: "https://imgs.crazygames.com/crazy-dummy-swing-multiplayer_2x3/20250506035621/crazy-dummy-swing-multiplayer_2x3-cover" },
  { id: "sky-riders", title: "Sky Riders", image: "https://imgs.crazygames.com/sky-riders-buk_2x3/20240206045724/sky-riders-buk_2x3-cover" },
  { id: "crazy-guys", title: "Crazy Guys", image: "https://imgs.crazygames.com/crazy-guys_2x3/20250424094602/crazy-guys_2x3-cover" },
  { id: "evowars", title: "EvoWars.io", image: "https://imgs.crazygames.com/games/evowarsio/cover_2x3-1736776369475.png" },
  { id: "holey-io", title: "Holey.io Battle Royale", image: "https://imgs.crazygames.com/games/holey-io-battle-royale/cover_2x3-1698054343535.png" },
  { id: "cubes-2048", title: "Cubes 2048.io", image: "https://imgs.crazygames.com/games/cubes-2048-io/cover_2x3-1693298929612.png" },
  { id: "escape-prison", title: "Escape From Prison Multiplayer", image: "https://imgs.crazygames.com/escape-from-prison-multiplayer_2x3/20250120074825/escape-from-prison-multiplayer_2x3-cover" },
  { id: "mini-golf", title: "Mini Golf Club", image: "https://imgs.crazygames.com/mini-golf-club_2x3/20250106022059/mini-golf-club_2x3-cover" },
]

const newGames = [
  { id: "squish", title: "Squish", image: "https://imgs.crazygames.com/squish-uwy_16x9/20250605094550/squish-uwy_16x9-cover", badge: "NEW" },
  { id: "loot-island", title: "Loot Island - Treasure Digger", image: "https://imgs.crazygames.com/loot-island---treasure-digger_16x9/20250603144928/loot-island---treasure-digger_16x9-cover", badge: "NEW" },
  { id: "dragons-merge", title: "Dragons Merge: Battle Games", image: "https://imgs.crazygames.com/dragons-merge-battle-games_16x9/20250603032604/dragons-merge-battle-games_16x9-cover", badge: "NEW" },
  { id: "little-shop", title: "Little Shop", image: "https://imgs.crazygames.com/little-shop_16x9/20250603102502/little-shop_16x9-cover", badge: "NEW" },
  { id: "mean-girls", title: "Mean Girls Graduation Day", image: "https://imgs.crazygames.com/mean-girls-graduation-day_16x9/20250604072140/mean-girls-graduation-day_16x9-cover", badge: "NEW" },
]

const casualGames = [
  { id: "stone-grass-casual", title: "Stone Grass: Mowing Simulator", image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover" },
  { id: "ragdoll-archers-casual", title: "Ragdoll Archers", image: "https://imgs.crazygames.com/ragdoll-archers_16x9/20240205020743/ragdoll-archers_16x9-cover", badge: "HOT" },
  { id: "slice-master-casual", title: "Slice Master", image: "https://imgs.crazygames.com/slice-master_16x9/20240731033229/slice-master_16x9-cover" },
  { id: "count-masters-casual", title: "Count Masters: Stickman Games", image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover" },
  { id: "planet-smash-casual", title: "Planet Smash Destruction", image: "https://imgs.crazygames.com/solar-smash_16x9/20240722073047/solar-smash_16x9-cover" },
]

const drivingGames = [
  { id: "polytrack-driving", title: "PolyTrack", image: "https://imgs.crazygames.com/games/polytrack/cover_16x9-1746189517703.png" },
  { id: "traffic-rider", title: "Traffic Rider", image: "https://imgs.crazygames.com/traffic-rider-vvq_16x9/20250526021507/traffic-rider-vvq_16x9-cover" },
  { id: "racing-limits", title: "Racing Limits", image: "https://imgs.crazygames.com/racing-limits_16x9/20250418072542/racing-limits_16x9-cover" },
  { id: "super-star-car", title: "Super Star Car", image: "https://imgs.crazygames.com/super-star-car_16x9/20250519082532/super-star-car_16x9-cover" },
  { id: "rally-racer", title: "Rally Racer Dirt", image: "https://imgs.crazygames.com/rally-racer-dirt_16x9/20250227034748/rally-racer-dirt_16x9-cover", badge: "HOT" },
]

export default function Home() {
  const { t } = useTranslation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  
  useEffect(() => {
    console.log("初始侧边栏状态:", isSidebarCollapsed ? "收起" : "展开")
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      console.log(`侧边栏状态: ${!prev ? "收起" : "展开"}`);
      return !prev;
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Clarity 访问统计脚本 */}
      <Script
        id="clarity-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "rvs0cxrtby");
          `,
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="切换侧边栏"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button> */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">MP</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MiniPlayGame</span>
          </div>
        </div>

        <LanguageSelector />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${isSidebarCollapsed ? "w-0 opacity-0" : "w-64 opacity-100"} transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4">
            {/* Primary Navigation */}
            <div className="space-y-1 mb-6">
              <NavItem icon="🏠" label={t("nav.home")} active />
              <NavItem icon="🕒" label={t("nav.recentlyPlayed")} />
              <NavItem icon="✨" label={t("nav.new")} badge />
              <NavItem icon="🔥" label={t("nav.trending")} badge />
              <NavItem icon="🔄" label={t("nav.updated")} badge />
              <NavItem icon="👥" label={t("nav.multiplayer")} badge />
              <NavItem icon="👫" label={t("nav.twoPlayer")} badge />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("categories.title")}
              </h3>
              <NavItem icon="⚔️" label={t("categories.action")} />
                <NavItem icon="🗺️" label={t("categories.adventure")} />
                <NavItem icon="🏀" label={t("categories.basketball")} />
                <NavItem icon="💄" label={t("categories.beauty")} />
                <NavItem icon="🚴" label={t("categories.bike")} />
                <NavItem icon="🚗" label={t("categories.car")} />
                <NavItem icon="🎴" label={t("categories.card")} />
                <NavItem icon="🎮" label={t("categories.casual")} />
                <NavItem icon="👆" label={t("categories.clicker")} />
                <NavItem icon="🎮" label={t("categories.controller")} />
                <NavItem icon="👗" label={t("categories.dressUp")} />
                <NavItem icon="🚗" label={t("categories.driving")} />
                <NavItem icon="🚪" label={t("categories.escape")} />
                <NavItem icon="⚡" label={t("categories.flash")} />
                <NavItem icon="🎯" label={t("categories.fps")} />
                <NavItem icon="👻" label={t("categories.horror")} />
                <NavItem icon="🌐" label={t("categories.io")} />
                <NavItem icon="🀄" label={t("categories.mahjong")} />
                <NavItem icon="⛏️" label={t("categories.minecraft")} />
                <NavItem icon="🎱" label={t("categories.pool")} />
                <NavItem icon="🧩" label={t("categories.puzzle")} />
                <NavItem icon="🔫" label={t("categories.shooting")} />
                <NavItem icon="⚽" label={t("categories.soccer")} />
                <NavItem icon="🏈" label={t("categories.sports")} />
                <NavItem icon="🏃" label={t("categories.stickman")} />
                <NavItem icon="🗼" label={t("categories.towerDefense")} />
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className={`flex-1 ${isSidebarCollapsed ? "ml-0" : ""} transition-all duration-300`}>
          {/* Welcome Banner */}
          <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8 px-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
                <span>🎮</span>
                {t("common.welcome")}
              </h1>
              {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                <FeatureItem icon="🎯" text={t("features.games")} />
                <FeatureItem icon="📱" text={t("features.noInstall")} />
                <FeatureItem icon="💻" text={t("features.anyDevice")} />
                <FeatureItem icon="👥" text={t("features.withFriends")} />
                <FeatureItem icon="🆓" text={t("features.allFree")} />
              </div> */}
            </div>
          </section>

          {/* Controller Notice */}
          {/* <div className="bg-blue-50 border border-blue-200 p-4 m-6 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="font-semibold text-gray-900">Controller detected</p>
                <p className="text-sm text-gray-600">Explore our controller compatible games</p>
              </div>
            </div>
          </div> */}

          {/* Content Area */}
          <div className="p-6 max-w-7xl mx-auto">
            {/* Featured Games */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{t("common.featuredGames")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {featuredGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            </section>

            {/* CrazyGames Originals */}
            {/* <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">CrazyGames Originals</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View more →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {originalGames.map((game) => (
                  <GameCard key={game.id} {...game} isOriginal />
                ))}
              </div>
            </section> */}

            {/* Play with Friends Section */}
            {/* <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{t("playWithFriends.title")}</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-6 text-white">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">👥</span>
                    <div>
                      <h3 className="text-xl font-bold">{t("playWithFriends.localMultiplayer.title")}</h3>
                      <p className="text-green-100">{t("playWithFriends.localMultiplayer.description")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-6 text-white">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🌐</span>
                    <div>
                      <h3 className="text-xl font-bold">{t("playWithFriends.onlineMultiplayer.title")}</h3>
                      <p className="text-blue-100">{t("playWithFriends.onlineMultiplayer.description")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section> */}

            {/* New Games */}
            {/* <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{t("common.newGames")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {newGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            </section> */}

            {/* Casual Games */}
            {/* <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t("common.casualGames")}</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View more →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {casualGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            </section> */}

            {/* Driving Games */}
            {/* <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t("common.drivingGames")}</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View more →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {drivingGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            </section> */}
          </div>

          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                {/* <div>
                  <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><button className="hover:text-purple-600 text-left">About</button></li>
                    <li><button className="hover:text-purple-600 text-left">Developers</button></li>
                    <li><button className="hover:text-purple-600 text-left">Kids site</button></li>
                    <li><button className="hover:text-purple-600 text-left">Jobs</button></li>
                  </ul>
                </div> */}
                {/* <div>
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
                </div> */}
                {/* <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Follow us</h3>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-colors">
                      <span className="text-sm">📺</span>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-colors">
                      <span className="text-sm">🎵</span>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-colors">
                      <span className="text-sm">💼</span>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-colors">
                      <span className="text-sm">📺</span>
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
                © 2025 CrazyGames
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active = false, badge = false }: {
  icon: string;
  label: string;
  active?: boolean;
  badge?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
      active ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50 text-gray-700'
    }`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {badge && <div className="w-2 h-2 bg-red-500 rounded-full ml-auto" />}
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  )
}

function GameCard({ title, image, badge, isOriginal = false, url }: {
  title: string;
  image?: string;
  badge?: string;
  isOriginal?: boolean;
  url?: string;
}) {
  const handleClick = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
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
