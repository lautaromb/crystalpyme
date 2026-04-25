import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, UserX } from 'lucide-react'
import { getAuthScope } from '@/lib/auth/scope'
import type { Cliente } from '@/types'
import ClientesClient from './ClientesClient'

export default async function ClientesPage() {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const empty = scope.negocioIds.length === 0
  const { data } = empty
    ? { data: [] }
    : await supabase
        .from('cliente')
        .select('*')
        .in('negocio_id', scope.negocioIds)
        .order('nombre')

  const clientes = (data ?? []) as Cliente[]
  const activos = clientes.filter(c => c.estado === 'active')
  const inactivos = clientes.filter(c => c.estado === 'inactive')

  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  const nuevosEsteMes = clientes.filter(c => (c.fecharegistro ?? c.created_at ?? '') >= inicioMes).length

  const kpis = [
    { label: 'Total clientes', value: String(clientes.length), sub: 'registrados', icon: Users, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Activos', value: String(activos.length), sub: 'habilitados', icon: UserCheck, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Inactivos', value: String(inactivos.length), sub: 'deshabilitados', icon: UserX, bg: 'bg-gray-100 dark:bg-slate-700', color: 'text-gray-400 dark:text-slate-400' },
    { label: 'Nuevos este mes', value: String(nuevosEsteMes), sub: 'incorporados', icon: Users, bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
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

      <ClientesClient clientes={clientes} negocios={scope.negocios} isSuper={scope.isSuper} />
    </div>
  )
}
