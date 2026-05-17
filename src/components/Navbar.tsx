"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LogIn, LogOut, User, BookOpen, Palette, ChevronDown, Gamepad2, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CheckersLogo } from "./CheckersLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ProfileModal } from "./ProfileModal";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signOut as doSignOut } from "@/lib/signOut";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/context/UserContext";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabaseReady = isSupabaseConfigured();
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => doSignOut();

  const navItems = [
    { href: "/",            label: t.nav.play,        icon: <Gamepad2  className="w-4 h-4" />, always: true },
    { href: "/learn",       label: t.nav.learn,       icon: <BookOpen  className="w-4 h-4" />, always: true },
    { href: "/history",     label: t.nav.history,      icon: <Clock     className="w-4 h-4" />, always: true },
    { href: "/shop",        label: t.nav.shop,        icon: <Palette   className="w-4 h-4" />, always: true },
    { href: "/pro",         label: t.nav.pro,         icon: <Sparkles  className="w-4 h-4" />, always: true },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-gray-100 flex-shrink-0">
          <CheckersLogo size={32} />
          <span className="hidden sm:inline">Checkers</span>
        </div>

        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            if (!item.always && !supabaseReady) return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          {supabaseReady && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                <>
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline max-w-20 truncate">{user.email?.split("@")[0]}</span>
                </>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <button
                      onClick={() => { setDropdownOpen(false); setProfileModalOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      {t.nav.viewProfile}
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : supabaseReady ? (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t.nav.signIn}</span>
            </Link>
          ) : null}
        </div>
      </div>

      {profileModalOpen && user && (
        <ProfileModal
          user={user}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </nav>
  );
}
