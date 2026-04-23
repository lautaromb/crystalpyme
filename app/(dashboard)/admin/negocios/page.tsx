import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Negocio } from '@/types'
import NegociosAdminTable from './NegociosAdminTable'

export default async function NegociosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase.from('usuario').select('rol').eq('id', user!.id).single()
  if (yo?.rol !== 'superadmin') redirect('/dashboard')

  const { data: negocios } = await supabase
    .from('negocio')
    .select('*')
    .order('fechacreacion', { ascending: false })

  const lista = (negocios ?? []) as Negocio[]

  const total = lista.length
  const activos = lista.filter(n => n.estado === 'active').length
  const trial = lista.filter(n => n.estado === 'trial').length
  const suspendidos = lista.filter(n => n.estado === 'suspendido').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1.5 ml-4">
            {total} {total === 1 ? 'negocio registrado' : 'negocios registrados'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-600">{total}</p>
          <p className="text-xs text-slate-500 mt-0.5">negocios</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Activos</p>
          <p className="text-3xl font-bold text-emerald-600">{activos}</p>
          <p className="text-xs text-slate-500 mt-0.5">con plan activo</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Trial</p>
          <p className="text-3xl font-bold text-amber-600">{trial}</p>
          <p className="text-xs text-slate-500 mt-0.5">en período de prueba</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Suspendidos</p>
          <p className="text-3xl font-bold text-red-600">{suspendidos}</p>
          <p className="text-xs text-slate-500 mt-0.5">sin acceso activo</p>
        </div>
      </div>

      {/* Table */}
      <div>
        <NegociosAdminTable negocios={lista} />
      </div>
    </div>
  )
}
