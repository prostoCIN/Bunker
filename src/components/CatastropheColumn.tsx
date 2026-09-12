"use client";

import React from "react";
import { Catastrophe } from "@/data/catastrophes";

interface CatastropheColumnProps {
  catastrophe: Catastrophe;
}

export function CatastropheColumn({ catastrophe }: CatastropheColumnProps) {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 shrink-0">
        <h2 className="text-base font-bold text-white tracking-wide">
          Катастрофа
        </h2>
        <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-0.5 rounded-full shrink-0">
          {catastrophe.badge}
        </span>
      </div>

      {/* Spacious Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 custom-scrollbar min-h-0">
        {/* Disaster Hero */}
        <div className="text-left space-y-2">
          <div className="text-3xl xl:text-4xl">
            {catastrophe.emoji || "☣️"}
          </div>
          <h3 className="text-xl xl:text-2xl font-black text-white leading-tight">
            {catastrophe.title}
          </h3>
          <p className="text-sm text-zinc-400 italic leading-relaxed">
            «{catastrophe.tagline}»
          </p>
        </div>

        {/* Narrative Description */}
        <div className="text-sm text-zinc-300 leading-relaxed font-normal">
          {catastrophe.description}
        </div>

        {/* Bunker Survival Parameters */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/60">
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
            Умови в бункері
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/50 space-y-1">
              <span className="text-zinc-500 font-medium block">Ізоляція</span>
              <span className="text-zinc-100 font-semibold text-sm block">
                {catastrophe.bunkerInfo.duration}
              </span>
            </div>

            <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/50 space-y-1">
              <span className="text-zinc-500 font-medium block">Запаси їжі</span>
              <span className="text-zinc-100 font-semibold text-sm block">
                {catastrophe.bunkerInfo.foodSupply}
              </span>
            </div>
          </div>

          <div className="bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/50 space-y-1 text-xs">
            <span className="text-zinc-500 font-medium block">Обладнання</span>
            <span className="text-zinc-200 text-sm leading-relaxed block font-medium">
              {catastrophe.bunkerInfo.specialEquipment}
            </span>
          </div>

          <div className="bg-red-950/20 p-3.5 rounded-2xl border border-red-900/30 space-y-1 text-xs">
            <span className="text-red-400/80 font-medium block">Прихований ризик</span>
            <span className="text-zinc-200 text-sm leading-relaxed block font-medium">
              {catastrophe.bunkerInfo.bunkerRisk}
            </span>
          </div>
        </div>

        {/* Threats */}
        {catastrophe.externalThreats.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-zinc-800/60">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Зовнішні загрози
            </h4>
            <div className="flex flex-wrap gap-2">
              {catastrophe.externalThreats.map((threat, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-900/80 text-zinc-300 px-3 py-1.5 rounded-xl text-xs border border-zinc-800/70 font-medium"
                >
                  {threat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
