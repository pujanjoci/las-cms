'use client';

import { useActionState, useState } from 'react';
import { Camera } from 'lucide-react';
import { updateAvatarAction } from '@/app/actions/profile';

export function AvatarUpload() {
  const [state, formAction, isPending] = useActionState(updateAvatarAction, null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <form action={formAction} className="absolute bottom-0 right-0">
        <label htmlFor="avatar-upload" className={`h-8 w-8 bg-white text-slate-600 rounded-full shadow border border-slate-200 flex items-center justify-center cursor-pointer transition-colors ${isPending ? 'opacity-50' : 'hover:bg-slate-50 hover:text-primary'}`}>
          <Camera className="h-4 w-4" />
        </label>
        <input 
          type="file" 
          id="avatar-upload" 
          name="avatar" 
          accept="image/*" 
          className="hidden"
          disabled={isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 5 * 1024 * 1024) {
                showToast('Image size must be less than 5MB.');
                e.target.value = ''; // Reset input
                return;
              }
              if(e.target.form) e.target.form.requestSubmit();
            }
          }}
        />
      </form>
      
      {/* Custom Toast Alert */}
      {(toastMessage || state?.error) && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg border border-red-700 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-80" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">{toastMessage || state?.error}</span>
          </div>
        </div>
      )}
    </>
  );
}
