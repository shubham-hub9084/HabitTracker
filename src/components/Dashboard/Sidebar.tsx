import React from 'react';
import { LayoutDashboard, History, Trophy, Settings } from 'lucide-react';

const Sidebar = () => {
  const mainNav = [
    { name: 'Dashboard',    icon: LayoutDashboard, active: true  },
    { name: 'History',      icon: History,         active: false },
    { name: 'Achievements', icon: Trophy,           active: false },
    { name: 'Settings',     icon: Settings,         active: false },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 z-40 bg-surface-container-low flex-col py-8 pr-4 text-sm font-medium">
      {/* Brand */}
      <div className="px-6 mb-12">
        <div className="text-xl font-black text-primary mb-1">HabitFlow</div>
        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Kinetic Sanctuary</div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-1">
        {mainNav.map(({ name, icon: Icon, active }) => (
          <a
            key={name}
            href="#"
            className={`pl-4 py-3 flex items-center gap-3 rounded-r-full transition-colors duration-200 ${
              active
                ? 'bg-surface-container text-primary border-l-4 border-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright'
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
            {name}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
