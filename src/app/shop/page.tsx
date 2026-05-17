"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SKINS, getSkin } from "@/lib/skins";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

export default function ShopPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isPro } = useUser();
  const [activeSkin, setActiveSkin] = useState("classic");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        const { data: stats } = await supabase
          .from("player_stats")
          .select("selected_skin")
          .eq("user_id", user.id)
          .maybeSingle();
        if (stats?.selected_skin) setActiveSkin(stats.selected_skin);
      } catch {}
    })();
  }, []);

  const selected = getSkin(activeSkin);

  const handleSelect = async (skinId: string) => {
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return;
    if (skin.isPro && !isPro) return; // locked

    setActiveSkin(skinId);
    setSaved(false);

    if (!isSupabaseConfigured()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.rpc("save_selected_skin", { p_skin: skinId });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePlayWithSkin = () => {
    router.push(`/?skin=${activeSkin}`);
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.shop.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.shop.subtitle}</p>
          {!isPro && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm">
              <Lock className="w-3.5 h-3.5" />
              {t.shop.proRequired}{" "}
              <Link href="/pro" className="font-semibold underline">{t.shop.proAccount}</Link>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
            {SKINS.map((skin, i) => {
              const isLocked = skin.isPro && isPro !== true;
              const isActive = activeSkin === skin.id && !isLocked;

              return (
                <motion.button
                  key={skin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleSelect(skin.id)}
                  disabled={isLocked}
                  className={cn(
                    "relative rounded-xl border-2 p-4 text-left transition-all",
                    isActive
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                      : "border-gray-200 dark:border-gray-700",
                    isLocked
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer"
                  )}
                >
                  {/* PRO badge — lock if not pro, sparkle if pro */}
                  {skin.isPro && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {isPro ? <Sparkles className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />} PRO
                    </div>
                  )}

                  {/* Selected checkmark */}
                  {isActive && (
                    <div className={cn(
                      "absolute top-2 w-5 h-5 rounded-full flex items-center justify-center",
                      skin.isPro ? "right-12 bg-green-500" : "right-2 bg-amber-500"
                    )}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="flex gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-black/20 shadow"
                      style={{ background: skin.blackStyle.background, borderColor: skin.blackStyle.borderColor }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-black/20 shadow"
                      style={{ background: skin.redStyle.background, borderColor: skin.redStyle.borderColor }}
                    />
                  </div>

                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{t.skins[skin.id]?.name ?? skin.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{t.skins[skin.id]?.desc ?? skin.description}</div>

                  {isLocked && (
                    <Link
                      href="/pro"
                      className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Sparkles className="w-3 h-3" /> {t.shop.unlockWithPro}
                    </Link>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="w-full lg:w-56 flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">{t.shop.preview}</h3>
              <div className="rounded-lg overflow-hidden" style={{ background: selected.boardLight }}>
                <div className="grid grid-cols-4 gap-0">
                  {Array(16).fill(null).map((_, i) => {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const isDark = (row + col) % 2 === 1;
                    return (
                      <div
                        key={i}
                        className="w-10 h-10 flex items-center justify-center"
                        style={{ background: isDark ? selected.boardDark : selected.boardLight }}
                      >
                        {isDark && (row === 0 || row === 3) && (
                          <div
                            className="w-7 h-7 rounded-full border-2 shadow"
                            style={
                              row === 0
                                ? { background: selected.redStyle.background, borderColor: selected.redStyle.borderColor }
                                : { background: selected.blackStyle.background, borderColor: selected.blackStyle.borderColor }
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t.skins[selected.id]?.name ?? selected.name}</div>
                {selected.isPro && !isPro && (
                  <Link href="/pro" className="text-xs text-amber-500 hover:text-amber-600 flex items-center justify-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3" /> {t.shop.upgradeToUnlock}
                  </Link>
                )}
              </div>
            </div>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {t.shop.skinSaved}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handlePlayWithSkin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm text-center shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t.shop.playWith} {t.skins[selected.id]?.name ?? selected.name}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
