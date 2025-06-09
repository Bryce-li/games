import { Menu, Globe, ChevronDown } from "lucide-react"
import { useTranslation } from 'react-i18next'

// Game data from the original site
const featuredGames = [
  // { id: "bloxd-io", title: "Bloxd.io", image: "https://imgs.crazygames.com/games/bloxdhop-io/cover_16x9-1709115453824.png" },
  // { id: "stone-grass", title: "Stone Grass: Mowing Simulator", image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover" },
  // { id: "ragdoll-archers", title: "Ragdoll Archers", image: "https://imgs.crazygames.com/ragdoll-archers_16x9/20240205020743/ragdoll-archers_16x9-cover", badge: "HOT" },
  // { id: "slice-master", title: "Slice Master", image: "https://imgs.crazygames.com/slice-master_16x9/20240731033229/slice-master_16x9-cover" },
  { id: "count-masters", title: "Count Masters: Stickman Games", image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover" },
  // { id: "polytrack", title: "PolyTrack", image: "https://imgs.crazygames.com/games/polytrack/cover_16x9-1746189517703.png" },
  // { id: "mahjongg", title: "Mahjongg Solitaire", image: "https://imgs.crazygames.com/games/mahjongg-solitaire/cover_16x9-1707829450935.png" },
  // { id: "brainrot-clicker", title: "Italian Brainrot Clicker Game", image: "https://imgs.crazygames.com/italian-brainrot-clicker-usp_16x9/20250430033904/italian-brainrot-clicker-usp_16x9-cover" },
  // { id: "planet-smash", title: "Planet Smash Destruction", image: "https://imgs.crazygames.com/solar-smash_16x9/20240722073047/solar-smash_16x9-cover" },
  // { id: "screw-out", title: "Screw Out: Bolts and Nuts", image: "https://imgs.crazygames.com/screw-out-bolts-and-nuts_16x9/20250507101325/screw-out-bolts-and-nuts_16x9-cover", badge: "NEW" },
]

const originalGames = [
  { id: "boom-karts", title: "Boom Karts", image: "https://imgs.crazygames.com/boom-karts_2x3/20250522041619/boom-karts_2x3-cover" },
  // { id: "space-waves", title: "Space Waves", image: "https://imgs.crazygames.com/space-waves_2x3/20241203031650/space-waves_2x3-cover" },
  // { id: "crazy-dummy-swing", title: "Crazy Dummy Swing Multiplayer", image: "https://imgs.crazygames.com/crazy-dummy-swing-multiplayer_2x3/20250506035621/crazy-dummy-swing-multiplayer_2x3-cover" },
  // { id: "sky-riders", title: "Sky Riders", image: "https://imgs.crazygames.com/sky-riders-buk_2x3/20240206045724/sky-riders-buk_2x3-cover" },
  // { id: "crazy-guys", title: "Crazy Guys", image: "https://imgs.crazygames.com/crazy-guys_2x3/20250424094602/crazy-guys_2x3-cover" },
  // { id: "evowars", title: "EvoWars.io", image: "https://imgs.crazygames.com/games/evowarsio/cover_2x3-1736776369475.png" },
  // { id: "holey-io", title: "Holey.io Battle Royale", image: "https://imgs.crazygames.com/games/holey-io-battle-royale/cover_2x3-1698054343535.png" },
  // { id: "cubes-2048", title: "Cubes 2048.io", image: "https://imgs.crazygames.com/games/cubes-2048-io/cover_2x3-1693298929612.png" },
  // { id: "escape-prison", title: "Escape From Prison Multiplayer", image: "https://imgs.crazygames.com/escape-from-prison-multiplayer_2x3/20250120074825/escape-from-prison-multiplayer_2x3-cover" },
  // { id: "mini-golf", title: "Mini Golf Club", image: "https://imgs.crazygames.com/mini-golf-club_2x3/20250106022059/mini-golf-club_2x3-cover" },
]

const newGames = [
  { id: "squish", title: "Squish", image: "https://imgs.crazygames.com/squish-uwy_16x9/20250605094550/squish-uwy_16x9-cover", badge: "NEW" },
  // { id: "loot-island", title: "Loot Island - Treasure Digger", image: "https://imgs.crazygames.com/loot-island---treasure-digger_16x9/20250603144928/loot-island---treasure-digger_16x9-cover", badge: "NEW" },
  // { id: "dragons-merge", title: "Dragons Merge: Battle Games", image: "https://imgs.crazygames.com/dragons-merge-battle-games_16x9/20250603032604/dragons-merge-battle-games_16x9-cover", badge: "NEW" },
  // { id: "little-shop", title: "Little Shop", image: "https://imgs.crazygames.com/little-shop_16x9/20250603102502/little-shop_16x9-cover", badge: "NEW" },
  // { id: "mean-girls", title: "Mean Girls Graduation Day", image: "https://imgs.crazygames.com/mean-girls-graduation-day_16x9/20250604072140/mean-girls-graduation-day_16x9-cover", badge: "NEW" },
]

const casualGames = [
  { id: "stone-grass-casual", title: "Stone Grass: Mowing Simulator", image: "https://imgs.crazygames.com/stone-grass-mowing-simulator_16x9/20250410062107/stone-grass-mowing-simulator_16x9-cover" },
  // { id: "ragdoll-archers-casual", title: "Ragdoll Archers", image: "https://imgs.crazygames.com/ragdoll-archers_16x9/20240205020743/ragdoll-archers_16x9-cover", badge: "HOT" },
  // { id: "slice-master-casual", title: "Slice Master", image: "https://imgs.crazygames.com/slice-master_16x9/20240731033229/slice-master_16x9-cover" },
  { id: "count-masters-casual", title: "Count Masters: Stickman Games", image: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover" },
  // { id: "planet-smash-casual", title: "Planet Smash Destruction", image: "https://imgs.crazygames.com/solar-smash_16x9/20240722073047/solar-smash_16x9-cover" },
]

const drivingGames = [
  { id: "polytrack-driving", title: "PolyTrack", image: "https://imgs.crazygames.com/games/polytrack/cover_16x9-1746189517703.png" },
  // { id: "traffic-rider", title: "Traffic Rider", image: "https://imgs.crazygames.com/traffic-rider-vvq_16x9/20250526021507/traffic-rider-vvq_16x9-cover" },
  // { id: "racing-limits", title: "Racing Limits", image: "https://imgs.crazygames.com/racing-limits_16x9/20250418072542/racing-limits_16x9-cover" },
  // { id: "super-star-car", title: "Super Star Car", image: "https://imgs.crazygames.com/super-star-car_16x9/20250519082532/super-star-car_16x9-cover" },
  // { id: "rally-racer", title: "Rally Racer Dirt", image: "https://imgs.crazygames.com/rally-racer-dirt_16x9/20250227034748/rally-racer-dirt_16x9-cover", badge: "HOT" },
]

export default function Home() {
  const { t } = useTranslation('common');
  return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">CG</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{t('header.title')}</span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <Globe className="w-4 h-4" />
            <span>{t('header.language')}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
            <nav className="p-4">
              {/* Primary Navigation */}
              <div className="space-y-1 mb-6">
                <NavItem icon="🏠" label="Home" active />
                <NavItem icon="🕒" label="Recently played" />
                <NavItem icon="✨" label="New" badge />
                <NavItem icon="🔥" label="Trending now" badge />
                <NavItem icon="🔄" label="Updated" badge />
                <NavItem icon="⭐" label="Originals" badge />
                <NavItem icon="👥" label="Multiplayer" badge />
                <NavItem icon="👫" label="2 Player" badge />
              </div>

              {/* Categories */}
              <div className="space-y-1">
                <CategoryItem icon="⚔️" label="Action" />
                <CategoryItem icon="🗺️" label="Adventure" />
                <CategoryItem icon="🏀" label="Basketball" />
                <CategoryItem icon="💄" label="Beauty" />
                <CategoryItem icon="🚴" label="Bike" />
                <CategoryItem icon="🚗" label="Car" />
                <CategoryItem icon="🎴" label="Card" />
                <CategoryItem icon="🎮" label="Casual" />
                <CategoryItem icon="👆" label="Clicker" />
                <CategoryItem icon="🎮" label="Controller" />
                <CategoryItem icon="👗" label="Dress Up" />
                <CategoryItem icon="🚗" label="Driving" />
                <CategoryItem icon="🚪" label="Escape" />
                <CategoryItem icon="⚡" label="Flash" />
                <CategoryItem icon="🎯" label="FPS" />
                <CategoryItem icon="👻" label="Horror" />
                <CategoryItem icon="🌐" label=".io" />
                <CategoryItem icon="🀄" label="Mahjong" />
                <CategoryItem icon="⛏️" label="Minecraft" />
                <CategoryItem icon="🎱" label="Pool" />
                <CategoryItem icon="🧩" label="Puzzle" />
                <CategoryItem icon="🔫" label="Shooting" />
                <CategoryItem icon="⚽" label="Soccer" />
                <CategoryItem icon="🏈" label="Sports" />
                <CategoryItem icon="🏃" label="Stickman" />
                <CategoryItem icon="🗼" label="Tower Defense" />
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-h-screen">
            {/* Welcome Banner */}
            <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8 px-6">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
                  <span>🎮</span>
                  {t('home.welcome')}
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                  <FeatureItem icon="🎯" text={t('home.feature1')} />
                  <FeatureItem icon="📱" text={t('home.feature2')} />
                  <FeatureItem icon="💻" text={t('home.feature3')} />
                  <FeatureItem icon="👥" text={t('home.feature4')} />
                  <FeatureItem icon="🆓" text={t('home.feature5')} />
                </div>
              </div>
            </section>

            {/* Controller Notice */}
            <div className="bg-blue-50 border border-blue-200 p-4 m-6 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="font-semibold text-gray-900">{t('controllerNotice.title')}</p>
                  <p className="text-sm text-gray-600">{t('controllerNotice.description')}</p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 max-w-7xl mx-auto">
              {/* Featured Games */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">{t('sections.featured')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {featuredGames.map((game) => (
                      <GameCard key={game.id} {...game} />
                  ))}
                </div>
              </section>

              {/* CrazyGames Originals */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('sections.originals')}</h2>
                  <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                    {t('sections.viewMore')}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {originalGames.map((game) => (
                      <GameCard key={game.id} {...game} isOriginal />
                  ))}
                </div>
              </section>

              {/* Play with Friends Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">{t('playWithFriends.title')}</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">👥</span>
                      <div>
                        <h3 className="text-xl font-bold">{t('playWithFriends.local')}</h3>
                        <p className="text-green-100">{t('playWithFriends.localDesc')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">🌐</span>
                      <div>
                        <h3 className="text-xl font-bold">{t('playWithFriends.online')}</h3>
                        <p className="text-blue-100">{t('playWithFriends.onlineDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* New Games */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('sections.new')}</h2>
                  <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                    {t('sections.viewMore')}
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
                  <h2 className="text-2xl font-bold">{t('sections.casual')}</h2>
                  <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                    {t('sections.viewMore')}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {casualGames.map((game) => (
                      <GameCard key={game.id} {...game} />
                  ))}
                </div>
              </section>

              {/* Driving Games */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('sections.driving')}</h2>
                  <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                    {t('sections.viewMore')}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {drivingGames.map((game) => (
                      <GameCard key={game.id} {...game} />
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-8">
              <div className="max-w-7xl mx-auto px-6">
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
                  </div>
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

function CategoryItem({ icon, label }: { icon: string; label: string }) {
  return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700 transition-colors">
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
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