const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/^DATABASE_URL=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  const url = getDatabaseUrl();
  if (!url) {
    console.log('[DB-SETUP] No DATABASE_URL found. Skipping database setup/warmup.');
    return;
  }

  console.log('[DB-SETUP] Initializing database and warming up Neon compute instance...');
  const sql = neon(url);
  const start = Date.now();

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // 1. Create tables & index
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

      // 2. Seed data if habits is empty
      const existing = await sql`SELECT COUNT(*) AS c FROM habits`;
      if (Number(existing[0].c) === 0) {
        console.log('[DB-SETUP] Seeding initial habits data...');
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

      console.log(`[DB-SETUP] Database setup and warmup completed successfully in ${Date.now() - start}ms.`);
      return;
    } catch (err) {
      console.warn(`[DB-SETUP] Warmup attempt ${attempt} failed:`, err.message);
      if (attempt === 3) {
        console.error('[DB-SETUP] Failed to warm up database after all attempts.');
        process.exit(1);
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

run();
