export default function GlobalLoading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <h3 className="text-sm font-display font-bold text-slate-800 uppercase tracking-widest animate-pulse">
          Synchronizing Data
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
          Please wait while we secure your session
        </p>
      </div>
      
      {/* Skeleton Mock for standard page structure */}
      <div className="w-full max-w-4xl mt-12 space-y-8 opacity-40">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-100 rounded-lg"></div>
            <div className="h-4 w-64 bg-slate-50 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100"></div>
          <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100"></div>
          <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100"></div>
        </div>
        <div className="h-64 bg-slate-50 rounded-2xl border border-slate-100"></div>
      </div>
    </div>
  );
}
