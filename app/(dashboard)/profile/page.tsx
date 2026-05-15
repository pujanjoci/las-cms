import { requireAuth } from '@/lib/auth';
import { AvatarUpload } from './avatar-upload';
import { ChangePasswordForm } from './change-password-form';
import { Camera, Save, Key, User as UserIcon, Mail, Briefcase, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'My Profile | CMS',
};

export default async function ProfilePage() {
  const session = await requireAuth();
  
  const roleLabel = session.roles[0]?.replace('_', ' ')?.toUpperCase() || 'USER';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your personal information and security settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden relative group">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="px-6 pb-6 relative">
              <div className="relative -mt-12 mb-4 inline-block">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 shadow-md flex items-center justify-center overflow-hidden">
                  {session.avatar_url ? (
                    <img src={session.avatar_url} alt={session.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-400">{session.full_name.charAt(0)}</span>
                  )}
                </div>
                
                {/* Avatar Upload Form inside the avatar circle */}
                <AvatarUpload />
              </div>
              
              <h2 className="text-xl font-bold text-slate-800">{session.full_name}</h2>
              <p className="text-slate-500 text-sm">{session.email}</p>
              
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200/50">
                <Shield className="h-3 w-3" />
                {roleLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Security */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <UserIcon className="h-5 w-5 text-primary" />
              Account Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="text-slate-800 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{session.full_name}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="text-slate-800 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {session.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employee Code</label>
                <div className="text-slate-800 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  {session.username}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Contact your system administrator to update these details.
            </p>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-amber-500" />
              Change Password
            </h3>
            
            <ChangePasswordForm />
          </div>

        </div>
      </div>
    </div>
  );
}
