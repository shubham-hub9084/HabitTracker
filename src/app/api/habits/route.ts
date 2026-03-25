import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/* ─────────────────────────────────────────────────────────
   GET /api/habits?date=YYYY-MM-DD
   Returns all habits with their completion status for date.
───────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const rows = await sql`
    SELECT
      h.id,
      h.name,
      h.icon,
      h.color,
      h.sort_order,
      COALESCE(l.completed, FALSE) AS completed
    FROM habits h
    LEFT JOIN habit_logs l
          ON l.habit_id = h.id AND l.log_date = ${date}
    ORDER BY h.sort_order;
  `;

  return NextResponse.json({ date, habits: rows });
}
