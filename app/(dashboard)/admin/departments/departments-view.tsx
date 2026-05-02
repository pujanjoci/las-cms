'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, Building2, User, ToggleLeft, ToggleRight, MoreVertical } from 'lucide-react';
import { PERMISSIONS, hasPermission } from '@/lib/rbac';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/types';

interface Department {
  id: string;
  dept_code: string;
  dept_name: string;
  parent_id: string | null;
  level: number;
  is_active: boolean;
  children: Department[];
  user_count?: number;
  users?: any[];
}

interface DepartmentsViewProps {
  session: SessionUser;
}

export function DepartmentsView({ session }: DepartmentsViewProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!hasPermission(session, PERMISSIONS.SETTINGS_MANAGE)) {
      router.push('/dashboard');
      return;
    }
    fetchDepartments();
  }, [session, router]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Configure organizational hierarchy and office levels.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <Plus size={20} />
          <span>Add Root Department</span>
        </button>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-xl shadow-black/5 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading organizational structure...</p>
          </div>
        ) : departments.length > 0 ? (
          <div className="-ml-4">
            {departments.map((dept, idx) => (
              <DeptNode 
                key={`${dept.id}-${idx}`} 
                dept={dept} 
                expanded={expanded} 
                toggleExpand={toggleExpand} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-muted/30 rounded-full mb-4">
              <Building2 size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Departments Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
              Start by creating your first root department, like Head Office or a specific Region.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DeptNode({ 
  dept, 
  expanded, 
  toggleExpand 
}: { 
  dept: Department, 
  expanded: Record<string, boolean>, 
  toggleExpand: (id: string) => void 
}) {
  const hasChildren = dept.children && dept.children.length > 0;
  const isExpanded = expanded[dept.id];

  return (
    <div className="ml-4 border-l border-border/50 pl-4 mt-2">
      <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:border-primary/30 transition-all group shadow-sm">
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button onClick={() => toggleExpand(dept.id)} className="p-1 hover:bg-surface rounded text-muted-foreground">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className={`p-2 rounded-md ${dept.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{dept.dept_name}</h3>
            <span className="text-xs text-muted-foreground font-mono">{dept.dept_code}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] font-bold">
              <User size={12} />
              <span>{dept.user_count || 0} Users</span>
            </div>
            
            {/* Individual Users List */}
            {dept.users && dept.users.length > 0 && (
              <div className="flex -space-x-2 overflow-hidden">
                {dept.users.slice(0, 3).map((user: any, idx: number) => (
                  <div 
                    key={`${user.id}-${idx}`} 
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
                    title={user.full_name || 'Unknown User'}
                  >
                    {(user.full_name || '?').charAt(0)}
                  </div>
                ))}
                {dept.users.length > 3 && (
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    +{dept.users.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button className={`p-1 transition-colors ${dept.is_active ? 'text-emerald-500 hover:text-emerald-600' : 'text-rose-500 hover:text-rose-600'}`}>
            {dept.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>

          <button className="p-1.5 hover:bg-surface rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 transition-all">
          {dept.children.map((child, idx) => (
            <DeptNode 
              key={`${child.id}-${idx}`} 
              dept={child} 
              expanded={expanded} 
              toggleExpand={toggleExpand} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
