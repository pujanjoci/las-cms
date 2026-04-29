import { getSession } from '@/lib/auth';
import { GitPullRequest, ArrowRight, Users } from 'lucide-react';

export const metadata = { title: 'Approval Chain — CreditAppraise' };

export default async function WorkflowPage() {
  const session = await getSession();

  const stages = [
    { id: 1, name: 'Initiator', role: 'staff / senior_staff', description: 'Creates and submits appraisal case with collateral breakdown.', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 2, name: 'Supporter', role: 'senior_staff / super_staff', description: 'Reviews financials and validates collateral eligibility.', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { id: 3, name: 'Reviewer', role: 'admin', description: 'Conducts risk assessment and prepares credit memo.', color: 'bg-violet-50 text-violet-600 border-violet-200' },
    { id: 4, name: 'Approver', role: 'super_admin', description: 'Final approval authority. Can approve, return, or reject.', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Approval Chain</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Multi-stage workflow for credit appraisal cases.</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex items-start gap-4">
            {/* Connector */}
            <div className="flex flex-col items-center pt-1">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${stage.color}`}>
                {stage.id}
              </div>
              {idx < stages.length - 1 && (
                <div className="w-0.5 h-12 bg-slate-200 mt-1"></div>
              )}
            </div>

            {/* Card */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{stage.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{stage.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 font-mono">{stage.role}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 text-center">
        <p className="text-sm text-slate-600 font-medium">
          Workflow configuration is read-only. Contact <span className="font-bold text-primary">Super Admin</span> to modify the approval chain.
        </p>
      </div>
    </div>
  );
}
