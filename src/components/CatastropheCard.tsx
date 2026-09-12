"use client";

import React, { useState } from "react";
import { Catastrophe } from "@/data/catastrophes";
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Clock, 
  Package, 
  ShieldAlert, 
  Wrench, 
  AlertOctagon 
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
    <div className="w-full bg-zinc-900/95 border-2 border-zinc-700/80 rounded-3xl p-5 shadow-2xl backdrop-blur-md transition-all">
      {/* 1. Зверху: Назва катастрофи (+ кнопка зміни для хоста) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
          {catastrophe.title}
        </h2>

        {isHost && onReroll && (
          <button
            onClick={onReroll}
            title="Змінити катастрофу"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300 transition-colors px-2.5 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700 hover:border-amber-500/50 shrink-0 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Змінити</span>
          </button>
        )}
      </div>

      {/* 2. Далі: Емодзі катастрофи */}
      <div className="my-4 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-center text-5xl shadow-inner select-none transition-transform hover:scale-105">
          {catastrophe.emoji || "☣️"}
        </div>
      </div>

      {/* 3. Знизу: Дуже короткий опис */}
      <p className="text-center text-sm font-medium text-zinc-300 leading-relaxed px-2">
        {catastrophe.tagline}
      </p>

      {/* Кнопка "Повна інформація" */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80">
        <button
          onClick={() => setShowFullInfo(!showFullInfo)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors rounded-xl bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-800 cursor-pointer active:scale-98"
        >
          <span>{showFullInfo ? "Приховати повну інформацію" : "Повна інформація"}</span>
          {showFullInfo ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* 4. Прихована повна інформація */}
        {showFullInfo && (
          <div className="mt-3 space-y-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Детальний опис */}
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 text-zinc-300 leading-relaxed">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-bold mb-1">
                Хроніка подій:
              </span>
              {catastrophe.description}
            </div>

            {/* Умови бункера */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400 flex items-center gap-1 mb-1 font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Термін ізоляції:
                </span>
                <span className="text-zinc-200 font-semibold">
                  {catastrophe.bunkerInfo.duration}
                </span>
              </div>

              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400 flex items-center gap-1 mb-1 font-medium text-[11px]">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  Провізія:
                </span>
                <span className="text-zinc-200 font-semibold">
                  {catastrophe.bunkerInfo.foodSupply}
                </span>
              </div>
            </div>

            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-400 flex items-center gap-1 mb-1 font-medium text-[11px]">
                <Wrench className="w-3.5 h-3.5 text-sky-400" />
                Обладнання сховища:
              </span>
              <span className="text-zinc-200">
                {catastrophe.bunkerInfo.specialEquipment}
              </span>
            </div>

            <div className="bg-red-950/30 p-2.5 rounded-xl border border-red-900/40 text-red-200">
              <span className="text-red-400 flex items-center gap-1 mb-1 font-semibold text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Прихований ризик бункера:
              </span>
              <span>{catastrophe.bunkerInfo.bunkerRisk}</span>
            </div>

            {/* Зовнішні загрози */}
            <div>
              <span className="text-zinc-400 flex items-center gap-1 mb-1.5 font-medium text-[11px]">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                Зовнішні загрози:
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
      </div>
    </div>
  );
}
