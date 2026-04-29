'use client';

import { useActionState } from 'react';
import { createBorrower } from '@/app/actions/borrower';
import { NEPAL_SECTORS } from '@/lib/types';
import { Save } from 'lucide-react';
import Link from 'next/link';

export function BorrowerForm() {
  const [state, formAction, isPending] = useActionState(createBorrower, { message: '', errors: {} });

  return (
    <form action={formAction} className="space-y-8 max-w-4xl">
      {state.message && (
        <div className="p-4 bg-rejected-bg border border-rejected/20 rounded-lg">
          <p className="text-sm font-medium text-rejected">{state.message}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-4 font-display border-b border-border pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Borrower Name <span className="text-rejected">*</span></label>
            <input type="text" name="name" className={`cms-input ${state.errors?.name ? 'error' : ''}`} placeholder="Full legal name" />
            {state.errors?.name && <p className="text-xs text-rejected mt-1">{state.errors.name[0]}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Borrower Type <span className="text-rejected">*</span></label>
            <select name="type" className={`cms-input ${state.errors?.type ? 'error' : ''}`}>
              <option value="">Select type...</option>
              <option value="individual">Individual</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="private_limited">Private Limited</option>
              <option value="public_limited">Public Limited</option>
              <option value="cooperative">Cooperative</option>
              <option value="ngo">NGO</option>
            </select>
            {state.errors?.type && <p className="text-xs text-rejected mt-1">{state.errors.type[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">PAN Number <span className="text-rejected">*</span></label>
            <input type="text" name="pan_number" className={`cms-input font-mono ${state.errors?.pan_number ? 'error' : ''}`} placeholder="9-digit PAN" />
            {state.errors?.pan_number && <p className="text-xs text-rejected mt-1">{state.errors.pan_number[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Registration Number</label>
            <input type="text" name="registration_number" className={`cms-input font-mono ${state.errors?.registration_number ? 'error' : ''}`} placeholder="Company Reg. No." />
            {state.errors?.registration_number && <p className="text-xs text-rejected mt-1">{state.errors.registration_number[0]}</p>}
          </div>
        </div>
      </div>

      {/* Contact & Location */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-4 font-display border-b border-border pb-2">Contact & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Primary Phone <span className="text-rejected">*</span></label>
            <input type="text" name="phone" className={`cms-input font-mono ${state.errors?.phone ? 'error' : ''}`} placeholder="10-digit mobile number" />
            {state.errors?.phone && <p className="text-xs text-rejected mt-1">{state.errors.phone[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Email Address</label>
            <input type="email" name="email" className={`cms-input ${state.errors?.email ? 'error' : ''}`} placeholder="email@example.com" />
            {state.errors?.email && <p className="text-xs text-rejected mt-1">{state.errors.email[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Address <span className="text-rejected">*</span></label>
            <input type="text" name="address" className={`cms-input ${state.errors?.address ? 'error' : ''}`} placeholder="Full street address" />
            {state.errors?.address && <p className="text-xs text-rejected mt-1">{state.errors.address[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">District <span className="text-rejected">*</span></label>
            <input type="text" name="district" className={`cms-input ${state.errors?.district ? 'error' : ''}`} placeholder="e.g. Kathmandu" />
            {state.errors?.district && <p className="text-xs text-rejected mt-1">{state.errors.district[0]}</p>}
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-4 font-display border-b border-border pb-2">Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Sector <span className="text-rejected">*</span></label>
            <select name="sector" className={`cms-input ${state.errors?.sector ? 'error' : ''}`}>
              <option value="">Select sector...</option>
              {NEPAL_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {state.errors?.sector && <p className="text-xs text-rejected mt-1">{state.errors.sector[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Sub Sector</label>
            <input type="text" name="sub_sector" className={`cms-input ${state.errors?.sub_sector ? 'error' : ''}`} placeholder="Specific industry sub-sector" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Years in Business</label>
            <input type="number" name="years_in_business" className={`cms-input ${state.errors?.years_in_business ? 'error' : ''}`} placeholder="Years of operation" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Number of Employees</label>
            <input type="number" name="number_of_employees" className={`cms-input ${state.errors?.number_of_employees ? 'error' : ''}`} placeholder="Total staff count" />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-text-primary">Estimated Annual Turnover (NPR)</label>
            <input type="number" name="annual_turnover" className={`cms-input font-mono ${state.errors?.annual_turnover ? 'error' : ''}`} placeholder="e.g. 50000000" />
            <p className="text-xs text-text-muted mt-1">Approximate annual sales revenue</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Saving Borrower...' : 'Save Borrower'}
        </button>
        <Link href="/borrowers" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
