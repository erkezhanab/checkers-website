"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PlayerStats } from "@/lib/types";

interface UseUserProfileResult {
  profile: PlayerStats | null;
  loading: boolean;
  refresh: () => void;
}

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const sessionUser = session?.user ?? null;
      if (!sessionUser) { setProfile(null); return; }
      supabase
        .from("player_stats")
        .select("*")
        .eq("user_id", sessionUser.id)
        .maybeSingle()
        .then(({ data: stats }) => setProfile(stats ?? null))
        .catch((_err: unknown) => {});
    });
    return () => subscription.unsubscribe();
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  return { profile, loading, refresh };
}
