import { createClient } from '@/lib/supabase/server'
import { Package, AlertCircle, Plus, Search, Tag } from 'lucide-react'

export default async function ProductosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: usuario } = await supabase.from('usuario').select('*').eq('id', user!.id).single()

  const { data: articulos } = await supabase
    .from('articulo')
    .select('*')
    .eq('tenant_id', usuario.tenant_id)
    .order('nombre')

  const activos = articulos?.filter(a => a.activo) ?? []
  const stockBajo = activos.filter(a => (a.stock ?? 0) <= (a.stockminimo ?? 0) && a.stockminimo)
  const sinStock = activos.filter(a => (a.stock ?? 0) === 0)
  const valorInventario = activos.reduce((acc, a) => acc + Number(a.precio) * (a.stock ?? 0), 0)

  const kpis = [
    { label: 'Productos activos', value: String(activos.length), sub: 'en catálogo', icon: Package, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Stock bajo', value: String(stockBajo.length), sub: 'bajo mínimo', icon: AlertCircle, bg: stockBajo.length > 0 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-gray-50 dark:bg-slate-700', color: stockBajo.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-slate-500' },
    { label: 'Sin stock', value: String(sinStock.length), sub: 'agotados', icon: AlertCircle, bg: sinStock.length > 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-slate-700', color: sinStock.length > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-slate-500' },
    { label: 'Valor inventario', value: `$${valorInventario.toLocaleString('es-AR')}`, sub: 'stock total', icon: Tag, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Inventario y catálogo de artículos</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Nuevo producto
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
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Catálogo</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              className="pl-8 pr-4 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 border border-transparent dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 h-8 w-52"
            />
          </div>
        </div>

        {activos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Package size={26} className="text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Sin productos registrados</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">Agregá tu primer producto al catálogo</p>
            <button className="btn-primary text-xs px-4 py-2 h-auto">
              <Plus size={14} /> Nuevo producto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Categoría</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Precio</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Stock</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {activos.map(a => {
                  const bajo = a.stockminimo != null && (a.stock ?? 0) <= a.stockminimo
                  const agotado = (a.stock ?? 0) === 0
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-6 py-3.5 text-xs font-mono text-gray-500 dark:text-slate-400">{a.codigo}</td>
                      <td className="px-6 py-3.5">
                        <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{a.nombre}</div>
                        {a.descripcion && (
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">{a.descripcion}</div>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {a.categoria ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                            {a.categoria}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900 dark:text-white text-sm">
                        ${Number(a.precio).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-sm font-semibold ${agotado ? 'text-red-500 dark:text-red-400' : bajo ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-slate-200'}`}>
                          {a.stock ?? 0}
                        </span>
                        {a.stockminimo != null && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">/ mín {a.stockminimo}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${agotado ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700' :
                            bajo ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'}`}>
                          {agotado ? 'Sin stock' : bajo ? 'Stock bajo' : 'Disponible'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
