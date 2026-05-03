import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import Link from 'next/link';
import { Building2, Plus, Search } from 'lucide-react';
import type { Borrower } from '@/lib/types';

export const metadata = {
  title: 'Borrowers',
};

export default async function BorrowersPage() {
  const session = await getSession();
  const canCreate = session ? hasPermission(session, PERMISSIONS.BORROWER_CREATE) : false;
  
  const { data: borrowers } = await supabase
    .from('borrowers')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Borrowers</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage corporate and retail borrowing entities.</p>
        </div>
        {canCreate && (
          <Link href="/borrowers/new" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 ring-1 ring-primary/20">
            <Plus className="h-4 w-4" />
            Add Borrower
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, PAN, or sector..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select className="flex-1 md:flex-none border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer">
              <option value="">All Types</option>
              <option value="private_limited">Private Limited</option>
              <option value="public_limited">Public Limited</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="individual">Individual</option>
            </select>
            <select className="flex-1 md:flex-none border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer">
              <option value="">All Sectors</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Trade">Trade & Commerce</option>
              <option value="Tourism">Tourism</option>
            </select>
          </div>
        </div>
        
        <div className="cms-table-container">
          <table className="cms-table">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Borrower Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">PAN Number</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {(!borrowers || borrowers.length === 0) ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-10 w-10 mb-3 text-slate-200" />
                      <p>No borrowers found.</p>
                      {canCreate && (
                        <Link href="/borrowers/new" className="text-primary hover:underline mt-2 font-bold text-sm">
                          Create the first borrower
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                borrowers.map((b) => (
                  <tr key={b.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => undefined}>
                    <td className="px-6 py-4">
                      <Link href={`/borrowers/${b.id}`} className="text-sm font-bold text-slate-800 hover:text-primary transition-colors">
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 capitalize">{b.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{b.pan_number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{b.sector}</td>
                    <td className="px-6 py-4">
                      <span className={`status-badge text-[10px] ${
                        b.status === 'active' ? 'status-approved' :
                        b.status === 'inactive' ? 'status-draft' :
                        b.status === 'blacklisted' ? 'status-rejected' :
                        'status-pending'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{new Date(b.updated_at).toLocaleDateString('en-NP')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 bg-slate-50/50">
          <p>Showing {borrowers?.length || 0} borrowers</p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" disabled>Previous</button>
            <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
