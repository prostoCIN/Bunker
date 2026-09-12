"use client";

import React from "react";
import { Catastrophe } from "@/data/catastrophes";
import { 
  Flame, 
  Clock, 
  Package, 
  Wrench, 
  ShieldAlert, 
  AlertOctagon, 
  Radio 
} from "lucide-react";

interface CatastropheColumnProps {
  catastrophe: Catastrophe;
}

export function CatastropheColumn({ catastrophe }: CatastropheColumnProps) {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              Світ за межами бункера
            </h2>
            <p className="text-[11px] text-amber-400 font-mono font-semibold uppercase">
              {catastrophe.badge}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Disaster Hero Card */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl mb-3 shadow-inner">
            {catastrophe.emoji || "☣️"}
          </div>
          <h3 className="text-lg font-black text-white leading-snug">
            {catastrophe.title}
          </h3>
          <p className="text-xs italic text-amber-300/90 mt-1">
            «{catastrophe.tagline}»
          </p>
        </div>

        {/* Full Chronicles / Description */}
        <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-3.5 text-xs text-zinc-300 leading-relaxed">
          <span className="text-zinc-500 font-mono text-[10px] uppercase font-bold block mb-1">
            Хроніка катастрофи:
          </span>
          {catastrophe.description}
        </div>

        {/* Bunker Conditions */}
        <div className="space-y-2">
          <span className="text-zinc-400 font-mono text-[11px] uppercase font-bold block">
            Параметри виживання:
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-400 flex items-center gap-1 mb-1 font-medium text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Ізоляція:
              </span>
              <span className="text-zinc-200 font-bold block">
                {catastrophe.bunkerInfo.duration}
              </span>
            </div>

            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-400 flex items-center gap-1 mb-1 font-medium text-[11px]">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                Провізія:
              </span>
              <span className="text-zinc-200 font-bold block">
                {catastrophe.bunkerInfo.foodSupply}
              </span>
            </div>
          </div>

          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 text-xs">
            <span className="text-zinc-400 flex items-center gap-1 mb-1 font-medium text-[11px]">
              <Wrench className="w-3.5 h-3.5 text-sky-400" />
              Обладнання бункера:
            </span>
            <span className="text-zinc-200 font-medium leading-relaxed block">
              {catastrophe.bunkerInfo.specialEquipment}
            </span>
          </div>

          <div className="bg-red-950/30 p-2.5 rounded-xl border border-red-900/40 text-xs text-red-200">
            <span className="text-red-400 flex items-center gap-1 mb-1 font-bold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Прихований ризик бункера:
            </span>
            <span>{catastrophe.bunkerInfo.bunkerRisk}</span>
          </div>
        </div>

        {/* External Threats */}
        <div className="space-y-1.5 pb-2">
          <span className="text-zinc-400 font-mono text-[11px] uppercase font-bold flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            Зовнішні загрози:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {catastrophe.externalThreats.map((threat, idx) => (
              <span
                key={idx}
                className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg text-[11px] border border-zinc-700/60 font-medium"
              >
                • {threat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
