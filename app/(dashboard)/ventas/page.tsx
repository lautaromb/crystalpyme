import { createClient } from '@/lib/supabase/server'
import { ShoppingCart, TrendingUp, Clock, XCircle, Plus, Filter } from 'lucide-react'

const ESTADO_STYLE: Record<string, string> = {
  entregada: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
  pendiente: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  cancelada: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
}

export default async function VentasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: usuario } = await supabase.from('usuario').select('*').eq('id', user!.id).single()

  const { data: ventas } = await supabase
    .from('venta')
    .select('*, cliente:cliente_id(nombre)')
    .eq('tenant_id', usuario.tenant_id)
    .order('fecha', { ascending: false })
    .limit(100)

  const total = ventas?.reduce((acc, v) => acc + Number(v.total), 0) ?? 0
  const pendientes = ventas?.filter(v => v.estado === 'pendiente').length ?? 0
  const entregadas = ventas?.filter(v => v.estado === 'entregada').length ?? 0
  const canceladas = ventas?.filter(v => v.estado === 'cancelada').length ?? 0

  const kpis = [
    { label: 'Total facturado', value: `$${total.toLocaleString('es-AR')}`, sub: `${ventas?.length ?? 0} ventas`, icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Entregadas', value: String(entregadas), sub: 'completadas', icon: ShoppingCart, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Pendientes', value: String(pendientes), sub: 'por entregar', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Canceladas', value: String(canceladas), sub: 'anuladas', icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/30', color: 'text-red-500 dark:text-red-400' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Gestión de pedidos y facturación</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Nueva venta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon size={18} className={k.color} />
            </div>
            <div className="font-bold text-xl text-gray-900 dark:text-white">{k.value}</div>
            <div className="text-xs text-gray-600 dark:text-slate-300 font-medium">{k.label}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Listado de ventas</h2>
          <button className="btn-secondary text-xs px-3 py-1.5 h-auto">
            <Filter size={13} /> Filtrar
          </button>
        </div>

        {(ventas?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <ShoppingCart size={26} className="text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Sin ventas registradas</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">Creá tu primera venta para comenzar</p>
            <button className="btn-primary text-xs px-4 py-2 h-auto">
              <Plus size={14} /> Nueva venta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Notas</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Total</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {ventas?.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(v.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {(v.cliente as { nombre: string } | null)?.nombre ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-slate-500 max-w-xs truncate">
                      {v.notas ?? '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${Number(v.total).toLocaleString('es-AR')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_STYLE[v.estado]}`}>
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
