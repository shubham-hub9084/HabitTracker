'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Book, Droplet, Sparkles, Dumbbell, Moon, Footprints, BookOpen,
  type LucideIcon,
} from 'lucide-react';

interface HabitCardProps {
  title: string;
  completed: boolean;
  icon: string;
  color: string;
}

const ICONS: Record<string, LucideIcon> = {
  'sun':        Sun,
  'book':       Book,
  'droplet':    Droplet,
  'sparkles':   Sparkles,
  'dumbbell':   Dumbbell,
  'moon':       Moon,
  'footprints': Footprints,
  'book-open':  BookOpen,
};

export default function HabitCard({ title, completed, icon, color }: HabitCardProps) {
  const Icon = ICONS[icon] ?? Sparkles;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      data-testid="habit-card"
      data-habit-name={title}
      className={`
        group flex items-center gap-4 px-4 py-3.5 rounded-xl border cursor-pointer
        transition-all duration-200 select-none backdrop-blur-sm
        ${completed
          ? 'bg-[rgba(56,189,248,0.08)] border-[rgba(56,189,248,0.30)]'
          : 'bg-[rgba(4,18,38,0.35)] border-[rgba(56,189,248,0.10)] hover:border-[rgba(56,189,248,0.22)] hover:bg-[rgba(6,22,46,0.45)]'
        }
      `}
      style={completed ? { boxShadow: '0 0 16px -4px rgba(56,189,248,0.18)' } : {}}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: completed ? `${color}22` : 'rgba(56,189,248,0.06)',
          color: completed ? color : 'rgba(125,211,252,0.5)',
        }}
      >
        <Icon size={16} strokeWidth={1.75} />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate transition-colors duration-200
            ${completed
              ? 'text-sky-400/60 line-through decoration-sky-700'
              : 'text-sky-50 group-hover:text-white'
            }`}
        >
          {title}
        </p>
      </div>

      {/* Check circle */}
      <AnimatePresence mode="wait" initial={false}>
        {completed ? (
          <motion.div
            key="done"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'backOut' }}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 w-5 h-5 rounded-full border transition-colors"
            style={{ borderColor: 'rgba(56,189,248,0.20)' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
