"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CheckersLogo } from "@/components/CheckersLogo";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");

    if (!email.trim()) { setError(t.auth.login.enterEmail); return; }
    if (!password) { setError(t.auth.login.enterPassword); return; }

    setLoading(true);

    const supabase = createClient();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("invalid") || msg.includes("credentials")) setError(t.auth.login.wrongCredentials);
        else if (msg.includes("email not confirmed")) setError(t.auth.login.emailNotConfirmed);
        else if (msg.includes("too many")) setError(t.auth.login.tooManyAttempts);
        else setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t.auth.login.networkError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <CheckersLogo size={64} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.auth.login.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.auth.login.subtitle}</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t.auth.login.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t.auth.login.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-60 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? t.auth.login.signingIn : t.auth.login.signIn}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t.auth.login.noAccount}{" "}
              <Link href="/auth/signup" className="text-amber-600 hover:text-amber-700 font-medium">
                {t.auth.login.signUp}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
