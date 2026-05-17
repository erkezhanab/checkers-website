"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, Users, Wifi, Zap, Brain, Trophy, Loader2 } from "lucide-react";
import type { Difficulty, GameConfig, GameMode, PieceColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

interface GameSetupProps {
  onStart: (config: GameConfig) => void;
  selectedSkinId?: string;
}

type ExtendedMode = GameMode | "online";

export function GameSetup({ onStart, selectedSkinId }: GameSetupProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useUser();
  const [mode, setMode] = useState<ExtendedMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [playerColor, setPlayerColor] = useState<PieceColor>("black");
  const [speedMode, setSpeedMode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [roomLoading] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showCode, setShowCode] = useState(false);

  const handleStart = () => {
    if (mode === "online") return;
    onStart({ mode: mode as GameMode, difficulty, playerColor, speedMode, skinId: selectedSkinId });
  };

  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length !== 6) { setRoomError(t.setup.invalidCode); return; }
    router.push(`/room/${code}`);
  };

  const handleCreateRoom = async () => {
    console.log('create room clicked');
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('code:', code);
    console.log('user from context:', user?.id);

    if (!user) {
      alert('Please login first');
      return;
    }

    // Show code immediately — don't wait for insert
    setRoomCode(code);
    setShowCode(true);

    // Insert in background
    const supabase = createClient();
    supabase.from('rooms').insert({
      code,
      host_id: user.id,
      status: 'waiting',
    }).then(({ error }) => {
      console.log('insert error:', error);
    });
  };

  if (showCode) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">Комната создана! 🎉</h2>
        <div className="text-6xl font-bold tracking-widest text-amber-500 my-6">
          {roomCode}
        </div>
        <p className="text-gray-400 mb-6">Поделитесь кодом с другом</p>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => navigator.clipboard.writeText(roomCode)}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold w-48"
          >
            Скопировать код
          </button>
          <button
            onClick={() => { window.location.href = `/room/${roomCode}`; }}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold w-48"
          >
            Войти в комнату →
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm mx-auto flex flex-col gap-5"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.setup.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.setup.subtitle}</p>
      </div>

      <Section label={t.setup.gameMode}>
        <div className="grid grid-cols-3 gap-2">
          <ModeCard active={mode === "ai"} onClick={() => setMode("ai")} icon={<Bot className="w-5 h-5" />} label={t.setup.vsAi} />
          <ModeCard active={mode === "pvp"} onClick={() => setMode("pvp")} icon={<Users className="w-5 h-5" />} label={t.setup.twoPlayers} />
          <ModeCard active={mode === "online"} onClick={() => setMode("online")} icon={<Wifi className="w-5 h-5" />} label={t.setup.online} />
        </div>
      </Section>

      {mode === "online" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-3">
          <button
            onClick={handleCreateRoom}
            disabled={roomLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {roomLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
            {t.setup.createRoom}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">{t.setup.orJoin}</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setRoomError(""); }}
              placeholder={t.setup.roomCodePlaceholder}
              maxLength={6}
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm uppercase text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleJoinRoom}
              className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors"
            >
              {t.setup.join}
            </button>
          </div>
          {roomError && <p className="text-xs text-red-500">{roomError}</p>}

          {!isSupabaseConfigured() && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
              {t.setup.supabaseRequired}
            </p>
          )}
        </motion.div>
      )}

      {mode !== "online" && (
        <>
          {mode === "ai" && (
            <>
              <Section label={t.setup.difficulty}>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <DifficultyBtn
                      key={d}
                      active={difficulty === d}
                      onClick={() => setDifficulty(d)}
                      diffKey={d}
                      label={t.setup[d as "easy" | "medium" | "hard"]}
                    />
                  ))}
                </div>
              </Section>

              <Section label={t.setup.yourColor}>
                <div className="grid grid-cols-2 gap-3">
                  {(["black", "red"] as PieceColor[]).map((c) => (
                    <ColorCard key={c} active={playerColor === c} onClick={() => setPlayerColor(c)} color={c} label={c === "black" ? t.setup.blackFirst : t.setup.redSecond} />
                  ))}
                </div>
              </Section>
            </>
          )}

          <Section label={t.setup.options}>
            <button
              onClick={() => setSpeedMode((v) => !v)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left",
                speedMode
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
              )}
            >
              <Zap className={cn("w-5 h-5 flex-shrink-0", speedMode ? "text-amber-500" : "text-gray-400")} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t.setup.blitzMode}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t.setup.blitzDesc}
                </div>
              </div>
              <div className={cn("ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all", speedMode ? "border-amber-500 bg-amber-500" : "border-gray-300 dark:border-gray-600")}>
                {speedMode && <div className="w-full h-full rounded-full bg-white scale-50" />}
              </div>
            </button>
          </Section>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-lg shadow-lg transition-all duration-200 hover:shadow-amber-500/25 hover:shadow-xl"
          >
            {t.setup.startGame}
          </button>
        </>
      )}
    </motion.div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-1">{label}</p>
      {children}
    </div>
  );
}

function ModeCard({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center",
        active
          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
          : "border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 text-gray-600 dark:text-gray-400"
      )}
    >
      {icon}
      <div className="font-semibold text-xs">{label}</div>
    </button>
  );
}

function DifficultyBtn({ active, onClick, diffKey, label }: { active: boolean; onClick: () => void; diffKey: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    easy: <Zap className="w-3 h-3" />,
    medium: <Brain className="w-3 h-3" />,
    hard: <Trophy className="w-3 h-3" />,
  };
  const colors: Record<string, string> = { easy: "text-green-600", medium: "text-amber-600", hard: "text-red-600" };
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 transition-all duration-200",
        active ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
      )}
    >
      <span className={colors[diffKey]}>{icons[diffKey]}</span>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
}

function ColorCard({ active, onClick, color, label }: { active: boolean; onClick: () => void; color: PieceColor; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
        active ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
      )}
    >
      <div className={cn("w-9 h-9 rounded-full shadow-md border-2", color === "black" ? "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-950" : "bg-gradient-to-br from-red-400 to-red-700 border-red-800")} />
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</div>
    </button>
  );
}
