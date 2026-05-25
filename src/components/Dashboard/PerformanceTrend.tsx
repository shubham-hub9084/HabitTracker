'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { DayLog } from '@/app/page';

interface PerformanceTrendProps {
  logs: DayLog[];
  loading?: boolean;
}

interface BarData {
  date: string;
  label: string;
  pct: number;
  isToday: boolean;
}

function buildBars(logs: DayLog[], days: number): BarData[] {
  const map = new Map(logs.map(l => [l.date, Number(l.pct)]));
  const today = new Date();

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
      pct: map.get(date) ?? 0,
      isToday: i === days - 1,
    };
  });
}

export default function PerformanceTrend({ logs, loading = false }: PerformanceTrendProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const days = isMobile ? 7 : 14;
  const bars = buildBars(logs, days);
  const todayPct = bars.at(-1)?.pct ?? 0;

  if (!mounted) return <div className="card h-[200px] skeleton" />;

  return (
    <div className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Performance</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{isMobile ? 'Last 7 days' : 'Last 14 days'}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-zinc-100">{todayPct}%</p>
          <p className="text-[11px] text-zinc-500">today</p>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5 sm:gap-2 h-28">
        {loading
          ? Array.from({ length: days }).map((_, i) => (
              <div key={i} className="flex-1 rounded-t skeleton" style={{ height: `${30 + Math.random() * 50}%` }} />
            ))
          : bars.map((bar, i) => {
              const height = Math.max(4, (bar.pct / 100) * 100);
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={bar.date}
                  className="flex-1 flex flex-col items-center gap-2 group relative"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 glass rounded-md px-2 py-1 pointer-events-none z-10 whitespace-nowrap"
                    >
                      <span className="text-[11px] font-medium text-zinc-100">{bar.pct}%</span>
                    </motion.div>
                  )}

                  {/* Bar container */}
                  <div className="w-full flex items-end h-24 relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ type: 'spring', stiffness: 140, damping: 18, delay: i * 0.03 }}
                      className={`
                        w-full rounded-t-sm transition-all duration-200
                        ${bar.isToday
                          ? ''
                          : bar.pct > 0
                            ? 'bg-sky-800/70 group-hover:bg-sky-700/80'
                            : 'bg-sky-950/50'
                        }
                      `}
                      style={{
                        background: bar.isToday
                          ? 'linear-gradient(to top, #0ea5e9, #38bdf8)'
                          : undefined,
                        boxShadow: bar.isToday && bar.pct > 0
                          ? '0 0 18px rgba(56,189,248,0.4)'
                          : 'none',
                      }}
                    />
                  </div>

                  {/* Day label */}
                  <span className={`text-[10px] font-medium ${bar.isToday ? 'text-[var(--color-accent)]' : 'text-zinc-600'}`}>
                    {bar.isToday ? '·' : bar.label}
                  </span>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
