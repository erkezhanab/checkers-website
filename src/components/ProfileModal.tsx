"use client";

import { useEffect, useRef } from "react";
import { X, Mail, Calendar, LogOut } from "lucide-react";
import { signOut as doSignOut } from "@/lib/signOut";
import { useLanguage } from "@/context/LanguageContext";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Props {
  user: SupabaseUser;
  onClose: () => void;
}

export function ProfileModal({ user, onClose }: Props) {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSignOut = () => doSignOut();


  const displayName = user.email?.split("@")[0] ?? "—";
  const initials = displayName.slice(0, 2).toUpperCase();
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-start justify-end pt-16 pr-4"
      onMouseDown={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-none" />

      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[calc(100vh-5rem)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.profile.myAccount}</span>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Avatar + name + badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow flex-shrink-0">
              <span className="text-lg font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Info rows */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            <Row icon={<Mail className="w-3.5 h-3.5 text-gray-400" />} label={t.profile.email} value={user.email ?? "—"} />
            <Row icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />} label={t.profile.joined} value={joinDate} />
          </div>

          {/* Sign out / Delete */}
          <div className="flex flex-col gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-400" /> {t.profile.signOut}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {icon}
      <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-800 dark:text-gray-200 font-medium truncate">{value}</span>
    </div>
  );
}
