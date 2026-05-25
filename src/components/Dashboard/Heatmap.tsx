'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayLog } from '@/app/page';

interface HeatmapProps {
  logs: DayLog[];
  loading?: boolean;
}

function buildDates(count: number): string[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (count - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function getIntensityColor(pct: number): string {
  if (pct === 0)   return 'rgba(56,189,248,0.04)';
  if (pct < 25)    return 'rgba(7,89,133,0.7)';
  if (pct < 50)    return 'rgba(3,105,161,0.85)';
  if (pct < 75)    return 'rgba(14,165,233,0.90)';
  return '#38bdf8';
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function Heatmap({ logs, loading = false }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; pct: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const days = isMobile ? 28 : 56;
  const cols = isMobile ? 7 : 8; // weeks view
  const dates = buildDates(days);
  const logMap = new Map(logs.map(l => [l.date, Number(l.pct)]));

  if (!mounted) {
    return <div className="card h-[160px] skeleton" />;
  }

  return (
    <div className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Activity</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{isMobile ? 'Last 4 weeks' : 'Last 8 weeks'}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-600">Less</span>
          {[0, 40, 70, 100].map(v => (
            <div
              key={v}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(v) }}
            />
          ))}
          <span className="text-[10px] text-zinc-600">More</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: days }).map((_, i) => (
            <div key={i} className="aspect-square rounded-sm skeleton" />
          ))}
        </div>
      ) : (
        <div className="relative">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.008 } } }}
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {dates.map(date => {
              const pct = logMap.get(date) ?? 0;
              return (
                <motion.div
                  key={date}
                  variants={{
                    hidden: { opacity: 0, scale: 0.6 },
                    show:   { opacity: 1, scale: 1, transition: { duration: 0.15 } },
                  }}
                  className="aspect-square rounded-sm cursor-pointer transition-transform duration-100 hover:scale-110"
                  style={{ backgroundColor: getIntensityColor(pct) }}
                  onMouseEnter={() => setTooltip({ date, pct })}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </motion.div>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                className="fixed z-50 pointer-events-none"
                style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)' }}
              >
                <div className="glass rounded-lg px-3 py-2 text-center shadow-xl">
                  <p className="text-[11px] text-zinc-400 font-medium">{formatDate(tooltip.date)}</p>
                  <p className="text-sm font-semibold text-zinc-100 mt-0.5">
                    {tooltip.pct === 0 ? 'No activity' : `${tooltip.pct}% complete`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
