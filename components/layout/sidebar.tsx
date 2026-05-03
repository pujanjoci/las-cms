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
  Clock,
  X
} from 'lucide-react';
import type { SessionUser, Permission } from '@/lib/types';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { useActionState } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { useSidebar } from './sidebar-context';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [state, formAction] = useActionState(logoutAction, null);

  const sections: SidebarSection[] = [
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

  const adminSections: SidebarSection[] = [
    {
      title: 'Administration',
      items: [
        { name: 'Policy', href: '/admin/policy', icon: Settings, permission: PERMISSIONS.SETTINGS_MANAGE },
        { name: 'Eligible Scripts', href: '/admin/scripts', icon: ShieldAlert, permission: PERMISSIONS.SETTINGS_MANAGE },
        { name: 'User Management', href: '/settings/users', icon: Users, permission: PERMISSIONS.USER_MANAGE },
        { name: 'Departments', href: '/admin/departments', icon: Settings, permission: PERMISSIONS.SETTINGS_MANAGE },
        { name: 'Approval Chain', href: '/workflow/config', icon: GitPullRequest, permission: PERMISSIONS.SETTINGS_MANAGE },
        { name: 'Audit Trails', href: '/admin/audit', icon: Clock, permission: PERMISSIONS.SETTINGS_MANAGE },
      ]
    }
  ];

  const superAdminSections: SidebarSection[] = [
    {
      title: 'System',
      items: [
        { name: 'System Settings', href: '/superadmin/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_MANAGE },
      ]
    }
  ];

  const allSections: SidebarSection[] = [...sections];
  if (user.roles.includes('admin') || user.roles.includes('super_admin')) {
    allSections.push(...adminSections);
  }
  if (user.roles.includes('super_admin')) {
    allSections.push(...superAdminSections);
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={close}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border flex flex-col h-full shadow-2xl lg:shadow-none
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl shadow-md">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-slate-800 leading-none">CreditAppraise</h1>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">Margin Lending</p>
            </div>
          </div>
          <button 
            onClick={close}
            className="lg:hidden p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {allSections.map((section) => {
            const visibleItems = section.items.filter(item => !item.permission || hasPermission(user, item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-3">
                <h3 className="px-3 text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        onClick={close}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                          isActive 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-1 ring-primary/20' 
                            : 'text-text-secondary hover:text-primary hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-base shadow-inner">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-800">{user.full_name}</p>
              <p className="text-[10px] text-text-muted truncate capitalize font-semibold">{user.roles[0].replace('_', ' ')}</p>
            </div>
          </div>
          <form action={formAction}>
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest opacity-60">
              NRB Unified Directive 2081
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
