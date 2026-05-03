'use client';

import { KPITile } from '@/components/ui/kpi-tile';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Clock, CheckCircle, AlertTriangle, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function UserDashboard({ 
  session,
  stats, 
  myCases,
  actionRequired 
}: { 
  session: any,
  stats: any, 
  myCases: any[],
  actionRequired: any[]
}) {
  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile title="My Total Cases" value={stats.totalCases} icon={<Briefcase className="h-4 w-4" />} trend={2} trendLabel="this week" />
        <KPITile title="Pending My Action" value={stats.pendingAction} icon={<AlertTriangle className="h-4 w-4" />} accentColor="text-red-500" />
        <KPITile title="In Progress" value={stats.inProgress} icon={<Clock className="h-4 w-4" />} accentColor="text-amber-600" />
        <KPITile title="Approved" value={stats.approved} icon={<CheckCircle className="h-4 w-4" />} accentColor="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Action Required Queue */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-red-100 bg-red-50/30 flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Action Required
            </h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              {actionRequired.length} Items
            </span>
          </div>
          <div className="flex-1 p-0 overflow-y-auto">
            {actionRequired.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-200 mb-3" />
                <p className="font-medium">You're all caught up!</p>
                <p className="text-sm mt-1">No cases require your immediate action.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {actionRequired.map((item) => (
                  <Link href={`/appraisal/${item.id}`} key={item.id} className="p-5 flex gap-4 hover:bg-slate-50 transition-colors group block">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold border border-red-100">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-slate-900">{item.borrower_name}</p>
                        <p className="text-xs font-mono text-slate-500">{item.proposal_number}</p>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">Requires your {item.status.split('_')[1] || 'review'}</p>
                      <div className="flex items-center text-xs font-bold text-primary group-hover:text-primary-dark">
                        Review Now <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Recent Cases */}
        <div className="xl:col-span-2 flex flex-col h-[400px]">
          <div className="cms-table-container flex-1">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold font-display text-slate-800">My Recent Cases</h2>
              <Link href="/appraisal/all" className="text-sm font-bold text-primary hover:underline">View All</Link>
            </div>
            <table className="cms-table">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Case ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Facility Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myCases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">You haven't initiated any cases recently.</td>
                  </tr>
                ) : (
                  myCases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{p.proposal_number}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{p.borrower_name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">NPR {(p.amount).toLocaleString()}</td>
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">{new Date(p.created_at).toLocaleDateString('en-NP')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
