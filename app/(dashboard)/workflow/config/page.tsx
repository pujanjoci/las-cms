'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Settings2, GitBranch, Layers, 
  ChevronRight, Trash2, Save, GripVertical,
  Activity, AlertCircle, X, Check
} from 'lucide-react';

interface Chain {
  id: string;
  chain_name: string;
  facility_types: string[];
  is_active: boolean;
  stages: any[];
}

export default function WorkflowConfigPage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChain, setActiveChain] = useState<Chain | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchChains();
  }, []);

  const fetchChains = async () => {
    try {
      const res = await fetch('/api/workflow/chains');
      const data = await res.json();
      setChains(data);
      if (data.length > 0 && !activeChain) setActiveChain(data[0]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch chains:', error);
      setLoading(false);
    }
  };

  const handleStageChange = (stageId: string, field: string, value: any) => {
    if (!activeChain) return;
    
    const updatedStages = activeChain.stages.map(s => 
      s.id === stageId ? { ...s, [field]: value } : s
    );
    
    setActiveChain({ ...activeChain, stages: updatedStages });
  };

  const handleSave = async () => {
    if (!activeChain) return;
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Chain metadata
      const chainRes = await fetch(`/api/workflow/chains/${activeChain.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain_name: activeChain.chain_name,
          is_active: activeChain.is_active,
          facility_types: activeChain.facility_types
        }),
      });

      if (!chainRes.ok) throw new Error('Failed to update chain metadata');

      // 2. Update each stage
      // In a real app, we might do this in one transaction on the backend
      for (const stage of activeChain.stages) {
        const stageRes = await fetch(`/api/workflow/chains/${activeChain.id}/stages`, {
          method: 'POST', // Assuming POST handles both create and update for simplicity in our earlier route
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stage),
        });
        if (!stageRes.ok) throw new Error(`Failed to update stage ${stage.stage_name}`);
      }

      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
      fetchChains();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Approval Chains</h1>
          <p className="text-slate-500 mt-1">Configure multi-level routing rules based on loan amounts.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-indigo-100 active:scale-95">
          <Plus size={20} />
          <span>New Chain</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in zoom-in-95 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chain Selector */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Available Chains</h2>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : chains.map(chain => (
              <button 
                key={chain.id}
                onClick={() => setActiveChain(chain)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                  activeChain?.id === chain.id 
                  ? 'bg-indigo-50/50 border-primary shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-primary/30'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-xl ${activeChain?.id === chain.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors'}`}>
                    <GitBranch size={18} />
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${chain.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                </div>
                <h3 className="font-bold text-slate-800">{chain.chain_name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {chain.facility_types.map((type, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-500">
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stage Builder */}
        <div className="lg:col-span-8 space-y-6">
          {activeChain ? (
            <>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white border border-slate-200 text-primary rounded-2xl shadow-sm">
                      <Layers size={24} />
                    </div>
                    <div>
                      <input 
                        type="text"
                        value={activeChain.chain_name}
                        onChange={(e) => setActiveChain({...activeChain, chain_name: e.target.value})}
                        className="text-xl font-bold bg-transparent focus:outline-none focus:ring-0 text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-primary transition-all"
                      />
                      <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Workflow Configuration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {saving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {activeChain.stages.map((stage, index) => (
                    <div key={stage.id} className="group relative">
                      <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-black z-10 shadow-sm">
                        {index + 1}
                      </div>
                      <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:border-primary/30 transition-all duration-300 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div className="md:col-span-1 flex justify-center">
                             <GripVertical className="text-slate-300 cursor-grab active:cursor-grabbing" size={20} />
                          </div>
                          
                          <div className="md:col-span-4 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stage Identity</label>
                            <input 
                              type="text" 
                              value={stage.stage_name} 
                              onChange={(e) => handleStageChange(stage.id, 'stage_name', e.target.value)}
                              className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none focus:text-primary transition-colors border-b border-slate-200 py-1"
                            />
                          </div>

                          <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment</label>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{stage.role_name}</span>
                              <span className="text-[11px] text-slate-500 font-medium">{stage.dept_name}</span>
                            </div>
                          </div>

                          <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Threshold (NPR)</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number"
                                value={stage.amount_min}
                                onChange={(e) => handleStageChange(stage.id, 'amount_min', Number(e.target.value))}
                                className="w-20 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                              />
                              <ChevronRight size={14} className="text-slate-300" />
                              <input 
                                type="number"
                                value={stage.amount_max || 0}
                                placeholder="Max"
                                onChange={(e) => handleStageChange(stage.id, 'amount_max', e.target.value ? Number(e.target.value) : null)}
                                className="w-20 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-1 text-right">
                            <button className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-300 hover:text-rose-500 transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {index < activeChain.stages.length - 1 && (
                        <div className="ml-10 w-0.5 h-6 bg-slate-100 my-1" />
                      )}
                    </div>
                  ))}
                  
                  <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:border-primary/50 hover:text-primary hover:bg-indigo-50/30 transition-all group mt-8">
                    <Plus size={20} className="group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-bold">Append New Stage</span>
                  </button>
                </div>

                <div className="p-6 bg-amber-50/50 border-t border-slate-100 flex gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg h-fit">
                    <AlertCircle className="text-amber-600" size={20} />
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    <span className="font-bold">Important:</span> Configuration updates will apply to new proposals immediately. 
                    Live cases currently in circulation will continue under their original workflow rules to ensure compliance and audit integrity.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[600px] bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
                <Activity size={48} className="text-slate-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Select Workflow</h3>
                <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">Choose an existing approval chain from the panel on the left or create a new logic sequence to get started.</p>
              </div>
              <button className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                Create New Chain
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
