'use client';

import { useTransition, useState } from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, CheckCircle, XCircle, Eye, Loader2, X, Trash2 } from 'lucide-react';
import { updateMemoStatusAction, deleteMemoAction } from '@/app/actions/memo';

export function MemoReviewClient({ memos, isApprover, currentUserId }: { memos: any[], isApprover: boolean, currentUserId: number }) {
  const [isPending, startTransition] = useTransition();
  const [selectedMemo, setSelectedMemo] = useState<any | null>(null);
  const [memoToDelete, setMemoToDelete] = useState<string | null>(null);

  const handleStatusUpdate = (id: string, newStatus: string) => {
    startTransition(async () => {
      await updateMemoStatusAction(id, newStatus);
    });
  };

  const confirmDelete = () => {
    if (!memoToDelete) return;
    startTransition(async () => {
      await deleteMemoAction(memoToDelete);
      setMemoToDelete(null);
    });
  };

  const gradeColor = (g: string) => {
    switch (g) {
      case 'A': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'C': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-red-600 bg-red-50 border-red-100';
    }
  };

  if (memos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">No pending credit memos in your review queue right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memos.map((memo) => (
        <div key={memo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-indigo-600 font-bold">{memo.ref}</span>
                    <StatusBadge status={memo.status} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-1">{memo.applicant}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    NPR {memo.amount.toLocaleString()} · Coverage: {memo.coverage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${gradeColor(memo.grade)}`}>
                  Grade {memo.grade}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedMemo(memo)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  {memo.created_by === currentUserId && (
                    <button 
                      onClick={() => setMemoToDelete(memo.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      {isPending && memoToDelete === memo.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
                    </button>
                  )}
                  {isApprover && memo.status === 'pending_review' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(memo.id, 'approved')}
                        disabled={isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(memo.id, 'rejected')}
                        disabled={isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Return
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* View Memo Modal */}
      {selectedMemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100/50">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-display font-bold text-slate-800">{selectedMemo.ref}</h2>
                    <StatusBadge status={selectedMemo.status} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-1">Submitted on {new Date(selectedMemo.date).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMemo(null)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Grid 1: Applicant & Facility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Applicant Details</h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Name</p>
                      <p className="text-sm font-bold text-slate-800">{selectedMemo.applicant}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">CIF</p>
                        <p className="text-sm font-mono font-medium text-slate-700">{selectedMemo.cif}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Branch</p>
                        <p className="text-sm font-medium text-slate-700">{selectedMemo.branch}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facility Overview</h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Proposed Amount</p>
                      <p className="text-lg font-bold text-emerald-600">NPR {selectedMemo.amount.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Existing Exposure</p>
                        <p className="text-sm font-medium text-slate-700">NPR {selectedMemo.exposure.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Risk Grade</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mt-0.5 ${gradeColor(selectedMemo.grade)}`}>
                          {selectedMemo.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  Credit Narrative
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200">
                    Coverage: {selectedMemo.coverage}%
                  </span>
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedMemo.narrative}
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
              <button 
                onClick={() => setSelectedMemo(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              
              {isApprover && selectedMemo.status === 'pending_review' && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedMemo.id, 'rejected');
                      setSelectedMemo(null);
                    }}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Return
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedMemo.id, 'approved');
                      setSelectedMemo(null);
                    }}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve Memo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {memoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Delete Credit Memo?</h3>
                  <p className="text-sm text-slate-500 mt-1">This action cannot be undone. This memo will be permanently removed from the system.</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setMemoToDelete(null)}
                disabled={isPending}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Yes, Delete Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
