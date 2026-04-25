import { createClient } from '@/lib/supabase/server'
import { ShoppingCart, TrendingUp, Clock, XCircle } from 'lucide-react'
import { getAuthScope } from '@/lib/auth/scope'
import type { Articulo, Cliente } from '@/types'
import VentasClient, { type VentaRow } from './VentasClient'

export default async function VentasPage() {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const empty = scope.negocioIds.length === 0

  const [ventasRes, articulosRes, clientesRes] = await Promise.all([
    empty
      ? Promise.resolve({ data: [] })
      : supabase
          .from('venta')
          .select('id, fecha, total, estado, notas, negocio_id, cliente:cliente_id(nombre)')
          .in('negocio_id', scope.negocioIds)
          .is('deleted_at', null)
          .order('fecha', { ascending: false })
          .limit(200),
    empty
      ? Promise.resolve({ data: [] })
      : supabase.from('articulo').select('*').in('negocio_id', scope.negocioIds).eq('activo', true).is('deleted_at', null),
    empty
      ? Promise.resolve({ data: [] })
      : supabase.from('cliente').select('*').in('negocio_id', scope.negocioIds).eq('estado', 'active'),
  ])

  const ventas = (ventasRes.data ?? []) as unknown as VentaRow[]
  const articulos = (articulosRes.data ?? []) as Articulo[]
  const clientes = (clientesRes.data ?? []) as Cliente[]

  const total = ventas.reduce((acc, v) => acc + Number(v.total), 0)
  const pendientes = ventas.filter(v => v.estado === 'pendiente').length
  const entregadas = ventas.filter(v => v.estado === 'entregada').length
  const canceladas = ventas.filter(v => v.estado === 'cancelada').length

  const kpis = [
    { label: 'Total facturado', value: `$${total.toLocaleString('es-AR')}`, sub: `${ventas.length} ventas`, icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Entregadas', value: String(entregadas), sub: 'completadas', icon: ShoppingCart, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Pendientes', value: String(pendientes), sub: 'por entregar', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Canceladas', value: String(canceladas), sub: 'anuladas', icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/30', color: 'text-red-500 dark:text-red-400' },
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

      <VentasClient
        ventas={ventas}
        articulos={articulos}
        clientes={clientes}
        negocios={scope.negocios}
        isSuper={scope.isSuper}
      />
    </div>
  )
}
