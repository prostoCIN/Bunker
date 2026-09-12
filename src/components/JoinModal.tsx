"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ArrowRight, ShieldAlert } from "lucide-react";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  error?: string | null;
}

const CODE_LENGTH = 5;

export function JoinModal({
  isOpen,
  onClose,
  onJoin,
  error,
}: JoinModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first cell when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fullCode = digits.join("").trim();

  const handleDigitChange = (index: number, value: string) => {
    // Only allow alphanumeric
    const clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Take the last character entered
    const char = clean.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    // Auto-advance to next input cell
    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Current cell empty -> move back and clear previous cell
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter" && fullCode.length >= 3) {
      e.preventDefault();
      onJoin(fullCode);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);

    // Focus cell after last pasted or last cell
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullCode.length >= 3) {
      onJoin(fullCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
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
            <p className="text-xs text-zinc-400">
              Введіть 5-значний код лобі
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            {/* Separate OTP Cells: 1 character per cell */}
            <div className="flex items-center justify-between gap-2 my-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 sm:w-13 sm:h-16 text-center font-mono text-2xl font-black uppercase rounded-2xl outline-none border-2 transition-all shadow-inner ${
                    digit
                      ? "bg-zinc-950 border-amber-400 text-amber-300 shadow-amber-950/30"
                      : "bg-zinc-950/70 border-zinc-700 text-white focus:border-amber-400 focus:bg-zinc-950"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-400 mt-2.5 text-center font-medium bg-red-950/40 border border-red-900/50 py-1.5 px-2 rounded-xl">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={fullCode.length < 3}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-98 cursor-pointer"
          >
            <span>Увійти в лобі</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
