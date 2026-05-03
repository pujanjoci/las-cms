'use client';

import { Bell, Search, Menu, User } from 'lucide-react';
import type { SessionUser } from '@/lib/types';
import { useSidebar } from './sidebar-context';

interface TopbarProps {
  user: SessionUser;
}

export function Topbar({ user }: TopbarProps) {
  const { toggle } = useSidebar();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'admin': return 'bg-red-50 text-red-700 border-red-200/50';
      case 'super_staff': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      default: return 'bg-blue-50 text-blue-700 border-blue-200/50';
    }
  };

  const roleLabel = user.roles[0].replace('_', ' ');

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="lg:hidden p-2 text-text-secondary hover:text-primary transition-all rounded-xl hover:bg-slate-50 border border-transparent hover:border-border"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <h2 className="text-sm font-bold text-slate-800 hidden sm:block">
          Welcome, <span className="text-primary">{user.full_name.split(' ')[0]}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 md:gap-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${getRoleColor(user.roles[0])}`}>
            {roleLabel}
          </span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:block">
            Main Branch
          </span>
        </div>

        <div className="h-6 w-px bg-border hidden sm:block"></div>

        <div className="flex items-center gap-1 md:gap-2">
          <button className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-xl hover:bg-slate-50 group">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
          </button>
          
          <div className="md:hidden h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
            {user.full_name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
