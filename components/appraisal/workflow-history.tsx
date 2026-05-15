import { Clock, CheckCircle2, ArrowRightCircle, User } from 'lucide-react';

interface HistoryItem {
  id: string;
  from_stage: string;
  to_stage: string;
  action_type: string;
  actor_role: string;
  remarks: string;
  created_at: string;
  users: {
    full_name: string;
  };
}

export function WorkflowHistory({ history }: { history: HistoryItem[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          Workflow History
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
          {history.length} Events
        </span>
      </div>
      
      <div className="p-6">
        <div className="relative space-y-6">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
          
          {history.map((item, idx) => (
            <div key={item.id} className="relative pl-8 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
              {/* Dot */}
              <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                item.action_type === 'approve' ? 'border-emerald-500 text-emerald-500' : 
                item.action_type === 'initiate' ? 'border-primary text-primary' : 'border-indigo-500 text-indigo-500'
              }`}>
                {item.action_type === 'approve' ? <CheckCircle2 className="h-3 w-3" /> : 
                 item.action_type === 'initiate' ? <User className="h-3 w-3" /> : <ArrowRightCircle className="h-3 w-3" />}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    {item.action_type === 'initiate' ? 'Case Initiated' : 
                     item.action_type === 'approve' ? 'Final Approval' : `Advanced to ${item.to_stage.replace(/_/g, ' ')}`}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400">
                    {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-slate-600">{item.users.full_name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded">
                    {item.actor_role?.replace(/_/g, ' ')}
                  </span>
                </div>
                
                {item.remarks && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg italic border-l-2 border-slate-200">
                    "{item.remarks}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
