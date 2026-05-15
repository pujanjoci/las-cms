'use server';

import { supabase } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Fetch unread notifications for the logged-in user
 */
export async function getUnreadNotifications() {
  const session = await getSession();
  if (!session) return { success: false, data: [] };

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    // Check if user is muted
    const { data: userData } = await supabase
      .from('users')
      .select('notifications_muted')
      .eq('id', session.id)
      .single();

    return { 
      success: true, 
      data, 
      isMuted: userData?.notifications_muted || false 
    };
  } catch (error: any) {
    console.error('getUnreadNotifications error:', error);
    return { success: false, data: [] };
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await getSession();
  if (!session) return { success: false };

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', session.id);
      
    return { success: true };
  } catch (error) {
    console.error('markNotificationAsRead error:', error);
    return { success: false };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const session = await getSession();
  if (!session) return { success: false };

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.id)
      .eq('is_read', false);
      
    return { success: true };
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return { success: false };
  }
}

/**
 * Toggle mute notifications setting
 */
export async function toggleMuteNotifications(isMuted: boolean) {
  const session = await getSession();
  if (!session) return { success: false };

  try {
    await supabase
      .from('users')
      .update({ notifications_muted: isMuted })
      .eq('id', session.id);
      
    return { success: true };
  } catch (error) {
    console.error('toggleMuteNotifications error:', error);
    return { success: false };
  }
}

/**
 * INTERNAL HELPER: Dispatch a notification to admins and a specific role
 */
export async function dispatchNotification({
  title,
  message,
  type,
  linkUrl,
  targetRoleCodes = []
}: {
  title: string;
  message: string;
  type: string;
  linkUrl: string;
  targetRoleCodes?: string[];
}) {
  try {
    // We always notify admins and super_admins
    const rolesToNotify = Array.from(new Set(['admin', 'super_admin', ...targetRoleCodes]));

    // Fetch users with these roles
    const { data: users, error } = await supabase
      .from('user_roles')
      .select('user_id, roles!inner(role_code)')
      .in('roles.role_code', rolesToNotify);

    if (error || !users) {
      console.error('Failed to fetch users for notification:', error);
      return;
    }

    // Deduplicate user IDs (a user might have multiple matching roles)
    const uniqueUserIds = Array.from(new Set(users.map((u: any) => u.user_id)));

    if (uniqueUserIds.length === 0) return;

    // Create notification rows
    const notifications = uniqueUserIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      link_url: linkUrl,
      is_read: false
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('dispatchNotification error:', error);
  }
}
