import { NextResponse } from "next/server";

interface MoveEntry {
  from: { row: number; col: number };
  to: { row: number; col: number };
  captures: unknown[];
}

const toAlgebraic = (row: number, col: number) =>
  `${"abcdefgh"[col]}${8 - row}`;

function langInstruction(lang: string): string {
  if (lang === "ru") return "Respond in Russian.\n\n";
  if (lang === "kz") return "Respond in Kazakh (Қазақша).\n\n";
  return "";
}

function buildPrompt(
  movesText: string,
  winner: string,
  playerColor: string,
  capturedRed: number,
  capturedBlack: number,
  lang: string
): string {
  const result =
    winner === "black_wins" ? "Black wins" :
    winner === "red_wins"   ? "Red wins"   : "Draw";

  return `${langInstruction(lang)}You are an expert checkers/draughts coach. Analyze the last moves of this game and give 2-3 specific, actionable coaching insights.

Result: ${result}
Player color: ${playerColor}
Captures — Red pieces taken: ${capturedRed}, Black pieces taken: ${capturedBlack}

Last moves:
${movesText}

Return EXACTLY 2-3 coaching insights as a JSON array. Each object must have:
- "moveIndex": integer (1-based move number this insight refers to)
- "type": one of "missed_capture" | "missed_king" | "positional_error" | "good_move"
- "description": 1-2 sentences, specific and actionable. Reference exact positions when possible.

Return only the JSON array, no markdown, no extra text.
Example: [{"moveIndex":3,"type":"missed_capture","description":"On move 3 you could have jumped over two pieces."},{"moveIndex":5,"type":"good_move","description":"Smart king promotion on move 5."}]`;
}

function parseInsights(text: string) {
  try {
    const arr = JSON.parse(text.trim());
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {}
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch { return null; }
}

export async function POST(request: Request) {
  const { moveHistory, winner, playerColor, capturedPieces, lang = "en" } = await request.json();

  if (!Array.isArray(moveHistory) || moveHistory.length < 2) {
    return NextResponse.json({ insights: [], source: "too_short" });
  }

  const lastMoves = (moveHistory as MoveEntry[]).slice(-5);
  const offset = moveHistory.length - lastMoves.length;

  const movesText = lastMoves
    .map((m, i) => {
      const n = offset + i + 1;
      const color = (offset + i) % 2 === 0 ? "Black" : "Red";
      const cap = m.captures.length > 0 ? ` ×${m.captures.length}` : "";
      return `${n}. ${color}: ${toAlgebraic(m.from.row, m.from.col)}→${toAlgebraic(m.to.row, m.to.col)}${cap}`;
    })
    .join("\n");

  const prompt = buildPrompt(movesText, winner, playerColor, capturedPieces?.red ?? 0, capturedPieces?.black ?? 0, lang);

  // Try Claude first
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey: anthropicKey });
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
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
          generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
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
