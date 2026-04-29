'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteUserAction } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export function DeleteUserButton({ userId, userName }: { userId: number; userName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    const result = await deleteUserAction(userId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      title="Delete User"
    >
      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      Delete
    </button>
  );
}
