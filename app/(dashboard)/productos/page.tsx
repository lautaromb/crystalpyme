import { createClient } from '@/lib/supabase/server'
import { Package, AlertCircle, Tag } from 'lucide-react'
import { getAuthScope } from '@/lib/auth/scope'
import type { Articulo } from '@/types'
import ProductosClient from './ProductosClient'

export default async function ProductosPage() {
  const scope = await getAuthScope()
  const supabase = await createClient()

  let q = supabase.from('articulo').select('*').is('deleted_at', null).order('nombre')
  if (!scope.isSuper) q = q.in('negocio_id', scope.negocioIds.length ? scope.negocioIds : ['__none__'])
  const { data } = await q

  const articulos = (data ?? []) as Articulo[]
  const activos = articulos.filter(a => a.activo)
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon size={18} className={k.color} />
            </div>
            <div className="font-bold text-xl text-gray-900 dark:text-white tabular-nums">{k.value}</div>
            <div className="text-xs text-gray-600 dark:text-slate-300 font-medium">{k.label}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500">{k.sub}</div>
          </div>
        ))}
      </div>

      <ProductosClient
        articulos={activos}
        negocios={scope.negocios}
        isSuper={scope.isSuper}
      />
    </div>
  )
}
