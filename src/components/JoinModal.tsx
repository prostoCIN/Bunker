"use client";

import React, { useState } from "react";
import { X, ArrowRight, ShieldAlert } from "lucide-react";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  error?: string | null;
}

export function JoinModal({
  isOpen,
  onClose,
  onJoin,
  error,
}: JoinModalProps) {
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 3) {
      onJoin(code.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-zinc-700 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Вхід у Сховище</h3>
            <p className="text-xs text-zinc-400">Введіть секретний код лобі</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="НАПР. 4K8Z2"
              className="w-full text-center font-mono text-2xl font-black tracking-widest uppercase py-3.5 px-4 bg-zinc-950 border-2 border-zinc-700 focus:border-amber-400 rounded-2xl outline-none text-amber-300 placeholder:text-zinc-600 transition-colors"
            />
            {error && (
              <p className="text-xs text-red-400 mt-2 text-center font-medium">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={code.trim().length < 3}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <span>Увійти в лобі</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
