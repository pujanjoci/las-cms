import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { SidebarProvider } from '@/components/layout/sidebar-context';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex overflow-hidden bg-surface">
        <Sidebar user={session} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar user={session} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
