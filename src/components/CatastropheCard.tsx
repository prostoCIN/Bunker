"use client";

import React, { useState } from "react";
import { Catastrophe } from "@/data/catastrophes";
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCw 
} from "lucide-react";

interface CatastropheCardProps {
  catastrophe: Catastrophe;
  isHost?: boolean;
  onReroll?: () => void;
}

export function CatastropheCard({
  catastrophe,
  isHost = false,
  onReroll,
}: CatastropheCardProps) {
  const [showFullInfo, setShowFullInfo] = useState(false);

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-xl backdrop-blur-md transition-all">
      {/* Title & Host Reroll */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
            {catastrophe.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {catastrophe.title}
          </h2>
        </div>

        {isHost && onReroll && (
          <button
            onClick={onReroll}
            title="Змінити катастрофу"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 shrink-0 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Змінити</span>
          </button>
        )}
      </div>

      {/* Emoji & Tagline */}
      <div className="my-6 flex flex-col items-center text-center space-y-3">
        <span className="text-5xl sm:text-6xl block select-none">
          {catastrophe.emoji || "☣️"}
        </span>
        <p className="text-sm sm:text-base text-zinc-300 italic leading-relaxed max-w-md">
          «{catastrophe.tagline}»
        </p>
      </div>

      {/* Accordion / Full Info Toggle */}
      <div className="pt-3 border-t border-zinc-800/60">
        <button
          onClick={() => setShowFullInfo(!showFullInfo)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors rounded-xl bg-zinc-950/30 hover:bg-zinc-950/60 border border-zinc-800/50 cursor-pointer"
        >
          <span>{showFullInfo ? "Сховати деталі" : "Деталі катастрофи"}</span>
          {showFullInfo ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showFullInfo && (
          <div className="mt-4 space-y-3.5 text-xs animate-in fade-in duration-200">
            <p className="text-zinc-300 leading-relaxed bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/40 font-normal">
              {catastrophe.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/40">
                <span className="text-zinc-500 block mb-1">Ізоляція:</span>
                <span className="text-zinc-100 font-semibold">{catastrophe.bunkerInfo.duration}</span>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/40">
                <span className="text-zinc-500 block mb-1">Запаси:</span>
                <span className="text-zinc-100 font-semibold">{catastrophe.bunkerInfo.foodSupply}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
