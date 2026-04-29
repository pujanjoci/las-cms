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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Borrowers</h1>
          <p className="text-sm text-text-secondary mt-1">Manage corporate and retail borrowing entities.</p>
        </div>
        {canCreate && (
          <Link href="/borrowers/new" className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Borrower
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-surface/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search borrowers by name, PAN, or sector..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-border rounded-lg text-sm px-3 py-2 bg-white outline-none focus:border-accent">
              <option value="">All Types</option>
              <option value="private_limited">Private Limited</option>
              <option value="public_limited">Public Limited</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="individual">Individual</option>
            </select>
            <select className="border border-border rounded-lg text-sm px-3 py-2 bg-white outline-none focus:border-accent">
              <option value="">All Sectors</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Trade">Trade & Commerce</option>
              <option value="Tourism">Tourism</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Borrower Name</th>
                <th>Type</th>
                <th>PAN Number</th>
                <th>Sector</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {(!borrowers || borrowers.length === 0) ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-10 w-10 mb-3 text-border" />
                      <p>No borrowers found.</p>
                      {canCreate && (
                        <Link href="/borrowers/new" className="text-accent hover:text-accent-dark mt-2 font-medium text-sm">
                          Create the first borrower
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                borrowers.map((b) => (
                  <tr key={b.id} className="cursor-pointer hover:bg-surface" onClick={() => undefined}>
                    <td className="font-medium text-primary">
                      <Link href={`/borrowers/${b.id}`} className="hover:text-accent transition-colors">
                        {b.name}
                      </Link>
                    </td>
                    <td className="capitalize text-text-secondary">{b.type.replace('_', ' ')}</td>
                    <td className="font-mono text-sm">{b.pan_number}</td>
                    <td className="text-text-secondary">{b.sector}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        b.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        b.status === 'inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                        b.status === 'blacklisted' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-text-muted text-sm">{new Date(b.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-secondary bg-surface/50">
          <p>Showing {borrowers?.length || 0} borrowers</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-white disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-white disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
