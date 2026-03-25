'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Sun, 
  Book, 
  Droplet, 
  Sparkles, 
  Dumbbell, 
  Moon, 
  Footprints, 
  BookOpen,
  LucideIcon 
} from 'lucide-react';

interface HabitCardProps {
  title: string;
  time: string;
  icon: string; // This is now a Lucide icon key
  accentColor: string;
  checked?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  'sun':        Sun,
  'book':       Book,
  'droplet':    Droplet,
  'sparkles':   Sparkles,
  'dumbbell':   Dumbbell,
  'moon':       Moon,
  'footprints': Footprints,
  'book-open':  BookOpen,
};

export default function HabitCard({ title, time, icon, accentColor, checked = false }: HabitCardProps) {
  const IconComponent = ICON_MAP[icon] || CheckCircle2;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer group glass-panel
        ${checked
          ? 'border-[rgba(56,189,248,0.4)] bg-[rgba(56,189,248,0.08)]'
          : 'border-white/5 hover:border-white/10'
        }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div 
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all
            ${checked ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'}`}
        >
          <IconComponent size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-bold text-sm sm:text-base text-white tracking-tight">{title}</p>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">{time}</p>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <CheckCircle2
                size={22}
                className="sm:w-[26px] sm:h-[26px] text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                strokeWidth={2.5}
              />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Circle
                size={22}
                className="sm:w-[26px] sm:h-[26px] text-slate-700 group-hover:text-slate-500 transition-colors"
                strokeWidth={1.5}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
