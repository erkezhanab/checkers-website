"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Clock, Wifi, WifiOff, Trophy } from "lucide-react";

import { useRoom } from "@/hooks/useRoom";
import { useUser } from "@/context/UserContext";
import { Board } from "@/components/Board";
import { cn } from "@/lib/utils";
import type { PieceColor } from "@/lib/types";

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const { user } = useUser();

  const userId = user?.id ?? "";
  const username = user?.email?.split("@")[0] ?? "Player";

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <RoomGame code={code} userId={userId} username={username} />;
}

function RoomGame({ code, userId, username }: { code: string; userId: string; username: string }) {
  const { gameState, roomInfo, roomStatus, myColor, isMyTurn, error, handleCellClick } = useRoom(code, userId, username);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${code}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Room Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <a href="/" className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const winnerLabel = (() => {
    if (roomInfo?.winner === "host") return roomInfo.hostUsername;
    if (roomInfo?.winner === "guest") return roomInfo.guestUsername;
    if (roomInfo?.winner === "draw") return "Draw";
    return null;
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="flex flex-col items-center gap-4">
          <Board
            state={gameState}
            onCellClick={handleCellClick}
            flipped={myColor === "red"}
          />

          <AnimatePresence>
            {roomStatus === "finished" && winnerLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-amber-800 w-full max-w-xs"
              >
                <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {winnerLabel === "Draw" ? "It's a Draw!" : `${winnerLabel} wins!`}
                </h2>
                <a href="/" className="inline-block mt-4 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors">
                  Play Again
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-72 flex flex-col gap-4">
          <RoomPanel
            code={code}
            roomInfo={roomInfo}
            roomStatus={roomStatus}
            myColor={myColor}
            isMyTurn={isMyTurn}
            gameState={gameState}
            shareUrl={shareUrl}
            copied={copied}
            onCopy={copyLink}
          />
        </div>
      </div>
    </div>
  );
}

function RoomPanel({ code, roomInfo, roomStatus, myColor, isMyTurn, gameState, shareUrl, copied, onCopy }: {
  code: string;
  roomInfo: ReturnType<typeof useRoom>["roomInfo"];
  roomStatus: ReturnType<typeof useRoom>["roomStatus"];
  myColor: PieceColor | null;
  isMyTurn: boolean;
  gameState: ReturnType<typeof useRoom>["gameState"];
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wifi className={cn("w-4 h-4", roomStatus === "playing" ? "text-green-500" : "text-gray-400")} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {roomStatus === "loading" ? "Connecting…"
                : roomStatus === "waiting" ? "Waiting for opponent"
                : roomStatus === "playing" ? "Game in progress"
                : "Game over"}
            </span>
          </div>
          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-bold text-gray-700 dark:text-gray-300">
            {code}
          </span>
        </div>

        {roomStatus === "waiting" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Share this link with a friend:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 truncate text-gray-600 dark:text-gray-300"
              />
              <button
                onClick={onCopy}
                className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-gray-400">Waiting for player to join…</span>
            </div>
          </div>
        )}

        {(roomStatus === "playing" || roomStatus === "finished") && roomInfo && (
          <div className="flex flex-col gap-2 mt-1">
            <PlayerRow
              username={roomInfo.hostUsername}
              color={roomInfo.hostColor}
              isActive={gameState.currentTurn === roomInfo.hostColor && roomStatus === "playing"}
            />
            <div className="text-center text-xs text-gray-400">vs</div>
            <PlayerRow
              username={roomInfo.guestUsername || "Guest"}
              color={roomInfo.hostColor === "black" ? "red" : "black"}
              isActive={gameState.currentTurn !== roomInfo.hostColor && roomStatus === "playing"}
            />
          </div>
        )}
      </div>

      {roomStatus === "playing" && (
        <motion.div
          key={isMyTurn ? "your-turn" : "their-turn"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl px-4 py-3 text-center text-sm font-semibold text-white",
            isMyTurn
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-gray-500 to-gray-600"
          )}
        >
          {isMyTurn ? "Your turn — make a move!" : "Waiting for opponent…"}
        </motion.div>
      )}

      {myColor && (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full shadow border-2 flex-shrink-0",
            myColor === "black"
              ? "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-950"
              : "bg-gradient-to-br from-red-400 to-red-700 border-red-800"
          )} />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">You play as</div>
            <div className="text-sm font-bold capitalize text-gray-800 dark:text-gray-200">{myColor}</div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {gameState.board.flat().filter((c) => c?.color === "black").length}
            </div>
            <div className="text-xs text-gray-500">⚫ Black</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {gameState.board.flat().filter((c) => c?.color === "red").length}
            </div>
            <div className="text-xs text-gray-500">🔴 Red</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ username, color, isActive }: { username: string; color: PieceColor; isActive: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
      isActive ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" : ""
    )}>
      <div className={cn(
        "w-6 h-6 rounded-full border shadow-sm flex-shrink-0",
        color === "black"
          ? "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-900"
          : "bg-gradient-to-br from-red-400 to-red-700 border-red-800"
      )} />
      <span className={cn("text-sm font-medium truncate", isActive ? "text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-300")}>
        {username}
      </span>
      {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
    </div>
  );
}
