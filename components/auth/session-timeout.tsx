'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { AlertCircle, LogOut, Clock, ShieldAlert } from 'lucide-react';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 5 * 60 * 1000; // 5 minutes before timeout
const STORAGE_KEY = 'lastActivity';

export function SessionTimeout() {
  const [remaining, setRemaining] = useState<number>(TIMEOUT_MS);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await logoutAction();
  }, []);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    setRemaining(TIMEOUT_MS);
    setShowWarning(false);
  }, []);

  useEffect(() => {
    // Initial activity set
    if (!localStorage.getItem(STORAGE_KEY)) {
      resetTimer();
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, activityHandler);
    });

    const interval = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || Date.now().toString());
      const now = Date.now();
      const elapsed = now - lastActivity;
      const timeLeft = Math.max(0, TIMEOUT_MS - elapsed);

      setRemaining(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        handleLogout();
      } else if (timeLeft <= WARNING_MS) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    // Sync across tabs
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRemaining(TIMEOUT_MS);
        setShowWarning(false);
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      window.removeEventListener('storage', storageHandler);
      clearInterval(interval);
    };
  }, [resetTimer, handleLogout]);

  if (!showWarning) return null;

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-1 bg-amber-500"></div>
        
        <div className="p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-amber-600" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 text-center">Session Timeout</h3>
          <p className="text-slate-500 text-center mt-2 leading-relaxed">
            Your session is about to expire due to inactivity. You will be logged out in:
          </p>
          
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-mono text-2xl font-bold">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout Now</span>
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Clock className="h-4 w-4" />
              <span>Stay Signed In</span>
            </button>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-3 w-3 text-slate-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Security Policy Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
