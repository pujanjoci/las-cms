export default function AppraisalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-100 rounded-lg mt-2"></div>
        </div>
        <div className="h-10 w-36 bg-indigo-100 rounded-xl"></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4">
        <div className="h-9 flex-1 bg-slate-50 rounded-xl"></div>
        <div className="h-9 w-28 bg-slate-50 rounded-xl"></div>
        <div className="h-9 w-20 bg-slate-50 rounded-xl"></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-28 bg-slate-100 rounded"></div>
              <div className="h-4 w-36 bg-slate-100 rounded"></div>
              <div className="h-4 w-24 bg-slate-50 rounded flex-1"></div>
              <div className="h-4 w-12 bg-slate-50 rounded"></div>
              <div className="h-5 w-20 bg-slate-100 rounded-full"></div>
              <div className="h-4 w-16 bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
