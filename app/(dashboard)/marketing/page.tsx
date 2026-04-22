import { Megaphone, Mail, Share2, BarChart2, Users, TrendingUp, Sparkles } from 'lucide-react'

const CAMPANAS = [
  { nombre: 'Promoción de temporada', canal: 'Email', estado: 'Activa', alcance: '1.200', conversion: '4.2%', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' },
  { nombre: 'Descuento fidelidad', canal: 'WhatsApp', estado: 'Borrador', alcance: '340', conversion: '—', color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600' },
  { nombre: 'Lanzamiento producto nuevo', canal: 'Email', estado: 'Finalizada', alcance: '890', conversion: '6.8%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700' },
]

const CANALES = [
  { label: 'Email marketing', icon: Mail, valor: '1.245 contactos', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { label: 'Redes sociales', icon: Share2, valor: 'Próximamente', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { label: 'Análisis de campañas', icon: BarChart2, valor: '3 activas', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { label: 'Segmentación', icon: Users, valor: 'Próximamente', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
]

export default function MarketingPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Campañas y estrategias de crecimiento</p>
        </div>
        <button className="btn-primary">
          <Megaphone size={16} /> Nueva campaña
        </button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Alcance total', value: '2.430', icon: Users, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Conversiones', value: '128', icon: TrendingUp, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Campañas activas', value: '1', icon: Megaphone, bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Tasa conversión', value: '5.3%', icon: BarChart2, bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon size={18} className={k.color} />
            </div>
            <div className="font-bold text-xl text-gray-900 dark:text-white">{k.value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Campañas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Campañas recientes</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {CAMPANAS.map(c => (
              <div key={c.nombre} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 shrink-0">
                      <Megaphone size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{c.nombre}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Canal: {c.canal} · Alcance: {c.alcance}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.color}`}>
                      {c.estado}
                    </span>
                    {c.conversion !== '—' && (
                      <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">{c.conversion} conv.</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canales */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Canales disponibles</h2>
          </div>
          <div className="p-4 space-y-3">
            {CANALES.map(c => (
              <div key={c.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                <div className={`w-8 h-8 rounded-lg ${c.color.split(' ').slice(0,2).join(' ')} flex items-center justify-center`}>
                  <c.icon size={15} className={c.color.split(' ').slice(2).join(' ')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 dark:text-slate-300">{c.label}</div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-500">{c.valor}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon banner */}
          <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Próximamente</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400">
              Automatización de campañas con IA, segmentación avanzada y más.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
