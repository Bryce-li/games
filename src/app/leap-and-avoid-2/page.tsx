"use client";
import React from "react";
import Script from "next/script";

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1c1c1e]">
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

      <header className="text-center mb-12">
        <h1 className="text-4xl text-[#007aff] mb-4">Leap and Avoid 2</h1>
        <p className="text-xl text-[#8e8e93]">
          Test your reflexes in this exciting endless runner game where you must jump over obstacles and avoid enemies!
        </p>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">Play Leap and Avoid 2 Online</h2>
          <div className="relative w-full pb-[56.25%] my-8 bg-black rounded-xl overflow-hidden">
            <iframe
              src="https://games.crazygames.com/en_US/leap-and-avoid-2/index.html?v=1.332"
              title="Leap and Avoid 2 Game"
              className="absolute top-0 left-0 w-full h-full border-none"
            ></iframe>
          </div>
        </section>

        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">About the Game</h2>
          <p className="text-lg text-[#8e8e93] mb-4">
          Leap and Avoid 2 is a thrilling platform adventure where you guide a nimble white ball through treacherous caves and high-tech labs. Navigate white platforms, dodge the deadly black ones, and uncover hidden paths brimming with coins. Use your earnings to unlock upgrades like shields and speed boosts as you race for secrets, treasures, and leaderboard glory.
          </p>
        
        </section>

        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-xl text-[#ff3b30] mb-2">Endless Runner</h3>
              <p className="text-[#8e8e93]">Enjoy infinite gameplay with procedurally generated levels that keep getting more challenging.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-xl text-[#ff3b30] mb-2">Simple Controls</h3>
              <p className="text-[#8e8e93]">Easy to learn one-touch controls make it accessible for players of all ages and skill levels.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-xl text-[#ff3b30] mb-2">Increasing Difficulty</h3>
              <p className="text-[#8e8e93]">The game becomes progressively harder as you advance, testing your reflexes with complex obstacle patterns.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-xl text-[#ff3b30] mb-2">Retro Style</h3>
              <p className="text-[#8e8e93]">Features a charming pixel art style that brings back memories of classic arcade games while feeling fresh and modern.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">How to Play</h2>
          <p className="text-lg text-[#8e8e93] mb-4">Playing Leap and Avoid 2 is straightforward but mastering it takes practice:</p>
          <ul className="list-disc pl-6 text-lg text-[#8e8e93] space-y-2">
            <li>Arrow left and right or A and D to move the ball</li>
            <li>R to restart</li>
            <li>P to toggle pause</li>
            <li>Left mouse button to interact with the in-game UI</li>
          </ul>
        </section>
      </main>

      <footer className="mt-16 pt-8 border-t border-[#8e8e93] text-center text-[#8e8e93] text-sm">
        <p>&copy; 2023 MiniPlayGame Online. All rights reserved.</p>
        <p>Visit us at <a href="https://miniplaygame.online" className="text-[#007aff]">miniplaygame.online</a></p>
      </footer>
    </div>
  );
}