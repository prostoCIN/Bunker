"use client";

import React, { useState, useEffect } from "react";
import { GameRoom, Player, RpsChoice } from "@/types/game";
import { PlayerCharacterCard } from "@/data/characterData";
import { CatastropheColumn } from "./CatastropheColumn";
import { PlayersTable } from "./PlayersTable";
import { KickColumn } from "./KickColumn";
import { KickModal } from "./KickModal";
import { RpsDuelModal } from "./RpsDuelModal";
import { CardViewScreen } from "./CardViewScreen";
import { 
  Users, 
  Layers, 
  ChevronRight, 
  Flame, 
  UserX,
  Skull,
  Zap,
  X,
  LogOut,
  Copy,
  Check
} from "lucide-react";

interface InGameViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onRevealCardToAll: (cardId: string) => void;
  onLeaveRoom: () => void;
  onCastVote: (targetPlayerId: string) => void;
  onDismissExpelled: () => void;
  onMakeRpsChoice: (choice: RpsChoice) => void;
  onApplySpecialAction?: (
    cardId: string,
    targetPlayerId?: string
  ) => Promise<{ peekedCard?: PlayerCharacterCard } | void>;
  onDismissActionMessage?: () => void;
  onEndTurn?: () => void;
  onSkipTurn?: () => void;
}

type TabType = "catastrophe" | "table" | "hand" | "kick";

