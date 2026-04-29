'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Send, User, Calculator, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createMemoAction } from '@/app/actions/memo';

export function CreateMemoForm() {
  const [state, formAction, isPending] = useActionState(createMemoAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 space-y-8">
        
        {state?.error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {state.error}
          </div>
        )}

        {/* Applicant Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Applicant Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Applicant Name</label>
              <input type="text" name="applicant_name" required placeholder="Full legal name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CIF Number</label>
              <input type="text" name="applicant_cif" required placeholder="Customer ID" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Branch</label>
              <select name="branch" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20">
                <option value="Kathmandu Main Branch">Kathmandu Main Branch</option>
                <option value="Lalitpur Branch">Lalitpur Branch</option>
                <option value="Bhaktapur Branch">Bhaktapur Branch</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Linked Case (Optional)</label>
              <input type="text" placeholder="LAS-2081-XXXX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono font-bold" />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Facility Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" /> Facility & Risk
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proposed Amount (NPR)</label>
              <input type="number" name="proposed_amount" step="0.01" required placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Grade</label>
              <select name="risk_grade" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20">
                <option value="A">A — Low Risk</option>
                <option value="B">B — Moderate</option>
                <option value="C">C — Acceptable</option>
                <option value="D">D — Watch</option>
                <option value="E">E — High Risk</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collateral Coverage %</label>
              <input type="number" name="collateral_coverage_pct" step="0.01" required placeholder="130" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold" />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Narrative */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Credit Narrative
          </h3>
          <textarea 
            name="narrative"
            required
            rows={8} 
            placeholder="Provide a comprehensive credit assessment narrative including background, financial analysis, collateral assessment, and your recommendation..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm leading-relaxed resize-none"
          ></textarea>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
          Cancel
        </Link>
        <div className="flex gap-3">
          <button 
            type="submit" 
            name="action_type" 
            value="draft"
            disabled={isPending}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            type="submit"
            name="action_type"
            value="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for Review
          </button>
        </div>
      </div>
    </form>
  );
}
