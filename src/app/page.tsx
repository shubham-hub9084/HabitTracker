'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronLeft, ChevronRight, Target, Flame, LayoutDashboard, History, Settings, ArrowUpRight } from 'lucide-react';
import ConstellationBackground from '@/components/Dashboard/ConstellationBackground';
import HabitCard               from '@/components/Dashboard/HabitCard';
import Heatmap                 from '@/components/Dashboard/Heatmap';
import PerformanceTrend        from '@/components/Dashboard/PerformanceTrend';

/* ─── Types ────────────────────────────── */
export interface DayLog {
  date: string;
  done: number;
  total: number;
  pct: number;
}

interface Habit {
  id: number;
  name: string;
  icon: string;
  color: string;
  completed: boolean;
}

/* ─── Helpers ───────────────────────────── */
const toISO = (d: Date) => d.toISOString().slice(0, 10);

function computeStreak(logs: DayLog[]): number {
  const logMap = new Map(logs.map(l => [l.date, Number(l.pct)]));
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = toISO(d);
    const pct = logMap.get(key) ?? 0;
    if (pct === 0 && key !== toISO(new Date())) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/* ─── Animation Variants ────────────────── */
const fadeInUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: 'easeOut' } 
  }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } }
};

/* ─── Main Page ─────────────────────────── */
export default function Home() {
  const [habits, setHabits]         = useState<Habit[]>([]);
  const [logs, setLogs]             = useState<DayLog[]>([]);
  const [loading, setLoading]       = useState(true);
  const [setupDone, setSetupDone]   = useState(false);
  const [viewDate, setViewDate]     = useState(new Date());
  const [menuOpen, setMenuOpen]     = useState(false);

  const date = toISO(viewDate);

  /* 1 – DB Setup */
  useEffect(() => {
    fetch('/api/setup', { method: 'POST' })
      .then(() => setSetupDone(true))
      .catch(console.error);
  }, []);

  /* 2 – Load habits + logs */
  const refresh = useCallback(async () => {
    const [hRes, lRes] = await Promise.all([
      fetch(`/api/habits?date=${date}`),
      fetch('/api/logs?days=120'),
    ]);
    const { habits: h } = await hRes.json() as { habits: Habit[] };
    const { logs: l }   = await lRes.json() as { logs: DayLog[] };
    setHabits(h ?? []);
    setLogs(l ?? []);
    setLoading(false);
  }, [date]);

  useEffect(() => { if (setupDone) refresh(); }, [setupDone, refresh]);

  /* 3 – Toggle habit */
  const toggle = async (id: number) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    const res = await fetch(`/api/habits/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    const { completed } = await res.json() as { completed: boolean };
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed } : h));
    fetch('/api/logs?days=120')
      .then(r => r.json())
      .then(({ logs: l }: { logs: DayLog[] }) => setLogs(l ?? []));
  };

  /* Derived */
  const done    = habits.filter(h => h.completed).length;
  const total   = habits.length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const streak  = computeStreak(logs);

  const isToday   = toISO(viewDate) === toISO(new Date());
  const prevDay   = () => { const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d); setLoading(true); };
  const nextDay   = () => { if (!isToday) { const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d); setLoading(true); } };

  /* Progress Ring Constants */
  const radius        = 84;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (pct / 100) * circumference;

  /* ─── Render ─────────────────────────── */
  return (
    <div className="min-h-screen text-slate-50 relative selection:bg-sky-500/30">
      <ConstellationBackground />

      {/* ── Header ─────────────────────── */}
      <header className="relative z-50 flex items-center justify-between px-6 py-6 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(56,189,248,0.5)] group-hover:scale-110 transition-transform duration-300">
            <Target size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xl font-black leading-tight flex items-baseline gap-1">
              Shubham <span className="text-sky-400">Sahu</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] font-black text-slate-500">
              Professional Excellence
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
           <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-500/30 transition-all duration-300"
          >
            <Menu size={22} />
          </button>
        </motion.div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute top-20 right-6 w-56 glass-panel shadow-2xl p-2 z-[100]"
            >
              {[
                { name: 'Dashboard', icon: LayoutDashboard },
                { name: 'History',   icon: History },
                { name: 'Settings',  icon: Settings },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <item.icon size={18} strokeWidth={2} />
                  {item.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Dashboard Content ──────────── */}
      <main className="relative z-10 px-5 pb-24 max-w-2xl mx-auto">
        
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Hero Section */}
          <motion.div variants={fadeInUp} className="py-8">
            <div className="flex items-center gap-2 text-sky-400 mb-2">
              <LayoutDashboard size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Main Console</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">Dashboard <span className="text-primary-gradient">Overview</span></h1>
            <p className="text-slate-400 text-base mt-2 font-medium max-w-md leading-relaxed">
              Elevate your daily potential through consistent micro-habits and performance tracking.
            </p>
          </motion.div>

          {/* ── HABITS CARD ──────────── */}
          <motion.div variants={fadeInUp} className="glass-panel p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  {isToday ? "Today's Target" : "Target Focus"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{fmtDate(viewDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={prevDay}
                  className="w-11 h-11 rounded-xl glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-500/20 transition-all duration-200"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="relative group">
                  <input
                    type="date"
                    value={date}
                    max={toISO(new Date())}
                    onChange={e => {
                      if (!e.target.value) return;
                      setViewDate(new Date(e.target.value + 'T00:00:00'));
                      setLoading(true);
                    }}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <div className="px-3 sm:px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500/20 transition-all duration-200 flex items-center gap-2 whitespace-nowrap">
                    📅 <span className="hidden xs:inline">Jump to</span> Date
                  </div>
                </div>

                <button
                  onClick={nextDay}
                  disabled={isToday}
                  className="w-11 h-11 rounded-xl glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-500/20 transition-all duration-200 disabled:opacity-20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
                </div>
              ) : habits.length === 0 ? (
                <div className="py-12 text-center glass-panel border-dashed border-slate-800">
                  <p className="text-slate-500 font-bold">No active habits found for this date.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {habits.map(h => (
                    <div key={h.id} onClick={() => toggle(h.id)}>
                      <HabitCard
                        title={h.name}
                        time={h.completed ? 'Mission Complete' : 'Awaiting Action'}
                        icon={h.icon}
                        accentColor={h.color}
                        checked={h.completed}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* ── PROGRESS RING ────────── */}
          <motion.div variants={fadeInUp} className="glass-panel p-8 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">Cumulative Progress</h2>
                <p className="text-slate-400 text-sm mt-1">Real-time daily optimization metrics.</p>
              </div>

              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center scale-90 sm:scale-100">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="70" className="sm:hidden" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
                  <circle cx="112" cy="112" r={radius} className="hidden sm:block" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                  
                  <motion.circle
                    cx="96" cy="96" r="70"
                    className="sm:hidden"
                    fill="transparent"
                    stroke="url(#progressGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 70) - (pct / 100) * (2 * Math.PI * 70) }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    style={{ strokeDasharray: 2 * Math.PI * 70 }}
                  />
                  <motion.circle
                    cx="112" cy="112" r={radius}
                    className="hidden sm:block"
                    fill="transparent"
                    stroke="url(#progressGrad)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    style={{ strokeDasharray: circumference }}
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    key={pct}
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl sm:text-5xl font-black text-white tracking-tighter"
                  >
                    {pct}%
                  </motion.span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mt-2">Optimized</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between mt-12 bg-white/5 border border-white/5 p-4 sm:p-5 rounded-2xl gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status Report</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">{done}</span>
                    <span className="text-slate-500 font-bold text-xs sm:text-sm">/ {total} Habits</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2 mb-1.5">
                    <Flame size={14} className={streak > 0 ? 'text-orange-500' : 'text-slate-700'} />
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Streak</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-white flex items-center gap-1.5">
                    {streak} <span className="text-[9px] text-slate-500 font-black uppercase">Days</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── DATA VIZ ─────────────── */}
          <motion.div variants={fadeInUp}>
            <Heatmap logs={logs} />
          </motion.div>

          <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-6">
            <PerformanceTrend logs={logs} />
          </motion.div>

        </motion.div>
      </main>

      {/* ── Footer ─────────────────────── */}
      <footer className="relative z-10 py-12 text-center">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">HabitFlow Kinetic Sanctuary • v2.0</p>
      </footer>
    </div>
  );
}
