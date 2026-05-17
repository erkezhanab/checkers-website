"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface UserContextValue {
  user: User | null;
  isPro: boolean;
  setIsPro: (v: boolean) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isPro: false,
  setIsPro: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsProState] = useState(false);
  const [loading, setLoading] = useState(false);

  const setIsPro = (v: boolean) => {
    setIsProState(v);
    try { localStorage.setItem("isPro", v ? "true" : "false"); } catch {}
  };

  useEffect(() => {
    // Read localStorage after hydration to avoid server/client mismatch
    if (localStorage.getItem("isPro") === "true") setIsProState(true);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const { data } = supabase.auth.onAuthStateChange((_, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (!currentUser) {
          setIsPro(false);
        } else {
          // Fetch from DB and sync. maybeSingle returns null if no row yet.
          supabase
            .from("player_stats")
            .select("pro_status")
            .eq("user_id", currentUser.id)
            .maybeSingle()
            .then(({ data: row }) => {
              if (row === null) return; // no row yet — trust localStorage
              setIsPro(row.pro_status === true);
            }, () => {});
        }
      });
      subscription = data.subscription;
    } catch {}

    return () => { subscription?.unsubscribe(); };
  }, []);

  return (
    <UserContext.Provider value={{ user, isPro, setIsPro, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
