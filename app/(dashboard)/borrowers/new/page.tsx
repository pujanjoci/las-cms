import { BorrowerForm } from '@/components/forms/borrower-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { redirect } from 'next/navigation';

export const metadata = { title: 'New Borrower' };

export default async function NewBorrowerPage() {
  const session = await getSession();
  if (!session || !hasPermission(session, PERMISSIONS.BORROWER_CREATE)) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/borrowers" className="p-2 hover:bg-surface-raised rounded-full transition-colors text-text-secondary hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">New Borrower</h1>
          <p className="text-sm text-text-secondary mt-1">Create a new borrower profile in the system</p>
        </div>
      </div>
      
      <BorrowerForm />
    </div>
  );
}
