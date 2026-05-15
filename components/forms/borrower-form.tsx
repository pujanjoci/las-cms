'use client';

import { useState, useTransition } from 'react';
import { createBorrower } from '@/app/actions/borrower';
import { NEPAL_SECTORS } from '@/lib/types';
import { Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

const INITIAL_FORM = {
  name: '',
  type: '',
  pan_number: '',
  registration_number: '',
  phone: '',
  email: '',
  address: '',
  district: '',
  sector: '',
  sub_sector: '',
  years_in_business: '',
  number_of_employees: '',
  annual_turnover: '',
};

export function BorrowerForm() {
  const [fields, setFields] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const set = (name: string, value: string) => {
    setFields(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrors({});

    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));

    startTransition(async () => {
      // createBorrower redirects on success (never returns), so if we get
      // a result back it means validation or DB error occurred.
      const result = await createBorrower({ message: '', errors: {} }, formData);
      if (result) {
        setErrors(result.errors || {});
        setMessage(result.message || '');
        // Form data is preserved — fields state is NOT cleared
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {message && (
        <div className="p-4 bg-rejected-bg border border-rejected/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-rejected">{message}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-4 font-display border-b border-border pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Borrower Name <span className="text-rejected">*</span></label>
            <input
              type="text"
              value={fields.name}
              onChange={e => set('name', e.target.value)}
              className={`cms-input ${errors.name ? 'error' : ''}`}
              placeholder="Full legal name"
            />
            {errors.name && <p className="text-xs text-rejected mt-1">{errors.name[0]}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Borrower Type <span className="text-rejected">*</span></label>
            <select
              value={fields.type}
              onChange={e => set('type', e.target.value)}
              className={`cms-input ${errors.type ? 'error' : ''}`}
            >
              <option value="">Select type...</option>
              <option value="individual">Individual</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="private_limited">Private Limited</option>
              <option value="public_limited">Public Limited</option>
              <option value="cooperative">Cooperative</option>
              <option value="ngo">NGO</option>
            </select>
            {errors.type && <p className="text-xs text-rejected mt-1">{errors.type[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">PAN Number <span className="text-rejected">*</span></label>
            <input
              type="text"
              value={fields.pan_number}
              onChange={e => set('pan_number', e.target.value)}
              className={`cms-input font-mono ${errors.pan_number ? 'error' : ''}`}
              placeholder="9-digit PAN"
            />
            {errors.pan_number && <p className="text-xs text-rejected mt-1">{errors.pan_number[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Registration Number</label>
            <input
              type="text"
              value={fields.registration_number}
              onChange={e => set('registration_number', e.target.value)}
              className={`cms-input font-mono ${errors.registration_number ? 'error' : ''}`}
              placeholder="Company Reg. No."
            />
            {errors.registration_number && <p className="text-xs text-rejected mt-1">{errors.registration_number[0]}</p>}
          </div>
        </div>
      </div>

      {/* Contact & Location */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-4 font-display border-b border-border pb-2">Contact & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Primary Phone <span className="text-rejected">*</span></label>
            <input
              type="text"
              value={fields.phone}
              onChange={e => set('phone', e.target.value)}
              className={`cms-input font-mono ${errors.phone ? 'error' : ''}`}
              placeholder="10-digit mobile number"
            />
            {errors.phone && <p className="text-xs text-rejected mt-1">{errors.phone[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Email Address</label>
            <input
              type="email"
              value={fields.email}
              onChange={e => set('email', e.target.value)}
              className={`cms-input ${errors.email ? 'error' : ''}`}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-xs text-rejected mt-1">{errors.email[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Address <span className="text-rejected">*</span></label>
            <input
              type="text"
              value={fields.address}
              onChange={e => set('address', e.target.value)}
              className={`cms-input ${errors.address ? 'error' : ''}`}
              placeholder="Full street address"
            />
            {errors.address && <p className="text-xs text-rejected mt-1">{errors.address[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">District <span className="text-rejected">*</span></label>
            <input
              type="text"
              value={fields.district}
              onChange={e => set('district', e.target.value)}
              className={`cms-input ${errors.district ? 'error' : ''}`}
              placeholder="e.g. Kathmandu"
            />
            {errors.district && <p className="text-xs text-rejected mt-1">{errors.district[0]}</p>}
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-4 font-display border-b border-border pb-2">Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Sector <span className="text-rejected">*</span></label>
            <select
              value={fields.sector}
              onChange={e => set('sector', e.target.value)}
              className={`cms-input ${errors.sector ? 'error' : ''}`}
            >
              <option value="">Select sector...</option>
              {NEPAL_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.sector && <p className="text-xs text-rejected mt-1">{errors.sector[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Sub Sector</label>
            <input
              type="text"
              value={fields.sub_sector}
              onChange={e => set('sub_sector', e.target.value)}
              className={`cms-input ${errors.sub_sector ? 'error' : ''}`}
              placeholder="Specific industry sub-sector"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Years in Business</label>
            <input
              type="number"
              value={fields.years_in_business}
              onChange={e => set('years_in_business', e.target.value)}
              className={`cms-input ${errors.years_in_business ? 'error' : ''}`}
              placeholder="Years of operation"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Number of Employees</label>
            <input
              type="number"
              value={fields.number_of_employees}
              onChange={e => set('number_of_employees', e.target.value)}
              className={`cms-input ${errors.number_of_employees ? 'error' : ''}`}
              placeholder="Total staff count"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-text-primary">Estimated Annual Turnover (NPR)</label>
            <input
              type="number"
              value={fields.annual_turnover}
              onChange={e => set('annual_turnover', e.target.value)}
              className={`cms-input font-mono ${errors.annual_turnover ? 'error' : ''}`}
              placeholder="e.g. 50000000"
            />
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
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? 'Saving Borrower...' : 'Save Borrower'}
        </button>
        <Link href="/borrowers" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
