'use client';

import { useState, useEffect } from 'react';
import { Plus, Shield, Users, Landmark, CheckCircle2, ChevronRight, Edit2, Settings2 } from 'lucide-react';

interface Role {
  id: string;
  role_code: string;
  role_name: string;
  dept_id: string;
  dept_name: string;
  can_initiate: boolean;
  can_review: boolean;
  can_recommend: boolean;
  can_approve: boolean;
  can_override: boolean;
  is_admin: boolean;
  approval_limit_min: number;
  approval_limit_max: number | null;
  permissions: any[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'No Limit';
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Role Management</h1>
          <p className="text-muted-foreground mt-1">Define permissions, authority levels, and approval limits.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <Plus size={20} />
          <span>Create New Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="w-16 h-6 bg-muted rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-5 bg-muted rounded" />
                <div className="w-1/2 h-4 bg-muted rounded" />
              </div>
              <div className="pt-4 flex gap-2">
                <div className="w-1/3 h-8 bg-muted rounded" />
                <div className="w-1/3 h-8 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : roles.map(role => (
          <div key={role.id} className="group bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative space-y-5">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-lg ${role.is_admin ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                  <Shield size={24} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2 py-0.5 bg-surface border border-border/50 rounded text-[10px] font-mono text-muted-foreground">
                    {role.role_code}
                  </span>
                  {role.is_admin && (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{role.role_name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                  <Landmark size={14} />
                  <span>{role.dept_name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Min Limit</p>
                  <p className="text-sm font-semibold">{formatCurrency(role.approval_limit_min)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Max Limit</p>
                  <p className="text-sm font-semibold">{formatCurrency(role.approval_limit_max)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {role.can_initiate && <CapabilityBadge label="Initiate" />}
                {role.can_review && <CapabilityBadge label="Review" />}
                {role.can_recommend && <CapabilityBadge label="Recommend" />}
                {role.can_approve && <CapabilityBadge label="Approve" />}
                {role.can_override && <CapabilityBadge label="Override" />}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>{role.permissions.length} Permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-surface rounded-md text-muted-foreground hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-surface rounded-md text-muted-foreground hover:text-primary transition-colors">
                    <Settings2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CapabilityBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded text-[10px] font-medium">
      {label}
    </span>
  );
}
