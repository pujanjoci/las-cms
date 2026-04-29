import { supabase } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { Building2, Phone, Mail, MapPin, Briefcase, FileText, CheckCircle, AlertTriangle, Plus, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Borrower, Proposal, Facility } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: borrower } = await supabase.from('borrowers').select('name').eq('id', id).single();
  return { title: borrower ? borrower.name : 'Borrower Profile' };
}

export default async function BorrowerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    redirect('/dashboard');
  }

  const [{ data: borrower }, { data: proposals }, { data: facilities }] = await Promise.all([
    supabase.from('borrowers').select('*').eq('id', id).single(),
    supabase.from('proposals').select('*').eq('borrower_id', id).order('updated_at', { ascending: false }),
    supabase.from('facilities').select('*').eq('borrower_id', id).order('created_at', { ascending: false })
  ]);
  
  if (!borrower) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">{borrower.name}</h1>
          <p className="text-sm text-text-secondary mt-1">PAN: <span className="font-mono">{borrower.pan_number}</span></p>
        </div>
        <div className="flex gap-3">
          <Link href={`/borrowers/${id}/edit`} className="bg-white border border-border text-primary hover:bg-surface px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Edit Details
          </Link>
          <Link href={`/proposals/new?borrower_id=${id}`} className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Proposal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-gradient-to-br from-surface to-white">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-primary">{borrower.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="capitalize text-sm text-text-secondary bg-surface-raised px-2 py-1 rounded-md border border-border">
                  {borrower.type.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                  borrower.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  borrower.status === 'inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                  borrower.status === 'blacklisted' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {borrower.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-text-muted mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">Address</p>
                  <p className="text-sm text-text-secondary">{borrower.address}, {borrower.district}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-text-muted mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">Contact</p>
                  <p className="text-sm text-text-secondary">{borrower.phone}</p>
                  {borrower.email && <p className="text-sm text-text-secondary">{borrower.email}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-text-muted mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">Business Profile</p>
                  <p className="text-sm text-text-secondary">Sector: {borrower.sector}</p>
                  {borrower.annual_turnover && <p className="text-sm text-text-secondary">Turnover: NPR {(borrower.annual_turnover).toLocaleString()}</p>}
                  {borrower.years_in_business && <p className="text-sm text-text-secondary">Experience: {borrower.years_in_business} years</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden p-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Risk Profile</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-secondary">NRB Classification</span>
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Pass
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-secondary">Internal Rating</span>
                <span className="text-sm font-medium text-primary">B+</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-secondary">Group Exposure</span>
                <span className="text-sm font-medium text-primary">NPR 0.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Facilities */}
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface/30">
              <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" /> Active Facilities
              </h2>
            </div>
            <div className="p-0">
              {(!facilities || facilities.length === 0) ? (
                <div className="p-8 text-center text-text-muted">
                  <p>No active credit facilities found.</p>
                </div>
              ) : (
                <table className="cms-table">
                  <thead>
                    <tr>
                      <th>Facility Type</th>
                      <th>Limit</th>
                      <th>Interest Rate</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(facilities as Facility[]).map((f) => (
                      <tr key={f.id}>
                        <td className="capitalize font-medium">{f.facility_type.replace('_', ' ')}</td>
                        <td>{f.currency} {(f.amount).toLocaleString()}</td>
                        <td>{f.interest_rate}%</td>
                        <td className="text-text-muted">{f.expiry_date ? new Date(f.expiry_date).toLocaleDateString() : 'Revolving'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Proposals History */}
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface/30">
              <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" /> Proposals History
              </h2>
            </div>
            <div className="p-0">
              {(!proposals || proposals.length === 0) ? (
                <div className="p-8 text-center text-text-muted">
                  <p>No proposals found for this borrower.</p>
                </div>
              ) : (
                <table className="cms-table">
                  <thead>
                    <tr>
                      <th>Ref Number</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(proposals as Proposal[]).map((p) => (
                      <tr key={p.id}>
                        <td className="font-medium text-primary hover:text-accent cursor-pointer">
                          <Link href={`/proposals/${p.id}`}>{p.proposal_number}</Link>
                        </td>
                        <td className="capitalize text-sm">{p.proposal_type}</td>
                        <td className="text-sm">{p.currency} {(p.amount).toLocaleString()}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td className="text-text-muted text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
