'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayLog } from '@/app/page';

interface HeatmapProps { logs: DayLog[] }

const DAYS = 60;

function buildGrid() {
  const cells: string[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    cells.push(d.toISOString().slice(0, 10));
  }
  return cells;
}

function getColor(pct: number) {
  if (pct === 0)  return '#1e293b';         // slate-800 - empty
  if (pct < 25)   return '#082f49';         // sky-950
  if (pct < 50)   return '#075985';         // sky-800
  if (pct < 75)   return '#0369a1';         // sky-700
  return '#38bdf8';                          // sky-400 full
}

export default function Heatmap({ logs }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string, pct: number } | null>(null);
  const logMap = new Map(logs.map(l => [l.date, Number(l.pct)]));
  const cells  = buildGrid();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.01 }
    }
  };

  const item = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 space-y-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Consistency Map</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium italic opacity-80">Track your kinetic persistence</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1.5 rounded-full self-start sm:self-auto">
          <span>Less</span>
          {[0, 50, 100].map(v => (
            <div
              key={v}
              className="w-2.5 h-2.5 rounded-[2px]"
              style={{ backgroundColor: getColor(v) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Responsive Wrapper with Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-1.5 sm:gap-2 relative min-w-[320px] sm:min-w-0" 
          style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
        >
          {cells.map((date, idx) => {
            const pct = logMap.get(date) ?? 0;
            return (
              <motion.div
                key={date}
                variants={item}
                onMouseEnter={() => setHoveredCell({ date, pct })}
                onMouseLeave={() => setHoveredCell(null)}
                className="aspect-square rounded-[3px] sm:rounded-md transition-all cursor-crosshair relative border border-white/5"
                style={{ 
                  backgroundColor: getColor(pct),
                  boxShadow: pct > 75 ? '0 0 10px rgba(56, 189, 248, 0.15)' : 'none'
                }}
                whileHover={{ scale: 1.15, zIndex: 10 }}
              />
            );
          })}

          {/* Floating Tooltip */}
          <AnimatePresence>
            {hoveredCell && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-50 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-2xl"
              >
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {new Date(hoveredCell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  {hoveredCell.pct}% Optimized
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
