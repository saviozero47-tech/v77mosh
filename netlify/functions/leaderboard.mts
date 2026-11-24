import type { Config, Context } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

interface LeaderboardRow {
  id: number;
  player_name: string;
  character_name: string;
  stage_name: string;
  score: number;
  max_combo: number;
  created_at: string;
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function sanitizeText(raw: unknown, maxLen: number, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const cleaned = raw
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLen);
  return cleaned || fallback;
}

async function fetchTop3(db: ReturnType<typeof getDatabase>) {
  const rows = await db.sql<LeaderboardRow>`
    SELECT id, player_name, character_name, stage_name, score, max_combo, created_at
    FROM leaderboard
    ORDER BY score DESC, created_at ASC
    LIMIT 3
  `;
  return rows.map((r) => ({
    id: r.id,
    playerName: r.player_name,
    characterName: r.character_name,
    stageName: r.stage_name,
    score: Number(r.score),
    maxCombo: Number(r.max_combo),
    createdAt: r.created_at,
  }));
}

export default async (req: Request, _context: Context) => {
  const db = getDatabase();

  try {
    if (req.method === "GET") {
      const top3 = await fetchTop3(db);
      return new Response(
        JSON.stringify({ mode: "global", top3 }),
        { status: 200, headers: JSON_HEADERS }
      );
    }

    if (req.method === "POST") {
      let body: Record<string, unknown>;
      try {
        body = (await req.json()) as Record<string, unknown>;
      } catch {
        return new Response(JSON.stringify({ error: "JSON inválido" }), {
          status: 400,
          headers: JSON_HEADERS,
        });
      }

      const score = Math.floor(Number(body.score));
      const maxCombo = Math.max(0, Math.min(9999, Math.floor(Number(body.maxCombo) || 0)));
      if (!Number.isFinite(score) || score <= 0 || score > 9999999) {
        return new Response(JSON.stringify({ error: "Pontuação inválida" }), {
          status: 400,
          headers: JSON_HEADERS,
        });
      }

      const currentTop3 = await fetchTop3(db);
      const qualifies =
        currentTop3.length < 3 || score > currentTop3[currentTop3.length - 1].score;

      if (!qualifies) {
        return new Response(
          JSON.stringify({
            mode: "global",
            saved: false,
            inTop3: false,
            rank: null,
            top3: currentTop3,
          }),
          { status: 200, headers: JSON_HEADERS }
        );
      }

      const playerName = sanitizeText(body.playerName, 40, "Anônimo V77");
      const characterName = sanitizeText(body.characterName, 32, "KAOS");
      const stageName = sanitizeText(body.stageName, 80, "MOSH DE ARMA BRANCA");

      const inserted = await db.sql<LeaderboardRow>`
        INSERT INTO leaderboard (player_name, character_name, stage_name, score, max_combo)
        VALUES (${playerName}, ${characterName}, ${stageName}, ${score}, ${maxCombo})
        RETURNING id, player_name, character_name, stage_name, score, max_combo, created_at
      `;
      const savedRow = inserted[0];

      // Mantém apenas o Top 3 no banco para consumo mínimo
      await db.sql`
        DELETE FROM leaderboard
        WHERE id NOT IN (
          SELECT id FROM leaderboard
          ORDER BY score DESC, created_at ASC
          LIMIT 3
        )
      `;

      const top3 = await fetchTop3(db);
      const rankIdx = top3.findIndex((r) => r.id === savedRow.id);
      const rank = rankIdx >= 0 ? rankIdx + 1 : null;

      return new Response(
        JSON.stringify({
          mode: "global",
          saved: rank !== null,
          id: savedRow.id,
          rank,
          inTop3: rank !== null,
          top3,
        }),
        { status: 201, headers: JSON_HEADERS }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  } catch (err) {
    console.error("Erro na API /api/leaderboard:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno ao acessar ranking global" }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
};

export const config: Config = {
  path: "/api/leaderboard",
  method: ["GET", "POST"],
};
