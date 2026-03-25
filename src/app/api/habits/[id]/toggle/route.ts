import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/* ─────────────────────────────────────────────────────────
   POST /api/habits/[id]/toggle
   Body: { date: "YYYY-MM-DD" }
   Toggles the completion status for a habit on a given date.
───────────────────────────────────────────────────────── */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const habitId = parseInt(id, 10);
  const { date } = await req.json() as { date: string };

  /* Upsert the log row, toggling completed */
  const rows = await sql`
    INSERT INTO habit_logs (habit_id, log_date, completed)
    VALUES (${habitId}, ${date}, TRUE)
    ON CONFLICT (habit_id, log_date)
    DO UPDATE SET completed = NOT habit_logs.completed
    RETURNING completed;
  `;

  return NextResponse.json({ completed: rows[0].completed });
}
