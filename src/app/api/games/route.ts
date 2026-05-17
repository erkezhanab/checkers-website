import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { opponent_type, opponent_difficulty, winner, moves_count, duration_seconds, player_color } = body;

  const { error } = await supabase.from("game_records").insert({
    player_id: user.id,
    opponent_type,
    opponent_difficulty,
    winner,
    moves_count,
    duration_seconds: duration_seconds ?? 0,
    player_color: player_color ?? "black",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true });
}
