"use client";
import React from "react";
import Script from "next/script";

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1c1c1e]">
      {/* Google Analytics 跟踪代码 */}
      <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EMGT22HG1L');
          `,
          }}
      />
      <Script
          id="google-analytics-script"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-EMGT22HG1L"
      />

      <header className="text-center mb-12">
        <h1 className="text-4xl text-[#007aff] mb-4">Ragdoll Archers</h1>
        <p className="text-xl text-[#8e8e93]">
          {/*Test your reflexes in this exciting endless runner game where you must jump over obstacles and avoid enemies!*/}
        </p>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">Play Ragdoll Archers Online</h2>
          <div className="relative w-full pb-[56.25%] my-8 bg-black rounded-xl overflow-hidden">
            <iframe
              src="https://www.crazygames.com/embed/ragdoll-archers"
              title="Ragdoll Archers Game"
              className="absolute top-0 left-0 w-full h-full border-none"
            ></iframe>
          </div>
        </section>

        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">About the Game</h2>
          <p className="text-lg text-[#8e8e93] mb-4">
            Ragdoll Archers is an archery game featuring bow and arrow-equipped stickmen with ragdoll physics. Fire arrows at a range of opponents while earning points to upgrade your abilities and ammunition. Play two-player PvP against your friend or team up with them to defeat a range of foes!
          </p>
        
        </section>

        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {/*<div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">*/}
            {/*  <h3 className="text-xl text-[#ff3b30] mb-2">Endless Runner</h3>*/}
            {/*  <p className="text-[#8e8e93]">Enjoy infinite gameplay with procedurally generated levels that keep getting more challenging.</p>*/}
            {/*</div>*/}
            {/*<div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">*/}
            {/*  <h3 className="text-xl text-[#ff3b30] mb-2">Simple Controls</h3>*/}
            {/*  <p className="text-[#8e8e93]">Easy to learn one-touch controls make it accessible for players of all ages and skill levels.</p>*/}
            {/*</div>*/}
            {/*<div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">*/}
            {/*  <h3 className="text-xl text-[#ff3b30] mb-2">Increasing Difficulty</h3>*/}
            {/*  <p className="text-[#8e8e93]">The game becomes progressively harder as you advance, testing your reflexes with complex obstacle patterns.</p>*/}
            {/*</div>*/}
            {/*<div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">*/}
            {/*  <h3 className="text-xl text-[#ff3b30] mb-2">Retro Style</h3>*/}
            {/*  <p className="text-[#8e8e93]">Features a charming pixel art style that brings back memories of classic arcade games while feeling fresh and modern.</p>*/}
            {/*</div>*/}
          </div>
        </section>

        <section>
          <h2 className="text-3xl text-[#50c878] mt-8 mb-4">How to Play</h2>
          <p className="text-lg text-[#8e8e93] mb-4">Playing Ragdoll Archers is straightforward but mastering it takes practice:</p>
          <h4 className="text-lg text-[#8e8e93] mb-4">1 Player Mode</h4>
          <ul className="list-disc pl-6 text-lg text-[#8e8e93] space-y-2">
            <li>Use the left mouse button to control the archer.</li>
            <li>Use the spacebar to jump.</li>
          </ul>
          <h4 className="text-lg text-[#8e8e93] mb-4">PvP Mode</h4>
          <ul className="list-disc pl-6 text-lg text-[#8e8e93] space-y-2">
            <li>Player 1 = uses WASD to control the archer and left-shift to jump.</li>
            <li>Player 2 = uses arrow keys to control the archer and right-shift to jump.</li>
          </ul>
          <h4 className="text-lg text-[#8e8e93] mb-4">2 Player Mode</h4>
          <ul className="list-disc pl-6 text-lg text-[#8e8e93] space-y-2">
            <li>Player 1 = uses WASD to control the archer and left-shift to jump.</li>
            <li>Player 2 = uses arrow keys to control the archer and right-shift to jump.</li>
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