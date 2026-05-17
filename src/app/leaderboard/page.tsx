import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LeaderboardView } from "./LeaderboardView";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  if (!isSupabaseConfigured()) {
    return <LeaderboardView players={[]} unavailable />;
  }

  const supabase = createClient();
  const { data: players } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(100);

  return <LeaderboardView players={players ?? []} />;
}
