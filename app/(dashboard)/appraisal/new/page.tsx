'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  User, 
  TrendingUp, 
  ShieldCheck, 
  FileCheck, 
  ArrowRight, 
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Calculator,
  AlertCircle,
  Upload,
  Loader2,
  CheckCircle,
  ExternalLink,
  Building2
} from 'lucide-react';
import { KYCUploadModal } from '@/components/kyc/kyc-upload-modal';
import { submitAppraisalAction } from '@/app/actions/appraisal';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 1, name: 'Borrower', icon: User },
  { id: 2, name: 'Financials', icon: TrendingUp },
  { id: 3, name: 'Facility', icon: FileCheck },
  { id: 4, name: 'Collateral', icon: Calculator },
  { id: 5, name: 'Risk Scoring', icon: ShieldCheck },
  { id: 6, name: 'Review', icon: FileCheck },
];

interface FoundBorrower {
  id: string;
  name: string;
  type: string;
  pan_number: string;
  address?: string;
  district?: string;
  phone?: string;
  email?: string;
  sector?: string;
  status?: string;
}

export default function NewAppraisalPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    borrower: { pan: '', name: '', type: 'individual' },
    financials: { annualIncome: '', netWorth: '' },
    facility: { amount: '', purpose: '', tenure: 12, type: 'margin_lending', interestRate: 10.5, processingFee: 1.0, repaymentSource: '' },
    collateral: [] as any[],
    risk: { score: 0, grade: 'A' }
  });

  // Calculate Risk Score Dynamically
  const calculateRisk = () => {
    let score = 85; // Base score
    const income = Number(formData.financials.annualIncome) || 0;
    const amount = Number(formData.facility.amount) || 0;
    
    if (amount > 0 && income > 0) {
      if (amount / income > 5) score -= 20;
      else if (amount / income > 2) score -= 10;
    }
    
    let grade = 'A';
    if (score < 50) grade = 'D';
    else if (score < 65) grade = 'C';
    else if (score < 80) grade = 'B';
    
    return { score, grade };
  };

  // ── Borrower Search State ───────────────────────────────────────────────
  const [panInput, setPanInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [foundBorrower, setFoundBorrower] = useState<FoundBorrower | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ── Submission State ─────────────────────────────────────────────────────
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── KYC State ───────────────────────────────────────────────────────────
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycCount, setKycCount] = useState(0);

  // The real borrower ID from the database
  const activeBorrowerId = foundBorrower?.id || null;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ── PAN Search Handler ──────────────────────────────────────────────────
  const searchByPan = useCallback(async () => {
    const pan = panInput.trim();
    if (!pan) {
      setSearchError('Please enter a PAN number');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setFoundBorrower(null);
    setSearchDone(false);
    setKycCount(0);

    try {
      const res = await fetch(`/api/borrowers/search?pan=${encodeURIComponent(pan)}`);
      const json = await res.json();

      setSearchDone(true);

      if (json.success && json.data) {
        setFoundBorrower(json.data);
        setFormData(prev => ({
          ...prev,
          borrower: { pan: json.data.pan_number, name: json.data.name, type: json.data.type }
        }));

        // Also fetch KYC count for this borrower
        try {
          const kycRes = await fetch(`/api/kyc/${json.data.id}`);
          const kycJson = await kycRes.json();
          if (kycJson.success) setKycCount(kycJson.data?.length || 0);
        } catch { /* ignore */ }
      }
    } catch {
      setSearchError('Network error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [panInput]);

  const handlePanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchByPan();
    }
  };

  const clearBorrower = () => {
    setFoundBorrower(null);
    setSearchDone(false);
    setPanInput('');
    setKycCount(0);
    setFormData(prev => ({
      ...prev,
      borrower: { pan: '', name: '', type: 'individual' }
    }));
  };

  const handleSubmit = async () => {
    if (!foundBorrower?.id) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const payload = {
      ...formData,
      borrowerId: foundBorrower.id
    };
    
    const result = await submitAppraisalAction(payload);
    
    if (result.success) {
      router.push('/dashboard'); // or redirect to a success page
    } else {
      setSubmitError(result.error || 'Submission failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">New Credit Appraisal</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium font-sans">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">NRB Directive 2081 Compliant</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-4">
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all border-2 ${
                    isActive 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110' 
                      : isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <FileCheck className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-8 flex-1">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* ── PAN Search ──────────────────────────────────────── */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Search Borrower by PAN</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={panInput}
                      onChange={(e) => {
                        setPanInput(e.target.value);
                        if (searchDone) { setSearchDone(false); setFoundBorrower(null); }
                      }}
                      onKeyDown={handlePanKeyDown}
                      placeholder="Enter PAN number (e.g. 123456789)"
                      disabled={!!foundBorrower}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    {foundBorrower && (
                      <button 
                        onClick={clearBorrower}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Clear selection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={searchByPan}
                    disabled={isSearching || !!foundBorrower || !panInput.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
                  </button>
                </div>
                {searchError && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {searchError}
                  </p>
                )}
              </div>

              {/* ── Borrower Found Card ─────────────────────────────── */}
              {foundBorrower && (
                <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{foundBorrower.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs font-mono font-bold text-indigo-600">{foundBorrower.pan_number}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{foundBorrower.type?.replace('_', ' ')}</span>
                          {foundBorrower.sector && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {foundBorrower.sector}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="status-badge status-approved text-[10px]">
                      {foundBorrower.status || 'active'}
                    </span>
                  </div>
                  {(foundBorrower.address || foundBorrower.phone) && (
                    <div className="flex gap-6 mt-3 pt-3 border-t border-emerald-100">
                      {foundBorrower.address && (
                        <p className="text-xs text-slate-500"><span className="font-bold text-slate-600">Address:</span> {foundBorrower.address}{foundBorrower.district ? `, ${foundBorrower.district}` : ''}</p>
                      )}
                      {foundBorrower.phone && (
                        <p className="text-xs text-slate-500"><span className="font-bold text-slate-600">Phone:</span> {foundBorrower.phone}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Not Found: Register New Borrower ───────────────── */}
              {searchDone && !foundBorrower && (
                <div className="p-6 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">Borrower not found</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        No borrower is registered with PAN <span className="font-mono font-bold text-amber-700">{panInput}</span>. Register a new borrower first, then come back to create the appraisal.
                      </p>
                    </div>
                    <Link
                      href="/borrowers/new"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm hover:shadow-md shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Register New Borrower
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Link>
                  </div>
                </div>
              )}

              {/* ── KYC Upload Area (only when borrower is selected) ── */}
              {foundBorrower && (
                <div className={`p-6 rounded-2xl border-2 border-dashed flex items-center justify-between transition-all ${
                  kycCount > 0 
                    ? 'border-emerald-200 bg-emerald-50/50' 
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">
                      KYC Status:{' '}
                      {kycCount > 0 
                        ? <span className="text-emerald-600">{kycCount} DOCUMENT{kycCount > 1 ? 'S' : ''} UPLOADED</span>
                        : <span className="text-amber-600">NOT VERIFIED</span>
                      }
                    </p>
                    <p className="text-xs text-slate-500">
                      {kycCount > 0 
                        ? 'Documents uploaded. Click to manage or add more.'
                        : 'Please upload required documents to proceed with submission.'
                      }
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowKYCModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {kycCount > 0 ? 'Manage Documents' : 'Upload Documents'}
                  </button>
                </div>
              )}

              {/* ── Initial Empty State ─────────────────────────────── */}
              {!searchDone && !foundBorrower && !isSearching && (
                <div className="py-8 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <Search className="h-7 w-7 text-slate-200" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Enter a PAN number to search for an existing borrower</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Or{' '}
                    <Link href="/borrowers/new" className="text-primary font-bold hover:underline">
                      register a new borrower
                    </Link>
                    {' '}first
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 font-display">Collateral Breakdown</h3>
                <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Script
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Symbol</th>
                      <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qty</th>
                      <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                      <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Value</th>
                      <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eligible (50%)</th>
                      <th className="py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-50">
                      <td className="py-4 font-mono font-bold text-indigo-600">NABIL</td>
                      <td className="py-4"><input type="number" defaultValue={1000} className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold" /></td>
                      <td className="py-4 text-sm font-medium">620.00</td>
                      <td className="py-4 text-sm font-bold">620,000.00</td>
                      <td className="py-4 text-sm font-bold text-emerald-600">310,000.00</td>
                      <td className="py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Market Value</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">NPR 1,250,000</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Eligible Value</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">NPR 625,000</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Drawing Power</p>
                  <p className="text-lg font-bold text-indigo-700 mt-1">NPR 450,000</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Financial Information</h3>
                <p className="text-sm text-slate-500">Provide the self-declared financial details of the borrower.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Annual Income (NPR)</label>
                  <input 
                    type="number" 
                    value={formData.financials.annualIncome}
                    onChange={e => setFormData(p => ({...p, financials: {...p.financials, annualIncome: e.target.value}}))}
                    placeholder="e.g. 1500000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Net Worth (NPR)</label>
                  <input 
                    type="number" 
                    value={formData.financials.netWorth}
                    onChange={e => setFormData(p => ({...p, financials: {...p.financials, netWorth: e.target.value}}))}
                    placeholder="e.g. 5000000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Facility Details</h3>
                <p className="text-sm text-slate-500">Define the proposed credit facility structure.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facility Type</label>
                  <select 
                    value={formData.facility.type}
                    onChange={e => setFormData(p => ({...p, facility: {...p.facility, type: e.target.value}}))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  >
                    <option value="margin_lending">Margin Lending</option>
                    <option value="term_loan">Term Loan</option>
                    <option value="overdraft">Overdraft</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Proposed Amount (NPR)</label>
                  <input 
                    type="number" 
                    value={formData.facility.amount}
                    onChange={e => setFormData(p => ({...p, facility: {...p.facility, amount: e.target.value}}))}
                    placeholder="e.g. 2000000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-emerald-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tenure (Months)</label>
                  <input 
                    type="number" 
                    value={formData.facility.tenure}
                    onChange={e => setFormData(p => ({...p, facility: {...p.facility, tenure: Number(e.target.value)}}))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interest (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.facility.interestRate}
                      onChange={e => setFormData(p => ({...p, facility: {...p.facility, interestRate: Number(e.target.value)}}))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fee (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.facility.processingFee}
                      onChange={e => setFormData(p => ({...p, facility: {...p.facility, processingFee: Number(e.target.value)}}))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loan Purpose</label>
                  <textarea 
                    value={formData.facility.purpose}
                    onChange={e => setFormData(p => ({...p, facility: {...p.facility, purpose: e.target.value}}))}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                    placeholder="Enter the specific purpose of the facility..."
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Source of Repayment</label>
                  <textarea 
                    value={formData.facility.repaymentSource}
                    onChange={e => setFormData(p => ({...p, facility: {...p.facility, repaymentSource: e.target.value}}))}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                    placeholder="How will the loan be repaid? (e.g. Salary, Business Income)"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (() => {
            const risk = calculateRisk();
            return (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center max-w-lg mx-auto">
                  <div className="inline-flex h-20 w-20 rounded-full bg-slate-50 items-center justify-center mb-4">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-display">Risk Assessment</h3>
                  <p className="text-slate-500 mt-2">The system has analyzed the borrower\'s financials, requested facility, and collateral coverage to generate an initial risk score.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100 shadow-inner">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Calculated Score</p>
                    <p className={`text-6xl font-display font-bold mt-4 ${risk.score >= 70 ? 'text-emerald-600' : risk.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {risk.score}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Out of 100</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100 shadow-inner">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Internal Risk Grade</p>
                    <p className={`text-6xl font-display font-bold mt-4 ${risk.grade === 'A' || risk.grade === 'B' ? 'text-emerald-600' : risk.grade === 'C' ? 'text-amber-500' : 'text-red-500'}`}>
                      {risk.grade}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Based on scoring model v2.1</p>
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium flex items-start gap-3 max-w-3xl mx-auto border border-blue-100">
                  <AlertCircle className="h-5 w-5 shrink-0 text-blue-600" />
                  <p>This is a preliminary system-generated score. The credit analyst can adjust this during the formal credit memo preparation stage.</p>
                </div>
              </div>
            );
          })()}

          {currentStep === 6 && (() => {
            const risk = calculateRisk();
            return (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 font-display">Review Proposal</h3>
                  <p className="text-sm text-slate-500">Verify all the details before initiating the appraisal workflow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <User className="h-4 w-4 text-primary" /> Borrower Info
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Name</p>
                        <p className="font-bold text-slate-700">{formData.borrower.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">PAN</p>
                        <p className="font-mono font-bold text-slate-700">{formData.borrower.pan || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" /> Financials
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Annual Income</p>
                        <p className="font-bold text-slate-700">NPR {Number(formData.financials.annualIncome).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Net Worth</p>
                        <p className="font-bold text-slate-700">NPR {Number(formData.financials.netWorth).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 md:col-span-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <FileCheck className="h-4 w-4 text-indigo-500" /> Facility Structure
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Type</p>
                        <p className="font-bold text-slate-700 capitalize">{formData.facility.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Proposed Limit</p>
                        <p className="font-bold text-emerald-600">NPR {Number(formData.facility.amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Tenure</p>
                        <p className="font-bold text-slate-700">{formData.facility.tenure} Months</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Interest Rate</p>
                        <p className="font-bold text-slate-700">{formData.facility.interestRate}%</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-slate-400 text-xs">Purpose</p>
                      <p className="text-slate-700 text-sm mt-1 bg-slate-50 p-2 rounded-lg">{formData.facility.purpose || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-indigo-200 bg-indigo-50 shadow-sm space-y-2 md:col-span-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> System Risk Evaluation
                      </h4>
                      <p className="text-xs text-indigo-700 mt-1">Grade {risk.grade} • Score {risk.score}/100</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-bold text-white ${risk.grade === 'A' || risk.grade === 'B' ? 'bg-emerald-500' : risk.grade === 'C' ? 'bg-amber-500' : 'bg-red-500'}`}>
                      Grade {risk.grade}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          {currentStep === STEPS.length ? (
            <div className="flex items-center gap-4">
              {submitError && <span className="text-red-500 text-xs font-bold">{submitError}</span>}
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Proposal
                    <ShieldCheck className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={nextStep}
              disabled={currentStep === 1 && !foundBorrower}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* KYC Upload Modal */}
      <KYCUploadModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        borrowerId={activeBorrowerId}
        onUploadComplete={() => {
          if (activeBorrowerId) {
            fetch(`/api/kyc/${activeBorrowerId}`)
              .then(r => r.json())
              .then(j => { if (j.success) setKycCount(j.data?.length || 0); })
              .catch(() => {});
          }
        }}
      />
    </div>
  );
}
