import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { ShieldAlert, Plus, Search, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

export const metadata = { title: 'Eligible Scripts — CreditAppraise' };

export default async function EligibleScriptsPage() {
  const session = await getSession();

  // Try to fetch from DB, fall back to mock data
  const scripts = [
    { symbol: 'NABIL', name: 'Nabil Bank Limited', sector: 'Commercial Bank', price: 620.00, avg120: 580.00, haircut: 50, active: true },
    { symbol: 'NICA', name: 'NIC Asia Bank Limited', sector: 'Commercial Bank', price: 450.00, avg120: 480.00, haircut: 50, active: true },
    { symbol: 'EBL', name: 'Everest Bank Limited', sector: 'Commercial Bank', price: 520.00, avg120: 510.00, haircut: 50, active: true },
    { symbol: 'GBIME', name: 'Global IME Bank Limited', sector: 'Commercial Bank', price: 210.00, avg120: 225.00, haircut: 50, active: true },
    { symbol: 'SBL', name: 'Siddhartha Bank Limited', sector: 'Commercial Bank', price: 195.00, avg120: 205.00, haircut: 50, active: false },
    { symbol: 'NLIC', name: 'Nepal Life Insurance', sector: 'Life Insurance', price: 780.00, avg120: 750.00, haircut: 55, active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Eligible Scripts</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage listed securities eligible for margin lending collateral.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-100">
          <Plus className="h-4 w-4" />
          Add Script
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by symbol or company name..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Symbol</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">LTP (NPR)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">120d Avg</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Haircut</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {scripts.map((s) => (
                <tr key={s.symbol} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{s.symbol}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{s.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">{s.sector}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">{s.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 text-right">{s.avg120.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold">{s.haircut}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {s.active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600"><ToggleRight className="h-5 w-5" /></span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-300"><ToggleLeft className="h-5 w-5" /></span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-white">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
