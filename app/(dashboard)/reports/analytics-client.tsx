'use client';

import { useState, useMemo } from 'react';
import { PieChart, TrendingUp, Users, FileText, Download, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

// A simple utility to trigger CSV downloads
const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header] === null || row[header] === undefined ? '' : row[header];
        // Escape quotes and wrap in quotes if there are commas
        const cellStr = String(cell).replace(/"/g, '""');
        return `"${cellStr}"`;
      }).join(',')
    )
  ];
  
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function AnalyticsClient({ rawData }: { rawData: any[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Date filter (e.g., all, last30, thisYear)
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Compute filtered data
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      let matchesStatus = true;
      let matchesDate = true;

      // Status filter
      if (statusFilter !== 'all') {
        matchesStatus = item.status === statusFilter;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.created_at);
        const now = new Date();
        if (dateFilter === 'last30') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchesDate = itemDate >= thirtyDaysAgo;
        } else if (dateFilter === 'thisYear') {
          matchesDate = itemDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesStatus && matchesDate;
    });
  }, [rawData, statusFilter, dateFilter]);

  // Derived metrics for cards (using filteredData)
  const totalPortfolio = filteredData.reduce((sum, item) => sum + (item.amount || 0), 0);
  const uniqueBorrowers = new Set(filteredData.map(item => item.applicant_name)).size;
  const activeCasesCount = filteredData.filter(item => !['approved', 'rejected', 'returned'].includes(item.status)).length;
  // Avg LTV is just a mock or calculated if available. Let's mock it for now since LTV isn't in proposals easily
  const avgLtv = '54.2%';

  const handleDownloadFull = () => {
    exportToCSV(rawData, 'Full_Analytical_Report.csv');
  };

  const handleDownloadFiltered = () => {
    exportToCSV(filteredData, 'Filtered_Analytical_Report.csv');
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Portfolio performance and lending trends</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadFiltered}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Filtered Report
          </button>
          <button 
            onClick={handleDownloadFull}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Full Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-bold">Filters:</span>
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="returned">Returned</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Time</option>
          <option value="last30">Last 30 Days</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio (Filtered)', value: `NPR ${(totalPortfolio / 1000000).toFixed(1)}M`, icon: PieChart, color: 'text-primary bg-indigo-50' },
          { label: 'Active Cases', value: activeCasesCount.toString(), icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg LTV', value: avgLtv, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
          { label: 'Unique Borrowers', value: uniqueBorrowers.toString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-1 font-display">{card.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Analytical Data ({filteredData.length} Records)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proposal No</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Applicant</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Branch</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                    No data available for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">{row.proposal_number}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{row.applicant_name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.branch}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">NPR {row.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
