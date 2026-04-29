import { getSession } from '@/lib/auth';
import { Settings, Save, AlertCircle } from 'lucide-react';

export const metadata = { title: 'Policy Settings — CreditAppraise' };

export default async function PolicyPage() {
  const session = await getSession();

  const policies = [
    { key: 'max_ltv_ordinary', label: 'Max LTV — Ordinary Shares', value: '65', unit: '%', description: 'Maximum loan-to-value ratio for ordinary listed shares.' },
    { key: 'max_ltv_promoter', label: 'Max LTV — Promoter Shares', value: '50', unit: '%', description: 'Maximum LTV for promoter/locked-in shares.' },
    { key: 'single_borrower_limit', label: 'Single Borrower Limit', value: '10', unit: '% of capital', description: 'Max exposure to a single borrower as % of core capital.' },
    { key: 'total_ml_cap', label: 'Total ML Portfolio Cap', value: '25', unit: '% of capital', description: 'Maximum margin lending portfolio as % of core capital.' },
    { key: 'min_collateral_coverage', label: 'Min Collateral Coverage', value: '130', unit: '%', description: 'Minimum collateral coverage required for credit memos.' },
    { key: 'margin_call_trigger', label: 'Margin Call Trigger', value: '120', unit: '%', description: 'Coverage ratio below which a margin call is triggered.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Policy Settings</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">NRB Unified Directive 2081 — Margin Lending Limits</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Admin Only</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {policies.map((p) => (
            <div key={p.key} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{p.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={p.value}
                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-right text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <span className="text-xs font-bold text-slate-400 w-20">{p.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-md shadow-indigo-200">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
