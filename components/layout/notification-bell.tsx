'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, BellOff, ArrowRight } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead, markAllAsRead, toggleMuteNotifications } from '@/app/actions/notifications';
import { useToast } from '@/components/ui/toaster';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const knownIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = async () => {
    const { success, data, isMuted: muted } = await getUnreadNotifications();
    if (success && data) {
      setIsMuted(muted);
      
      // Check for new notifications to toast
      if (!muted) {
        const newlyAdded = data.filter((n: any) => !knownIdsRef.current.has(n.id));
        
        // Don't toast on initial load
        if (knownIdsRef.current.size > 0) {
          newlyAdded.forEach((n: any) => {
            toast({
              title: n.title,
              message: n.message,
              type: n.type,
              linkUrl: n.link_url
            });
          });
        }
        
        // Update known IDs
        data.forEach((n: any) => knownIdsRef.current.add(n.id));
      }

      setNotifications(data);
      setUnreadCount(data.length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []); // Empty dependency array prevents infinite loops

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMuteToggle = async () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    await toggleMuteNotifications(newMuteState);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = async (id: string, url: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setIsOpen(false);
    if (url) {
      router.push(url);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-indigo-600 transition-all rounded-xl hover:bg-slate-50 group"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleMuteToggle}
                className={`p-1.5 rounded-lg transition-colors ${isMuted ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                title={isMuted ? "Unmute alerts" : "Mute alerts"}
              >
                {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </button>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n.id, n.link_url)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="bg-indigo-50 p-2 rounded-full shrink-0 text-indigo-600 mt-1">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">
                        {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <span className="text-xs font-medium text-slate-500">Showing {notifications.length} unread</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
