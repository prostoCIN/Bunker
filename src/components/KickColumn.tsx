"use client";

import React from "react";
import { UserX, ShieldAlert } from "lucide-react";

interface KickColumnProps {
  onKickClick: () => void;
}

export function KickColumn({ onKickClick }: KickColumnProps) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="w-full flex-1 flex flex-col justify-center items-center text-center gap-4">
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400 shadow-inner">
          <UserX className="w-7 h-7" />
        </div>

        {/* The SINGLE Requested Button: "вигнати з черги до бункера" */}
        <button
          onClick={onKickClick}
          className="w-full py-5 px-4 bg-gradient-to-b from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-red-400/80 shadow-2xl shadow-red-950/60 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <ShieldAlert className="w-6 h-6 animate-pulse" />
          <span className="leading-tight text-center">
            Вигнати з черги<br />до бункера
          </span>
        </button>

        <p className="text-[11px] text-zinc-500 font-mono max-w-[140px] leading-tight">
          Рішення про виключення кандидата зі сховища
        </p>
      </div>
    </div>
  );
}
