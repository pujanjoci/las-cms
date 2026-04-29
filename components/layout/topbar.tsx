'use client';

import { Bell, Search } from 'lucide-react';
import type { SessionUser } from '@/lib/types';

interface TopbarProps {
  user: SessionUser;
}

export function Topbar({ user }: TopbarProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'super_staff': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const roleLabel = user.roles[0].replace('_', ' ');

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-text-secondary hidden md:block">
          Welcome back, <span className="text-primary">{user.full_name.split(' ')[0]}</span>
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(user.roles[0])}`}>
            {roleLabel}
          </span>
          <span className="text-xs font-bold text-text-muted uppercase tracking-tighter hidden sm:block">
            Main Branch
          </span>
        </div>

        <div className="h-4 w-px bg-border"></div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-lg hover:bg-slate-50">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
