"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { GameConfig } from '@/lib/games-config';

interface GameInfoProps {
  game: GameConfig;
}

export function GameInfo({ game }: GameInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* 游戏标签 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Game Tags</h3>
        <div className="flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 游戏信息 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">About the Game</h3>
        <p className="text-gray-600 leading-relaxed">{game.description}</p>
        
        {/* 游戏特色 */}
        {game.features.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Game Features</h4>
            <ul className="space-y-2">
              {game.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 游戏介绍 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Game Description</h3>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed">
            {game.description}
          </p>
        </div>
      </div>

      {/* 操作方式介绍 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Play</h3>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          {game.instructions.mouse && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🖱️ Mouse Controls</h4>
              <p className="text-gray-600">{game.instructions.mouse}</p>
            </div>
          )}
          
          {game.instructions.keyboard && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">⌨️ Keyboard Controls</h4>
              <p className="text-gray-600">{game.instructions.keyboard}</p>
            </div>
          )}

          {game.instructions.controls && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎮 Game Controls</h4>
              <ul className="space-y-1">
                {game.instructions.controls.map((control, index) => (
                  <li key={index} className="text-gray-600">• {control}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 