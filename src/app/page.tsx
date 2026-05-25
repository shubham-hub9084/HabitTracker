'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, CalendarDays } from 'lucide-react';
import Background from '@/components/Dashboard/ConstellationBackground';
import HabitCard from '@/components/Dashboard/HabitCard';
import Heatmap from '@/components/Dashboard/Heatmap';
import PerformanceTrend from '@/components/Dashboard/PerformanceTrend';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// ─── Types ─────────────────────────────────────────────────────────
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

// ─── Helpers ───────────────────────────────────────────────────────
function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function computeStreak(logs: DayLog[]): number {
  const map = new Map(logs.map(l => [l.date, Number(l.pct)]));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = toISO(cursor);
    const pct = map.get(key) ?? 0;
    if (pct === 0 && key !== toISO(new Date())) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─── Sub-components ────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

function StatPill({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card flex-1 flex flex-col items-center justify-center gap-1 py-4 text-center min-w-0">
      <div className="text-zinc-500 mb-0.5">{icon}</div>
      <p className="text-xl font-bold text-zinc-100 tabular-nums">{value}</p>
      <p className="text-[11px] text-zinc-500 font-medium">{label}</p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setViewDate(new Date());
    setMounted(true);
  }, []);

  const dateISO = viewDate ? toISO(viewDate) : toISO(new Date());
  const isToday = viewDate ? toISO(viewDate) === toISO(new Date()) : true;

  // Fetch habits + logs
  const refresh = useCallback(async () => {
    const [habitsRes, logsRes] = await Promise.all([
      fetch(`/api/habits?date=${dateISO}`),
      fetch('/api/logs?days=120'),
    ]);
    const { habits: h } = await habitsRes.json() as { habits: Habit[] };
    const { logs: l } = await logsRes.json() as { logs: DayLog[] };
    setHabits(h ?? []);
    setLogs(l ?? []);
    setLoading(false);
  }, [dateISO]);

  useEffect(() => {
    fetch('/api/setup', { method: 'POST' }).catch(console.error);
    refresh();
  }, [refresh]);

  // Toggle a habit
  const toggle = async (id: number) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
    const res = await fetch(`/api/habits/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateISO }),
    });
    const { completed } = await res.json() as { completed: boolean };
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, completed } : h))
    );
    // Refresh logs silently
    fetch('/api/logs?days=120')
      .then(r => r.json())
      .then(({ logs: l }: { logs: DayLog[] }) => setLogs(l ?? []));
  };

  // Date navigation
  const goBack = () => {
    if (!viewDate) return;
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 1);
    setViewDate(d);
    setLoading(true);
  };

  const goForward = () => {
    if (!viewDate || isToday) return;
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 1);
    setViewDate(d);
    setLoading(true);
  };

  // Derived stats
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const streak = computeStreak(logs);

  // Ring
  const ringRadius = 56;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (completionPct / 100) * ringCircumference;

  // Loading screen before mount
  if (!mounted || !viewDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Background />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-sky-900 border-t-sky-400 animate-spin" />
          <p className="text-sm text-sky-500/60">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Background />

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="relative z-50 sticky top-0">
        <div className="glass border-b border-[var(--color-border)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="6" cy="6" r="1.5" fill="#fff" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-sky-50">HabitFlow</span>
            </div>

            {/* Avatar */}
            <button
              className="flex items-center gap-2.5 group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-sky-100 leading-none">Shubham Sahu</p>
                <p className="text-[10px] text-sky-500/60 mt-0.5">Personal Tracker</p>
              </div>
              <Avatar className="size-8 ring-1 ring-white/10 group-hover:ring-indigo-500/30 transition-all">
                <AvatarImage src="/1766751500321.jpg" alt="Shubham Sahu" className="object-cover" />
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-semibold">SS</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-5 pb-16">

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            {isToday ? 'Today' : formatDate(viewDate)}
          </h1>
          {isToday && (
            <p className="text-sm text-zinc-500 mt-1">{formatDate(viewDate)}</p>
          )}
        </motion.div>

        {/* ── Stats row ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex gap-3"
        >
          <StatPill
            value={loading ? '—' : `${completedCount}/${totalCount}`}
            label="Completed"
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatPill
            value={loading ? '—' : `${completionPct}%`}
            label="Progress"
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            }
          />
          <StatPill
            value={loading ? '—' : streak}
            label={streak === 1 ? 'Day streak' : 'Day streak'}
            icon={<Flame size={13} className={streak > 0 ? 'text-amber-500' : 'text-zinc-600'} />}
          />
        </motion.div>

        {/* ── Habits Section ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-5 sm:p-6 space-y-4"
        >
          {/* Section header + date nav */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Habits</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isToday ? "Today's checklist" : formatDate(viewDate)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={goBack}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-[var(--color-border-hover)] transition-all"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Hidden date input behind styled button */}
              <div className="relative group">
                <input
                  type="date"
                  value={dateISO}
                  max={toISO(new Date())}
                  onChange={e => {
                    if (!e.target.value) return;
                    setViewDate(new Date(e.target.value + 'T00:00:00'));
                    setLoading(true);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--color-border)] text-xs text-zinc-500 font-medium group-hover:border-[var(--color-border-hover)] group-hover:text-zinc-300 transition-all whitespace-nowrap">
                  <CalendarDays size={12} />
                  Jump to date
                </div>
              </div>

              <button
                onClick={goForward}
                disabled={isToday}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-[var(--color-border-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="divider" />

          {/* Habits list */}
          <div className="space-y-1.5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))
            ) : habits.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-800/60 flex items-center justify-center mb-1">
                  <CalendarDays size={18} className="text-zinc-600" />
                </div>
                <p className="text-sm font-medium text-zinc-400">No habits for this date</p>
                <p className="text-xs text-zinc-600">Go back to today to start tracking</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {habits.map(habit => (
                  <div key={habit.id} onClick={() => toggle(habit.id)}>
                    <HabitCard
                      title={habit.name}
                      completed={habit.completed}
                      icon={habit.icon}
                      color={habit.color}
                    />
                  </div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* ── Progress Ring ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Daily progress</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Your completion for {isToday ? 'today' : 'this day'}</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Ring */}
            <div className="relative shrink-0 w-[132px] h-[132px]">
              <svg
                className="-rotate-90 w-full h-full"
                viewBox="0 0 132 132"
              >
                {/* Track */}
                <circle
                  cx="66"
                  cy="66"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="10"
                />
                {/* Progress */}
                <motion.circle
                  cx="66"
                  cy="66"
                  r={ringRadius}
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: ringCircumference }}
                  animate={{ strokeDashoffset: loading ? ringCircumference : ringOffset }}
                  transition={{ duration: 1.2, ease: 'circOut' }}
                  style={{ strokeDasharray: ringCircumference }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={completionPct}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl font-bold text-zinc-100 tabular-nums"
                >
                  {loading ? '…' : `${completionPct}%`}
                </motion.span>
                <span className="text-[10px] text-zinc-500 font-medium mt-0.5">done</span>
              </div>
            </div>

            {/* Stats beside ring */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Completed</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-zinc-100 tabular-nums">{loading ? '—' : completedCount}</span>
                  <span className="text-sm text-zinc-500">/ {totalCount}</span>
                </div>
              </div>

              <div className="divider" />

              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Streak</p>
                <div className="flex items-center gap-2">
                  <Flame size={16} className={streak > 0 ? 'text-amber-400' : 'text-zinc-700'} />
                  <span className="text-3xl font-bold text-zinc-100 tabular-nums">{loading ? '—' : streak}</span>
                  <span className="text-sm text-zinc-500">days</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Activity Heatmap ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Heatmap logs={logs} loading={loading} />
        </motion.div>

        {/* ── Performance Trend ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <PerformanceTrend logs={logs} loading={loading} />
        </motion.div>

      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 py-8 text-center">
        <p className="text-[11px] text-zinc-700 font-medium">HabitFlow · Built by Shubham Sahu</p>
      </footer>
    </div>
  );
}
