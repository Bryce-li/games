"use client";

import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/lib/i18n-config'
import { Menu } from "lucide-react"
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function Home({
  params,
}: {
  params: { lang: Locale }
}) {
  // 等待 params 参数
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
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
            <span className="font-bold text-xl text-gray-900">{dict.header.title}</span>
          </div>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher currentLang={lang} />
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
              <span>🎮</span>
              {dict.home.welcome}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">🎯</span>
                <span>{dict.home.feature1}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">📱</span>
                <span>{dict.home.feature2}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">💻</span>
                <span>{dict.home.feature3}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">👥</span>
                <span>{dict.home.feature4}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">🆓</span>
                <span>{dict.home.feature5}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Controller Notice */}
        <div className="bg-blue-50 border border-blue-200 p-4 m-6 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="font-semibold text-gray-900">{dict.controllerNotice.title}</p>
              <p className="text-sm text-gray-600">{dict.controllerNotice.description}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Featured Games */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{dict.sections.featured}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Game cards will be added here */}
            </div>
          </section>

          {/* Play with Friends Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{dict.playWithFriends.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-6 text-white">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">👥</span>
                  <div>
                    <h3 className="text-xl font-bold">{dict.playWithFriends.local}</h3>
                    <p className="text-green-100">{dict.playWithFriends.localDesc}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-6 text-white">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🌐</span>
                  <div>
                    <h3 className="text-xl font-bold">{dict.playWithFriends.online}</h3>
                    <p className="text-blue-100">{dict.playWithFriends.onlineDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
} 