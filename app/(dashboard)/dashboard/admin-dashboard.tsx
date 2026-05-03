'use client';

import { KPITile } from '@/components/ui/kpi-tile';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Users, Clock, CheckCircle, TrendingUp, PieChart, Activity } from 'lucide-react';
import Link from 'next/link';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AdminDashboard({ 
  stats, 
  recentCases, 
  recentLogs, 
  portfolioData 
}: { 
  stats: any, 
  recentCases: any[], 
  recentLogs: any[],
  portfolioData: any[] 
}) {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Metric Cards (6 Across) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPITile title="Total Cases" value={stats.totalCases} icon={<Users className="h-4 w-4" />} trend={5} trendLabel="this month" />
        <KPITile title="Pending" value={stats.pending} icon={<Clock className="h-4 w-4" />} accentColor="text-amber-600" />
        <KPITile title="Approved" value={stats.approved} icon={<CheckCircle className="h-4 w-4" />} accentColor="text-emerald-600" />
        <KPITile title="Avg LTV %" value={`${stats.avgLtv}%`} icon={<TrendingUp className="h-4 w-4" />} accentColor={stats.avgLtv > 60 ? 'text-red-500' : 'text-emerald-600'} />
        <KPITile title="Pending Memos" value={stats.pendingMemos} icon={<FileText className="h-4 w-4" />} accentColor="text-indigo-600" />
        <KPITile title="Portfolio" value={`NPR ${(stats.portfolio / 1000000).toFixed(1)}M`} icon={<PieChart className="h-4 w-4" />} accentColor="text-primary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Portfolio Visualization */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-6 h-80">
          <h2 className="text-lg font-bold font-display text-slate-800 mb-4">Portfolio by Status</h2>
          {portfolioData.length > 0 ? (
            <div className="flex-1 w-full h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `NPR ${(value/1000000).toFixed(1)}M`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">No portfolio data available</div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-80">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              System Activity Feed
            </h2>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {recentLogs.length === 0 ? (
              <div className="text-center text-slate-400 font-medium py-4">No recent activity</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-bold shadow-inner">
                    {log.users?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-tight">
                      <span className="font-bold text-slate-900">{log.users?.full_name || 'System'}</span> 
                      {' '}{log.action} <span className="font-mono text-indigo-600 font-bold">{log.entity_type} #{log.entity_id}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      {new Date(log.created_at).toLocaleString('en-NP')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Cases Table */}
      <div className="cms-table-container">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold font-display text-slate-800">Recent Cases</h2>
          <Link href="/appraisal/all" className="text-sm font-bold text-primary hover:underline">View Directory</Link>
        </div>
        <table className="cms-table">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Facility Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">LTV %</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">No recent appraisal cases found.</td>
                </tr>
              ) : (
                recentCases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{p.proposal_number}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{p.borrower_name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">NPR {(p.amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-emerald-600">62.5%</span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{new Date(p.created_at).toLocaleDateString('en-NP')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}
