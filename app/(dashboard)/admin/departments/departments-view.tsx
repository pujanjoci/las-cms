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
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-800">Departments</h1>
          <p className="text-slate-500 mt-1 font-medium">Configure organizational hierarchy and office levels.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-indigo-100 active:scale-95 ring-1 ring-primary/20">
          <Plus size={18} />
          <span>Add Root Department</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">Mapping Structure...</p>
          </div>
        ) : departments.length > 0 ? (
          <div className="space-y-4">
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
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-300">
              <Building2 size={48} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-800">No Departments Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm font-medium">
                Start by creating your first root department, like Head Office or a specific Region.
              </p>
            </div>
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
    <div className="relative">
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary/30 transition-all group shadow-sm hover:shadow-md">
        <div className="flex items-center gap-4">
          {hasChildren ? (
            <button 
              onClick={() => toggleExpand(dept.id)} 
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="w-9" />
          )}
          <div className={`p-2.5 rounded-xl border ${dept.is_active ? 'bg-indigo-50 text-primary border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">{dept.dept_name}</h3>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">{dept.dept_code}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 text-indigo-600 rounded-full text-[10px] font-bold shadow-sm">
              <User size={12} />
              <span>{dept.user_count || 0} Members</span>
            </div>
            
            {/* Individual Users List */}
            {dept.users && dept.users.length > 0 && (
              <div className="flex -space-x-2 overflow-hidden">
                {dept.users.slice(0, 3).map((user: any, idx: number) => (
                  <div 
                    key={`${user.id}-${idx}`} 
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-primary border border-indigo-200 shadow-sm"
                    title={user.full_name || 'Unknown User'}
                  >
                    {(user.full_name || '?').charAt(0)}
                  </div>
                ))}
                {dept.users.length > 3 && (
                  <div key="more-users" className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +{dept.users.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button className={`p-1 transition-all hover:scale-110 ${dept.is_active ? 'text-emerald-500' : 'text-slate-300'}`}>
            {dept.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>

          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-slate-100">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div key="dept-children" className="mt-4 ml-8 space-y-4 border-l-2 border-slate-100 pl-6 animate-in slide-in-from-left-2 duration-300">
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
