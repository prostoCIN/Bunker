"use client";

import React, { useState } from "react";
import { Catastrophe } from "@/data/catastrophes";
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  ShieldAlert, 
  Flame, 
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 border-2 border-amber-600/40 shadow-2xl p-5 backdrop-blur-md">
      {/* Top hazard bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

      {/* Header with badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {catastrophe.badge}
        </div>

        {isHost && onReroll && (
          <button
            onClick={onReroll}
            title="Змінити катастрофу"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition-colors px-2 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/60 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Інша подія</span>
          </button>
        )}
      </div>

      {/* Event Title */}
      <div className="mb-2">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-500 shrink-0" />
          {catastrophe.title}
        </h2>
        <p className="text-sm font-medium text-amber-300/90 mt-1 italic leading-relaxed">
          «{catastrophe.tagline}»
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-300 leading-relaxed mb-4 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80">
        {catastrophe.description}
      </p>

      {/* Collapsible / Bunker conditions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Ізоляція
            </span>
            <span className="font-semibold text-zinc-200 line-clamp-2">
              {catastrophe.bunkerInfo.duration}
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 flex items-center gap-1 mb-1">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Провізія
            </span>
            <span className="font-semibold text-zinc-200 line-clamp-2">
              {catastrophe.bunkerInfo.foodSupply}
            </span>
          </div>
        </div>

        {expanded && (
          <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs animate-in fade-in duration-200">
            <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-medium block mb-1">
                🛠 Наявне обладнання:
              </span>
              <span className="text-zinc-200">
                {catastrophe.bunkerInfo.specialEquipment}
              </span>
            </div>

            <div className="bg-red-950/30 p-2.5 rounded-xl border border-red-900/40 text-red-200">
              <span className="text-red-400 font-semibold flex items-center gap-1 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Прихований ризик бункера:
              </span>
              <span>{catastrophe.bunkerInfo.bunkerRisk}</span>
            </div>

            <div>
              <span className="text-zinc-400 font-medium block mb-1.5">
                ☣️ Зовнішні загрози:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {catastrophe.externalThreats.map((threat, idx) => (
                  <span
                    key={idx}
                    className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md text-[11px] border border-zinc-700/50"
                  >
                    • {threat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium cursor-pointer"
        >
          <span>{expanded ? "Приховати деталі бункера" : "Показати деталі бункера та загрози"}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
