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
  Building2,
  Save
} from 'lucide-react';
import { KYCUploadModal } from '@/components/kyc/kyc-upload-modal';
import { updateAppraisalAction } from '@/app/actions/appraisal';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 1, name: 'Borrower', icon: User },
  { id: 2, name: 'Financials', icon: TrendingUp },
  { id: 3, name: 'Facility', icon: FileCheck },
  { id: 4, name: 'Collateral', icon: Calculator },
  { id: 5, name: 'Risk Scoring', icon: ShieldCheck },
  { id: 6, name: 'Review', icon: FileCheck },
];

interface EditAppraisalFormProps {
  appraisal: any;
  borrower: any;
  kycInitialCount: number;
}

export function EditAppraisalForm({ appraisal, borrower, kycInitialCount }: EditAppraisalFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    borrower: { 
      pan: borrower?.pan_number || '', 
      name: borrower?.name || '', 
      type: borrower?.type || 'individual' 
    },
    financials: { 
      annualIncome: '', // Note: Currently not in the DB, so we keep empty for now or add if needed
      netWorth: '' 
    },
    facility: { 
      amount: appraisal.proposed_limit?.toString() || '', 
      purpose: appraisal.loan_purpose || '', 
      tenure: appraisal.tenure_months || 12, 
      type: appraisal.facility_type || 'margin_lending', 
      interestRate: appraisal.interest_rate_pct || 10.5, 
      processingFee: appraisal.processing_fee_pct || 1.0, 
      repaymentSource: appraisal.repayment_source || '' 
    },
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

  // ── Submission State ─────────────────────────────────────────────────────
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── KYC State ───────────────────────────────────────────────────────────
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycCount, setKycCount] = useState(kycInitialCount);

  const activeBorrowerId = borrower?.id || null;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    const result = await updateAppraisalAction(appraisal.id, formData);
    
    if (result.success) {
      router.push(`/appraisal/${appraisal.id}`);
    } else {
      setSubmitError(result.error || 'Update failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/appraisal/${appraisal.id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">Edit Appraisal: {appraisal.case_number}</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium font-sans">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Editing Case</span>
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
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-amber-600 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Borrower Locked</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800">{borrower?.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-mono font-bold text-indigo-600">{borrower?.pan_number}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{borrower?.type?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase">
                    Verified
                  </div>
                </div>
              </div>

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
                    Manage borrower KYC documents for this appraisal.
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
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Financial Information</h3>
                <p className="text-sm text-slate-500">Update self-declared financial details.</p>
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
                <p className="text-sm text-slate-500">Update the proposed credit facility structure.</p>
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
                    placeholder="How will the loan be repaid?"
                  />
                </div>
              </div>
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
                      <th className="py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-50">
                      <td className="py-4 font-mono font-bold text-indigo-600">NABIL</td>
                      <td className="py-4">1000</td>
                      <td className="py-4 text-sm font-medium">620.00</td>
                      <td className="py-4 text-sm font-bold">620,000.00</td>
                      <td className="py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                  <p className="text-slate-500 mt-2">Initial system-generated risk profile.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Calculated Score</p>
                    <p className={`text-6xl font-display font-bold mt-4 ${risk.score >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {risk.score}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Internal Risk Grade</p>
                    <p className={`text-6xl font-display font-bold mt-4 ${risk.grade === 'A' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {risk.grade}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {currentStep === 6 && (() => {
            const risk = calculateRisk();
            return (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 font-display">Review Changes</h3>
                  <p className="text-sm text-slate-500">Verify updated details before saving.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <User className="h-4 w-4 text-primary" /> Borrower Info
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Name</p>
                        <p className="font-bold text-slate-700">{borrower?.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">PAN</p>
                        <p className="font-mono font-bold text-slate-700">{borrower?.pan_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 md:col-span-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <FileCheck className="h-4 w-4 text-indigo-500" /> Updated Facility Structure
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
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    Save Changes
                    <Save className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-indigo-200"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

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
