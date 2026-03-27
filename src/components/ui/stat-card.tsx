import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

export default function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative group overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-full max-w-[200px] transition-all duration-300 hover:border-white/20 hover:scale-[1.02]",
        "after:absolute after:inset-0 after:bg-linear-to-br after:from-white/10 after:to-transparent after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-500",
        className
      )}
    >
      {/* Decorative Glow */}
      <div className="absolute -top-12 -left-12 size-24 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors" />
      <div className="absolute -bottom-12 -right-12 size-24 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
        <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
          {value}
        </span>
        <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500/40 group-hover:w-full transition-all duration-500" />
    </div>
  );
}
