import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/* ─────────────────────────────────────────────────────────
   GET /api/logs?days=120
   Returns aggregated daily completion data for:
   - Consistency Heatmap (count of completed habits per day)
   - Performance Graph   (% habits done per day)
───────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '120', 10);

  const rows = await sql`
    SELECT
      log_date::text                         AS date,
      COUNT(*) FILTER (WHERE completed)      AS done,
      COUNT(*)                               AS total,
      ROUND(
        COUNT(*) FILTER (WHERE completed)::numeric
        / NULLIF((SELECT COUNT(*) FROM habits), 0) * 100
      )                                      AS pct
    FROM habit_logs
    WHERE log_date >= CURRENT_DATE - ${days}::int
    GROUP BY log_date
    ORDER BY log_date;
  `;

  return NextResponse.json({ days, logs: rows });
}
