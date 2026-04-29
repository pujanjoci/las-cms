'use client';

import { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Borrower', icon: User },
  { id: 2, name: 'Financials', icon: TrendingUp },
  { id: 3, name: 'Facility', icon: FileCheck },
  { id: 4, name: 'Collateral', icon: Calculator },
  { id: 5, name: 'Risk Scoring', icon: ShieldCheck },
  { id: 6, name: 'Review', icon: FileCheck },
];

export default function NewAppraisalPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    borrower: { pan: '', name: '', type: 'individual' },
    financials: { annualIncome: 0, netWorth: 0 },
    facility: { amount: 0, purpose: '', tenure: 12 },
    collateral: [] as any[],
    risk: { score: 0, grade: 'A' }
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">PAN Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter 9-digit PAN"
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-white rounded-lg transition-colors">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Borrower Name</label>
                  <input 
                    type="text" 
                    placeholder="Auto-fills from PAN"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-center">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700">KYC Status: <span className="text-amber-600">NOT VERIFIED</span></p>
                  <p className="text-xs text-slate-500">Please upload required documents to proceed with submission.</p>
                  <button className="mt-2 text-primary text-xs font-bold uppercase tracking-wider hover:underline">Upload Documents</button>
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

          {/* Fallback for other steps */}
          {(currentStep !== 1 && currentStep !== 4) && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                <FileCheck className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">{STEPS[currentStep - 1].name} Details</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">This section is being initialized. Form fields for {STEPS[currentStep - 1].name} will appear here.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          {currentStep === STEPS.length ? (
            <button className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
              Submit Proposal
              <ShieldCheck className="h-4 w-4" />
            </button>
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
    </div>
  );
}
