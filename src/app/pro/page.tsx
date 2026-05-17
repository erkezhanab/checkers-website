"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";

export default function ProPage() {
  const { isPro, setIsPro } = useUser();
  const { t } = useLanguage();

  const handleUnlock = async () => {
    setIsPro(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const username =
        session.user.user_metadata?.username ||
        session.user.email?.split("@")[0] ||
        "user";
      try {
        await supabase.from("player_stats").upsert(
          { user_id: session.user.id, username, pro_status: true },
          { onConflict: "user_id" }
        );
      } catch {}
    }
  };

  if (isPro) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t.pro.youArePro}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t.pro.enjoyGame}</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
          >
            {t.pro.startPlaying}
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-colors"
          >
            {t.pro.visitShop}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t.pro.choosePlan}</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">{t.pro.unlockInstantly}</p>
      </div>

      <div className="flex gap-6 items-stretch">

        {/* Free card */}
        <div className="flex-1 relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 pb-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{t.pro.free}</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            $0<span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-1">{t.pro.forever}</span>
          </p>

          <ul className="flex flex-col gap-3">
            {t.pro.freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{f}</span>
              </li>
            ))}
            {["Hard AI", "AI Coach", "Premium skins", "Game history"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <X className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <span className="text-gray-400 dark:text-gray-500">{f}</span>
              </li>
            ))}
          </ul>

          <div className="absolute bottom-8 left-8 right-8">
            <button
              disabled
              className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-semibold cursor-not-allowed"
            >
              {t.pro.currentPlan}
            </button>
          </div>
        </div>

        {/* Pro card */}
        <div className="flex-1 relative rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 p-8 pb-24 overflow-hidden">
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {t.pro.best}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Pro ⭐</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            $4.99<span className="text-base font-normal text-gray-400 dark:text-gray-500 ml-1">/ month</span>
          </p>

          <ul className="flex flex-col gap-3">
            {t.pro.proFeatureLabels.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{f}</span>
              </li>
            ))}
          </ul>

          <div className="absolute bottom-3 left-8 right-8">
            <button onClick={handleUnlock} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-semibold transition-all">
              {t.pro.unlockPro}
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
              {t.pro.noPayment}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
