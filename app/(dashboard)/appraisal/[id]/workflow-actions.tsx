'use client';

import { useState } from 'react';
import { advanceAppraisalWorkflow } from '@/app/actions/appraisal';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkflowActionsProps {
  appraisalId: string;
  status: string;
}

export function AppraisalWorkflowActions({ appraisalId, status }: WorkflowActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showRemarks, setShowRemarks] = useState(false);
  const router = useRouter();

  if (status === 'approved' || status === 'rejected' || status === 'returned') {
    return null; // Terminal states
  }

  const handleAdvance = async () => {
    setIsLoading(true);
    const result = await advanceAppraisalWorkflow(appraisalId, status, remarks);
    setIsLoading(false);
    
    if (result.success) {
      setRemarks('');
      setShowRemarks(false);
      router.refresh();
    } else {
      alert(result.error || 'Failed to advance workflow');
    }
  };

  let buttonText = 'Advance Workflow';
  let actionLabel = 'Advancing Case';
  switch (status) {
    case 'draft':
      buttonText = 'Submit for Support';
      actionLabel = 'Submit for Support';
      break;
    case 'pending_supporter':
      buttonText = 'Support & Forward';
      actionLabel = 'Support & Forward to Reviewer';
      break;
    case 'pending_reviewer':
      buttonText = 'Review & Forward';
      actionLabel = 'Review & Forward to Approver';
      break;
    case 'pending_approver':
      buttonText = 'Final Approve';
      actionLabel = 'Approve Appraisal';
      break;
  }

  if (!showRemarks) {
    return (
      <button
        onClick={() => setShowRemarks(true)}
        className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <ArrowRight className="h-4 w-4" />
        <span>{buttonText}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{actionLabel}</h3>
          <p className="text-sm text-slate-500 mt-1">Provide any notes or remarks for this action.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm min-h-[100px] resize-none"
            />
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowRemarks(false)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdvance}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>Confirm Action</span>
          </button>
        </div>
      </div>
    </div>
  );
}

