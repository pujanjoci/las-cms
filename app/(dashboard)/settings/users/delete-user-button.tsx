'use client';

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteUserAction } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteUserAction(userId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
      setShowConfirm(false);
    } else {
      router.refresh();
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete User</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-slate-700">{userName}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all duration-200"
      title="Delete User"
    >
      <Trash2 className="h-3 w-3" />
      Delete
    </button>
  );
}
