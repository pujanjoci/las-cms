'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShieldAlert, 
  GitPullRequest, 
  PieChart, 
  Settings,
  LogOut,
  Clock
} from 'lucide-react';
import type { SessionUser } from '@/lib/types';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { useActionState } from 'react';
import { logoutAction } from '@/app/actions/auth';

interface SidebarProps {
  user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [state, formAction] = useActionState(logoutAction, null);

  const sections = [
    {
      title: 'Appraisal',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'New Appraisal', href: '/appraisal/new', icon: FileText, permission: PERMISSIONS.PROPOSAL_CREATE },
        { name: 'My Queue', href: '/appraisal/queue', icon: Clock },
        { name: 'All Cases', href: '/appraisal/all', icon: FileText, permission: PERMISSIONS.PROPOSAL_VIEW },
      ]
    },
    {
      title: 'Credit Memo',
      items: [
        { name: 'Create Memo', href: '/memo/create', icon: FileText, permission: PERMISSIONS.PROPOSAL_CREATE },
        { name: 'Memo Review', href: '/memo/review', icon: GitPullRequest, permission: PERMISSIONS.WORKFLOW_APPROVE },
      ]
    },
    {
      title: 'Reports',
      items: [
        { name: 'Analytics', href: '/reports', icon: PieChart, permission: PERMISSIONS.REPORTS_VIEW },
      ]
    }
  ];

  const adminSections = [
    {
      title: 'Administration',
      items: [
        { name: 'Policy', href: '/admin/policy', icon: Settings, permission: PERMISSIONS.SETTINGS_MANAGE },
        { name: 'Eligible Scripts', href: '/admin/scripts', icon: ShieldAlert, permission: PERMISSIONS.SETTINGS_MANAGE },
        { name: 'User Management', href: '/settings/users', icon: Users, permission: PERMISSIONS.USER_MANAGE },
        { name: 'Approval Chain', href: '/admin/workflow', icon: GitPullRequest, permission: PERMISSIONS.SETTINGS_MANAGE },
      ]
    }
  ];

  const superAdminSections = [
    {
      title: 'System',
      items: [
        { name: 'System Settings', href: '/superadmin/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_MANAGE },
      ]
    }
  ];

  const allSections = [...sections];
  if (user.roles.includes('admin') || user.roles.includes('super_admin')) {
    allSections.push(...adminSections);
  }
  if (user.roles.includes('super_admin')) {
    allSections.push(...superAdminSections);
  }

  return (
    <div className="w-64 bg-white border-r border-border flex flex-col h-full flex-shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-border">
        <div className="bg-primary text-white p-2 rounded-lg shadow-sm">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-primary leading-none">CreditAppraise</h1>
          <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-semibold">Margin Lending</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {allSections.map((section) => {
          const visibleItems = section.items.filter(item => !item.permission || hasPermission(user, item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-2">
              <h3 className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-accent-light text-primary border border-primary/10 shadow-sm' 
                          : 'text-text-secondary hover:text-primary hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-slate-50 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-text-primary">{user.full_name}</p>
            <p className="text-[10px] text-text-muted truncate capitalize font-medium">{user.roles[0].replace('_', ' ')}</p>
          </div>
        </div>
        <form action={formAction}>
          <button 
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
        <p className="mt-4 text-[9px] text-center text-text-muted font-medium uppercase tracking-tight">
          NRB Unified Directive 2081
        </p>
      </div>
    </div>
  );
}
