import { getSession } from '@/lib/auth';
import { AlertCircle } from 'lucide-react';
import { CreateMemoForm } from './create-memo-form';

export const metadata = { title: 'Create Memo — CreditAppraise' };

export default async function CreateMemoPage() {
  const session = await getSession();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">New Credit Memo</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Create a formalized credit recommendation.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Draft</span>
        </div>
      </div>

      <CreateMemoForm />
    </div>
  );
}
