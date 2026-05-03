import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { FileText, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { hasRole } from '@/lib/rbac';
import { AdminDashboard } from './admin-dashboard';
import { UserDashboard } from './user-dashboard';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const isAdmin = hasRole(session, 'admin', 'super_admin');

  // Fetch data in parallel
  const [proposalsRes, pendingMemosRes, logsRes] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, amount, status, created_by, proposal_number, created_at, borrowers(name)'),
    supabase
      .from('credit_memos')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending_review', 'under_review']),
    isAdmin ? supabase
      .from('audit_logs')
      .select('*, users(full_name)')
      .order('created_at', { ascending: false })
      .limit(5) : Promise.resolve({ data: [] })
  ]);

  const proposals = proposalsRes.data || [];
  const pendingMemosCount = pendingMemosRes.count || 0;
  const logs = logsRes.data || [];

  // Format proposal items
  const formattedProposals = proposals.map(p => ({
    ...p,
    borrower_name: (p.borrowers as any)?.name || 'Unknown'
  }));

  if (isAdmin) {
    // ADMIN DASHBOARD DATA
    const stats = {
      totalCases: proposals.length,
      pending: proposals.filter(p => p.status === 'draft' || p.status.includes('pending')).length,
      approved: proposals.filter(p => p.status === 'approved').length,
      avgLtv: 62.5, // Mocked until LTV logic is implemented
      pendingMemos: pendingMemosCount || 0,
      portfolio: proposals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    };

    const recentCases = [...formattedProposals]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Group portfolio by status for Pie Chart
    const statusGroups = proposals.reduce((acc: any, curr) => {
      const status = curr.status === 'draft' ? 'Draft' : curr.status === 'approved' ? 'Approved' : 'Pending';
      if (!acc[status]) acc[status] = 0;
      acc[status] += (Number(curr.amount) || 0);
      return acc;
    }, {});

    const portfolioData = Object.keys(statusGroups).map(key => ({
      name: key,
      value: statusGroups[key]
    })).filter(d => d.value > 0);

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">Global Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back, {session.full_name}. Overview across all branches.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/appraisal/new" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 ring-1 ring-primary/20">
              <UserPlus className="h-4 w-4" />
              + New Appraisal
            </Link>
          </div>
        </div>

        <AdminDashboard 
          stats={stats} 
          recentCases={recentCases} 
          recentLogs={logs || []} 
          portfolioData={portfolioData} 
        />
      </div>
    );
  } else {
    // USER DASHBOARD DATA
    const myProposals = formattedProposals.filter(p => p.created_by === session.id);
    
    const stats = {
      totalCases: myProposals.length,
      pendingAction: 2, // Mocked until workflow states are strictly defined
      inProgress: myProposals.filter(p => p.status !== 'approved' && p.status !== 'draft').length,
      approved: myProposals.filter(p => p.status === 'approved').length,
    };

    const myRecentCases = [...myProposals]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Mock Action Required list based on their role
    const actionRequired = formattedProposals
      .filter(p => p.status.includes('pending'))
      .slice(0, 2);

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">My Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back, {session.full_name}. Here are your tasks.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/appraisal/new" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 ring-1 ring-primary/20">
              <UserPlus className="h-4 w-4" />
              + New Appraisal
            </Link>
          </div>
        </div>

        <UserDashboard 
          session={session}
          stats={stats} 
          myCases={myRecentCases} 
          actionRequired={actionRequired}
        />
      </div>
    );
  }
}

