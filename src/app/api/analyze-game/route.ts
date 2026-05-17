import { NextResponse } from "next/server";

function buildPrompt(opponent: string, result: string, movesCount: number): string {
  const resultText =
    result === "player" ? "won" : result === "opponent" ? "lost" : "drew";

  return `You are an expert checkers/draughts coach. A player just finished a game:
- Opponent: ${opponent}
- Result: ${resultText}
- Total moves played: ${movesCount}

Give exactly 3 specific, actionable coaching insights based on this game summary.

Return ONLY a JSON array with no markdown. Each object must have:
- "type": one of "positional_error" | "missed_capture" | "good_move" | "strategy"
- "description": 1-2 sentences of specific, actionable advice.

Example: [{"type":"strategy","description":"Against hard AI, focus on king promotion early — kings dominate the endgame."}]`;
}

function parseInsights(text: string) {
  // Try direct parse first (Gemini sometimes returns raw JSON)
  try {
    const arr = JSON.parse(text.trim());
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {}
  // Greedy regex — find outermost [...] block
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    if (Array.isArray(arr) && arr.length > 0) return arr as unknown[];
    return null;
  } catch { return null; }
}

export async function POST(request: Request) {
  const { opponent, result, movesCount } = await request.json();

  if (!opponent || !result || movesCount == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prompt = buildPrompt(opponent, result, movesCount);

  // Try Claude first
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey: anthropicKey });
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      });
      const text = message.content[0].type === "text" ? message.content[0].text : "[]";
      const insights = parseInsights(text);
      if (insights && insights.length > 0) return NextResponse.json({ insights, source: "claude" });
    } catch {}
  }

  // Fallback to Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ insights: [], source: "no_key" });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
        }),
      }
    );
    if (!res.ok) return NextResponse.json({ insights: [], source: "gemini_error" });
    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const insights = parseInsights(text);
    if (!insights) return NextResponse.json({ insights: [], source: "parse_error" });
    return NextResponse.json({ insights, source: "gemini" });
  } catch {
    return NextResponse.json({ insights: [], source: "exception" });
  }
}
