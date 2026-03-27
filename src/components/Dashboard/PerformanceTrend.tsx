'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import type { DayLog } from '@/app/page';
import { BouncingDots } from '@/components/ui/bouncing-dots';

interface PerformanceTrendProps { logs: DayLog[]; loading?: boolean }

function buildBars(logs: DayLog[], days: number) {
  const logMap = new Map(logs.map(l => [l.date, Number(l.pct)]));
  const today  = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      pct: logMap.get(date) ?? 0,
      isToday: i === days - 1,
    };
  });
}

export default function PerformanceTrend({ logs, loading = false }: PerformanceTrendProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const daysToShow = isMobile ? 7 : 14;
  const bars = buildBars(logs, daysToShow);
  const todayPct = bars.length > 0 ? bars[bars.length - 1].pct : 0;
  const maxH = 120;

  if (!mounted) return <div className="glass-panel p-6 h-[280px] animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 sm:p-6 space-y-6 sm:space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sky-400 mb-1">
            <Activity size={14} className="sm:size-4" />
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{isMobile ? 'Last 7 Days' : 'Bi-weekly Stats'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Performance Trend</h2>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-xl sm:text-2xl font-black text-white">{todayPct}%</div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] font-bold text-sky-400 uppercase tracking-widest bg-sky-400/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
            <TrendingUp size={10} />
            Today
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-[180px] px-2">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <BouncingDots 
              message="Analyzing Performance Trajectory" 
              className="bg-sky-400"
            />
          </div>
        ) : (
          bars.map(({ date, label, pct, isToday }) => {
            const h = Math.max(8, (pct / 100) * maxH);
            return (
              <div key={date} className="flex flex-col items-center gap-3 flex-1 group">
                <div className="relative w-full flex flex-col items-center group-hover:z-10">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-slate-800 text-[10px] font-bold text-white px-2 py-1 rounded border border-white/10 shadow-xl pointer-events-none">
                    {pct}%
                  </div>

                  {isToday && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -top-6 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" 
                    />
                  )}
                  
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
                    className={`w-full rounded-full transition-all duration-300 relative
                      ${pct === 0 ? 'bg-slate-800/50' : 'cursor-pointer'}
                      ${isToday ? 'bg-gradient-to-t from-sky-600 to-sky-400' : 'bg-slate-700/50 group-hover:bg-slate-600/80'}`}
                    style={{
                      boxShadow: isToday && pct > 0 ? '0 10px 20px -5px rgba(56, 189, 248, 0.4)' : 'none',
                    }}
                  >
                    {/* Inner shine */}
                    {!isToday && pct > 0 && (
                      <div className="absolute inset-0 w-full rounded-full bg-gradient-to-t from-transparent to-white/5" />
                    )}
                  </motion.div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter sm:tracking-normal
                  ${isToday ? 'text-sky-400 font-black' : 'text-slate-500'}`}>
                  {label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
