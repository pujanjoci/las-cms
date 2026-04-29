export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-40 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-lg mt-2"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-slate-100 rounded-xl"></div>
          <div className="h-10 w-36 bg-indigo-100 rounded-xl"></div>
        </div>
      </div>

      {/* 6 KPI skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-2.5 w-16 bg-slate-100 rounded-full"></div>
                <div className="h-6 w-12 bg-slate-200 rounded-lg"></div>
              </div>
              <div className="h-8 w-8 bg-slate-50 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner skeleton */}
      <div className="h-24 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl"></div>

      {/* Table + Feed skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between">
            <div className="h-5 w-28 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-20 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-28 bg-slate-100 rounded"></div>
                <div className="h-4 w-32 bg-slate-100 rounded flex-1"></div>
                <div className="h-4 w-20 bg-slate-50 rounded"></div>
                <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50">
            <div className="h-5 w-24 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="p-6 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-xl shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-full bg-slate-100 rounded"></div>
                  <div className="h-2.5 w-24 bg-slate-50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
