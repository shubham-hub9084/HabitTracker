import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS habits (
        id         SERIAL PRIMARY KEY,
        name       TEXT        NOT NULL,
        icon       TEXT        NOT NULL DEFAULT 'check',
        color      TEXT        NOT NULL DEFAULT '#4f8ef7',
        sort_order INT         NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id         SERIAL PRIMARY KEY,
        habit_id   INT         NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        log_date   DATE        NOT NULL,
        completed  BOOLEAN     NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(habit_id, log_date)
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(log_date);
    `;

    /* Seed data with Lucide icon keys instead of emojis */
    const existing = await sql`SELECT COUNT(*) AS c FROM habits`;
    if (Number(existing[0].c) === 0) {
      await sql`
        INSERT INTO habits (name, icon, color, sort_order) VALUES
          ('Wake Up',      'sun',        '#38bdf8', 1),
          ('Study',        'book',       '#818cf8', 2),
          ('2L Water',     'droplet',    '#38bdf8', 3),
          ('Meditation',   'sparkles',   '#818cf8', 4),
          ('Exercise',     'dumbbell',   '#38bdf8', 5),
          ('Night Study',  'moon',       '#818cf8', 6),
          ('Evening Walk', 'footprints', '#38bdf8', 7),
          ('Reading',      'book-open',  '#818cf8', 8);
      `;
    }

    const habits = await sql`SELECT id, name FROM habits ORDER BY sort_order`;
    return NextResponse.json({ ok: true, habits });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