export function InGameView({
  room,
  currentPlayer,
  onRevealCardToAll,
  onLeaveRoom,
  onCastVote,
  onDismissExpelled,
  onMakeRpsChoice,
  onApplySpecialAction,
  onDismissActionMessage,
  onEndTurn,
  onSkipTurn,
}: InGameViewProps) {
  // Mobile active tab: "catastrophe" | "table" | "hand" | "kick"
  const [activeTab, setActiveTab] = useState<TabType>("hand");
  const [selectedCard, setSelectedCard] = useState<PlayerCharacterCard | null>(null);
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  const currentTurnPlayer = room.players.find(
    (p) => p.id === room.currentTurnPlayerId
  );
  const isMyTurn = currentPlayer.id === room.currentTurnPlayerId;
  const isVotingPhase = room.turnPhase === "voting";

  // Auto-switch mobile tab when entering or leaving voting phase
  useEffect(() => {
    if (isVotingPhase) {
      setActiveTab("kick");
    } else if (activeTab === "kick") {
      setActiveTab("table");
    }
  }, [isVotingPhase]);

  const cards = currentPlayer.cards || [];
  const revealedCount = cards.filter((c) => c.isRevealedToAll).length;

  // Hand parameter plates component
  const renderHandContent = () => {
    if (selectedCard) {
      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
          <CardViewScreen
            card={selectedCard}
            room={room}
            currentPlayer={currentPlayer}
            onBack={() => setSelectedCard(null)}
            onRevealToAll={(cardId) => {
              onRevealCardToAll(cardId);
              setSelectedCard((prev) =>
                prev && prev.id === cardId
                  ? { ...prev, isRevealedToAll: true }
                  : prev
              );
            }}
            onApplySpecialAction={async (cardId, targetPlayerId) => {
              if (onApplySpecialAction) {
                const res = await onApplySpecialAction(cardId, targetPlayerId);
                setSelectedCard((prev) =>
                  prev && prev.id === cardId
                    ? { ...prev, isRevealedToAll: true, isUsed: true }
                    : prev
                );
                return res;
              }
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col h-full bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
        {/* Hand Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
              #{currentPlayer.playerNumber ?? 1}
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              {currentPlayer.name}
            </h2>
            {isMyTurn && !isVotingPhase && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md animate-pulse">
                🎯 Ваш хід
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono tracking-wider text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full">
            {revealedCount} / {cards.length} відкрито
          </span>
        </div>

        {/* List of Parameter Plates with clean flex grid */}
        <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2.5">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`w-full p-4 rounded-2xl border transition-all active:scale-98 cursor-pointer flex items-center justify-between text-left ${
                  card.isRevealedToAll
                    ? "bg-zinc-950/60 border-emerald-500/30 hover:border-emerald-500/50"
                    : "bg-zinc-950/40 border-zinc-800/50 hover:border-zinc-700/60"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <span className="text-xl xl:text-2xl shrink-0 opacity-80">
                    {card.icon}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 truncate">
                        {card.categoryName}
                      </span>
                      {card.isRevealedToAll && (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          відкрито
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5">
                      {card.isRevealedToAll ? (
                        <p className="text-sm font-semibold text-white truncate">
                          {card.value}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500 truncate font-normal">
                          Приховано
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* ================= GLOBAL TOP BAR ================= */}
      <header className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-950/70 border border-zinc-800/70 rounded-2xl mb-2.5 sm:mb-3 shrink-0 backdrop-blur-md shadow-lg">
        {/* Left: Brand + Room Code + Round/Phase */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="font-black text-sm sm:text-base tracking-wider text-white uppercase">
            БУНКЕР
          </span>

          <div className="h-3.5 w-px bg-zinc-800" />

          {/* Room Code Badge with Copy */}
          <button
            onClick={handleCopyRoomCode}
            title="Натисніть, щоб скопіювати код кімнати"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <span>{room.code}</span>
            {copiedCode ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-500" />
            )}
          </button>

          {/* Round & Phase Badge */}
          <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-2 py-0.5 rounded-md">
            Раунд #{room.roundNumber || 1}
          </span>
          <span
            className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border truncate ${
              isVotingPhase
                ? "text-purple-300 bg-purple-950/50 border-purple-500/40"
                : "text-amber-300 bg-amber-950/50 border-amber-500/40"
            }`}
          >
            {isVotingPhase ? "Голосування" : "Виступи"}
          </span>
        </div>

        {/* Right: Player info + Leave Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-xl">
            <span className="font-mono font-bold text-zinc-400">
              #{currentPlayer.playerNumber ?? 1}
            </span>
            <span className="font-semibold text-white truncate max-w-[120px]">
              {currentPlayer.name}
            </span>
            {currentPlayer.isHost && (
              <span className="text-[9px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1 py-0.2 rounded">
                Хост
              </span>
            )}
          </div>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            title="Покинути гру"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-zinc-400 hover:text-red-300 bg-zinc-900/90 hover:bg-red-950/30 border border-zinc-800 hover:border-red-500/40 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-xs">Вийти</span>
          </button>
        </div>
      </header>

      {/* ================= 1. MOBILE VIEW (<md, <768px): ALWAYS 3 TABS ================= */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Top 3-Segment Switcher */}
        <div className="w-full grid grid-cols-3 bg-zinc-950/80 border border-zinc-800/60 p-1 rounded-2xl mb-2.5 shadow-inner gap-1 text-center shrink-0">
          <button
            onClick={() => setActiveTab("catastrophe")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "catastrophe"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="truncate">Подія</span>
          </button>

          <button
            onClick={() => setActiveTab("table")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">Стіл</span>
          </button>

          {isVotingPhase ? (
            <button
              onClick={() => setActiveTab("kick")}
              className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "kick"
                  ? "bg-zinc-800 text-white font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span className="truncate">Голосування</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("hand")}
              className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "hand"
                  ? "bg-zinc-800 text-white font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="truncate">Рука</span>
            </button>
          )}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === "catastrophe" && (
            <CatastropheColumn catastrophe={room.catastrophe} />
          )}
          {activeTab === "table" && (
            <PlayersTable
              room={room}
              currentPlayer={currentPlayer}
              onSkipTurn={onSkipTurn}
            />
          )}
          {!isVotingPhase && activeTab === "hand" && renderHandContent()}
          {isVotingPhase && activeTab === "kick" && (
            <KickColumn
              room={room}
              currentPlayer={currentPlayer}
              onKickClick={() => setIsKickModalOpen(true)}
              onLeaveRoom={() => setIsLeaveModalOpen(true)}
              onSkipTurn={onSkipTurn}
              onEndTurn={onEndTurn}
            />
          )}
        </div>
      </div>

      {/* ================= 2. TABLET VIEW (md to <lg, 768px-1023px): 3 COLUMNS ================= */}
      <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-3 flex-1 w-full min-h-0 h-full overflow-hidden">
        {/* Column 1: Catastrophe */}
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <CatastropheColumn catastrophe={room.catastrophe} />
        </div>

        {/* Column 2: Players Table */}
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <PlayersTable
            room={room}
            currentPlayer={currentPlayer}
            onSkipTurn={onSkipTurn}
          />
        </div>

        {/* Column 3 (Presenting: Hand) or Column 4 (Voting: Kick) */}
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          {!isVotingPhase ? (
            renderHandContent()
          ) : (
            <KickColumn
              room={room}
              currentPlayer={currentPlayer}
              onKickClick={() => setIsKickModalOpen(true)}
              onLeaveRoom={() => setIsLeaveModalOpen(true)}
              onSkipTurn={onSkipTurn}
              onEndTurn={onEndTurn}
            />
          )}
        </div>
      </div>

      {/* ================= 3. LAPTOP & DESKTOP VIEW (>=lg, 1024px+): 3 COLUMNS ================= */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 flex-1 w-full min-h-0 h-full overflow-hidden">
        {/* Column 1: Catastrophe */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
          <CatastropheColumn catastrophe={room.catastrophe} />
        </div>

        {/* Column 2: Players Table */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-0 overflow-hidden">
          <PlayersTable
            room={room}
            currentPlayer={currentPlayer}
            onSkipTurn={onSkipTurn}
          />
        </div>

        {/* Column 3 (Presenting: Hand) or Column 4 (Voting: Kick) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 overflow-hidden">
          {!isVotingPhase ? (
            renderHandContent()
          ) : (
            <KickColumn
              room={room}
              currentPlayer={currentPlayer}
              onKickClick={() => setIsKickModalOpen(true)}
              onLeaveRoom={() => setIsLeaveModalOpen(true)}
              onSkipTurn={onSkipTurn}
              onEndTurn={onEndTurn}
            />
          )}
        </div>
      </div>

      {/* Leave Game Confirmation Modal (Centered on entire screen) */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsLeaveModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">
              Покинути гру?
            </h3>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Вашого персонажа буде видалено з бункера, а сесію завершено.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsLeaveModalOpen(false);
                  onLeaveRoom();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 cursor-pointer"
              >
                Так, вийти
              </button>

              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for casting vote */}
      <KickModal
        isOpen={isKickModalOpen}
        onClose={() => setIsKickModalOpen(false)}
        room={room}
        currentPlayer={currentPlayer}
        onCastVote={onCastVote}
      />

      {/* Rock Paper Scissors Duel Modal on Tied Votes */}
      {room.rpsDuel && (
        <RpsDuelModal
          duel={room.rpsDuel}
          currentPlayer={currentPlayer}
          onMakeChoice={onMakeRpsChoice}
        />
      )}

      {/* Announcement Modal: When voting concludes and player is expelled */}
      {room.lastExpelledName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">
              {room.lastExpelledName}
            </h3>

            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Більшість проголосувала проти цього кандидата. Гравець залишається за межами бункера.
            </p>

            <button
              onClick={onDismissExpelled}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 cursor-pointer"
            >
              Продовжити гру
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
