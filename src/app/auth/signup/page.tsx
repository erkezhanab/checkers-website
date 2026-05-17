"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KAZAKH_CITIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckersLogo } from "@/components/CheckersLogo";
import { useLanguage } from "@/context/LanguageContext";
import type { T } from "@/context/LanguageContext";

interface PasswordRules {
  length: boolean;
  uppercase: boolean;
  number: boolean;
}

function checkPassword(password: string): PasswordRules {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

function isPasswordValid(rules: PasswordRules): boolean {
  return rules.length && rules.uppercase && rules.number;
}

function validateEmail(email: string, t: T): string | null {
  const trimmed = email.trim();
  if (!trimmed) return t.auth.signup.emailRequired;
  const atIdx = trimmed.indexOf("@");
  if (atIdx < 1) return t.auth.signup.emailInvalidAt;
  const domain = trimmed.slice(atIdx + 1);
  if (!domain.includes(".") || domain.endsWith(".")) return t.auth.signup.emailInvalidDomain;
  return null;
}

function validateUsername(username: string, t: T): string | null {
  if (!username.trim()) return t.auth.signup.usernameRequired;
  if (username.length < 3) return t.auth.signup.usernameMinLength;
  if (username.length > 20) return t.auth.signup.usernameMaxLength;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return t.auth.signup.usernameInvalidChars;
  return null;
}

function friendlySupabaseError(message: string, t: T): string {
  const lower = message.toLowerCase();
  if (lower.includes("user already registered") || lower.includes("already registered"))
    return t.auth.signup.emailAlreadyRegistered;
  if (lower.includes("invalid email")) return t.auth.signup.invalidEmail;
  if (lower.includes("password")) return t.auth.signup.passwordTooWeak;
  if (lower.includes("rate limit")) return t.auth.signup.rateLimited;
  return message;
}

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("Astana");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, username: false });
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setInterval(() => setRetryAfter((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [retryAfter > 0]);

  const passwordRules = checkPassword(password);
  const emailError = touched.email ? validateEmail(email, t) : null;
  const usernameError = touched.username ? validateUsername(username, t) : null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, username: true });
    setError("");

    const emailErr = validateEmail(email, t);
    const usernameErr = validateUsername(username, t);
    if (emailErr) { setError(emailErr); return; }
    if (usernameErr) { setError(usernameErr); return; }
    if (!isPasswordValid(passwordRules)) {
      setError(t.auth.signup.passwordWeak);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: username.trim(), city } },
    });

    if (signUpError) {
      setError(friendlySupabaseError(signUpError.message, t));
      if (signUpError.message.toLowerCase().includes("rate limit") || signUpError.message.toLowerCase().includes("too many")) {
        setRetryAfter(60);
      }
      setLoading(false);
      return;
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError(t.auth.signup.emailAlreadyRegistered);
      setLoading(false);
      return;
    }

    if (data.user) {
      console.log("[signup] user created:", data.user.id);
      const { error: statsError } = await supabase.from("player_stats").insert({
        user_id: data.user.id,
        username: username.trim(),
        city,
      });
      if (statsError) console.error("[signup] player_stats insert failed:", statsError.message);
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.auth.signup.accountCreated}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {t.auth.signup.confirmationSent}{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">{t.auth.signup.checkInbox}</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
          >
            {t.auth.signup.goToLogin}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <CheckersLogo size={64} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.auth.signup.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.auth.signup.subtitle}</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.auth.signup.username}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
                  maxLength={20}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm",
                    usernameError ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
                  )}
                  placeholder="player123"
                />
                {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.auth.signup.city}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  {KAZAKH_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t.auth.signup.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm",
                  emailError ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
                placeholder="you@example.com"
              />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t.auth.signup.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {(password.length > 0 || touched.password) && (
                <div className="mt-2 flex flex-col gap-1">
                  <PasswordRule ok={passwordRules.length} label={t.auth.signup.ruleLength} />
                  <PasswordRule ok={passwordRules.uppercase} label={t.auth.signup.ruleUppercase} />
                  <PasswordRule ok={passwordRules.number} label={t.auth.signup.ruleNumber} />
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || retryAfter > 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-60 text-white font-bold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading
                ? t.auth.signup.creatingAccount
                : retryAfter > 0
                ? t.auth.signup.retryIn.replace("{n}", String(retryAfter))
                : t.auth.signup.createAccount}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t.auth.signup.alreadyHaveAccount}{" "}
              <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
                {t.auth.signup.signIn}
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", ok ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500")}>
      {ok
        ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        : <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
      {label}
    </div>
  );
}
