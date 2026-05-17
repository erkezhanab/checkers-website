"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Sparkles, LogOut, Trash2, Edit2,
  CheckCircle2, Loader2, AlertTriangle, Shield, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signOut as doSignOut } from "@/lib/signOut";
import { KAZAKH_CITIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  username: string;
  city: string;
  pro_status: boolean;
  rating: number;
  wins: number;
  losses: number;
  games_played: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editCity, setEditCity] = useState("Astana");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // getUser() hits the network but is the only reliable way to read the
    // session when @supabase/ssr stores it in localStorage (not cookies).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const authUser = session?.user ?? null;

      if (!authUser) {
        setLoading(false);
        router.push("/auth/login?from=/profile");
        return;
      }

      setUser(authUser);
      setEditUsername(authUser.email?.split("@")[0] ?? "");
      setLoading(false);

      supabase
        .from("player_stats")
        .select("*")
        .eq("user_id", authUser.id)
        .single()
        .then(({ data: stats }) => {
          if (!stats) return;
          setProfile(stats);
          setEditUsername(stats.username ?? authUser.email?.split("@")[0] ?? "");
          setEditCity(stats.city ?? "Astana");
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);

    const trimmed = editUsername.trim();
    if (trimmed.length < 3) { setSaveError("Username must be at least 3 characters."); setSaveLoading(false); return; }
    if (trimmed.length > 20) { setSaveError("Username must be 20 characters or less."); setSaveLoading(false); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setSaveError("Username can only contain letters, numbers, and underscores."); setSaveLoading(false); return; }

    const supabase = createClient();
    const { error } = await supabase
      .from("player_stats")
      .update({ username: trimmed, city: editCity })
      .eq("user_id", user.id);

    if (error) {
      setSaveError(error.message);
    } else {
      setProfile((p) => p ? { ...p, username: trimmed, city: editCity } : p);
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaveLoading(false);
  };

  const handleSignOut = () => doSignOut();

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteLoading(true);
    const supabase = createClient();
    await supabase.from("player_stats").delete().eq("user_id", user.id);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Sign in to view your profile</h2>
        <Link href="/auth/login?from=/profile" className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const initials = (profile?.username ?? user.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/stats"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stats
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">

        {/* Header card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {profile?.username ?? user.email?.split("@")[0]}
                </h1>
                {profile?.pro_status ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold flex-shrink-0">
                    <Sparkles className="w-3 h-3" /> PRO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-semibold flex-shrink-0">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile?.city}</p>
              {profile && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Rating {profile.rating} · {profile.wins}W {profile.losses}L · {profile.games_played} games
                </p>
              )}
            </div>
            <button
              onClick={() => setEditing((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* Edit profile form */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Profile</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                    <input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      maxLength={20}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="Your username"
                    />
                    <p className="text-xs text-gray-400 mt-1">3–20 characters, letters, numbers, underscores only.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                    <select
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                      {KAZAKH_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {saveError && (
                    <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-lg">
                      {saveError}
                    </p>
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                  >
                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {saveLoading ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Profile updated successfully!
          </motion.div>
        )}

        {/* Account info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Info</h2>
          <div className="flex flex-col gap-3">
            <InfoRow icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email" value={user.email ?? "—"} />
            <InfoRow icon={<User className="w-4 h-4 text-gray-400" />} label="Username" value={profile?.username ?? "—"} />
            <InfoRow
              icon={<Sparkles className="w-4 h-4 text-amber-400" />}
              label="Plan"
              value={profile?.pro_status ? "Pro" : "Free"}
              badge={profile?.pro_status ? "PRO" : undefined}
            />
            <InfoRow icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Member since" value={joinDate} />
            <InfoRow icon={<Shield className="w-4 h-4 text-gray-400" />} label="User ID" value={user.id.slice(0, 8) + "…"} mono />
          </div>

          {!profile?.pro_status && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                Upgrade to Pro for game history, AI Coach, custom skins, and Blitz mode.
              </p>
              <Link
                href="/pro"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                <Sparkles className="w-4 h-4" /> View Pro plans →
              </Link>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Actions</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              Sign out
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" />
              Delete account
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-300 dark:border-red-800 p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Delete your account?</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This will permanently delete your profile, stats, and game history. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                  )}
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleteLoading ? "Deleting…" : "Yes, delete everything"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function InfoRow({
  icon, label, value, badge, mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-sm text-gray-500 dark:text-gray-400 w-28 flex-shrink-0">{label}</span>
      <span className={cn("text-sm text-gray-800 dark:text-gray-200 flex-1", mono && "font-mono text-xs")}>
        {value}
      </span>
      {badge && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
          <Sparkles className="w-3 h-3" /> {badge}
        </span>
      )}
    </div>
  );
}
