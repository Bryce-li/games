"use client";

import React from 'react';

interface GamePlayerProps {
  embedUrl: string;
  title: string;
  className?: string;
}

export function GamePlayer({ embedUrl, title, className = "" }: GamePlayerProps) {
  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
      {/* 16:9 纵横比容器 */}
      <div className="relative w-full pb-[56.25%]">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute top-0 left-0 w-full h-full border-none"
          allowFullScreen
          allow="gamepad; microphone; camera"
        />
      </div>
    </div>
  );
} 