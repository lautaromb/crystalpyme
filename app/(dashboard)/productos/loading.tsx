export default function ProductosLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-slate-700 mb-3" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-slate-600 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex gap-3">
          <div className="h-8 flex-1 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-8 w-28 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-36 bg-gray-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-slate-600 rounded" />
              </div>
              <div className="h-3.5 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-14 bg-gray-100 dark:bg-slate-600 rounded-full" />
              <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
