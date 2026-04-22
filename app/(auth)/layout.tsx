export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Crystal<span className="text-blue-600">Pyme</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-widest font-medium">
            Gestión para tu negocio
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
