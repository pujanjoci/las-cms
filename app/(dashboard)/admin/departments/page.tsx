import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { DepartmentsView } from './departments-view';

export const metadata = {
  title: 'Departments | LAS CMS',
};

export default async function DepartmentsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (!hasPermission(session, PERMISSIONS.SETTINGS_MANAGE)) {
    redirect('/dashboard');
  }

  return <DepartmentsView session={session} />;
}
