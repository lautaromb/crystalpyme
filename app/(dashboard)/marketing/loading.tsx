export default function MarketingLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-slate-700 mb-3" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-slate-600 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="h-4 w-36 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-44 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-28 bg-gray-100 dark:bg-slate-600 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-2.5 w-16 bg-gray-100 dark:bg-slate-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
