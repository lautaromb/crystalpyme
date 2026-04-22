import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2, Plus } from 'lucide-react'

const ESTADO_BADGE: Record<string, string> = { active: 'badge-green', inactive: 'badge-red', trial: 'badge-yellow' }
const ESTADO_LABEL: Record<string, string> = { active: 'Activo', inactive: 'Inactivo', trial: 'Trial' }
const PLAN_BADGE: Record<string, string> = { basic: 'badge-gray', pro: 'badge-blue', enterprise: 'badge-red' }

export default async function NegociosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase.from('usuario').select('rol').eq('id', user!.id).single()
  if (yo?.rol !== 'superadmin') redirect('/dashboard')

  const { data: negocios } = await supabase.from('negocio').select('*').order('fechacreacion', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-slate-100">Negocios</h1>
          <p className="text-sm text-slate-500 mt-1">{negocios?.length ?? 0} negocios registrados</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Nuevo negocio</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {negocios?.map(n => (
          <div key={n.id} className="card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Building2 size={18} className="text-sky-400" />
              </div>
              <div className="flex gap-2">
                <span className={PLAN_BADGE[n.plantipo] ?? 'badge-gray'}>{n.plantipo}</span>
                <span className={ESTADO_BADGE[n.estado] ?? 'badge-gray'}>{ESTADO_LABEL[n.estado]}</span>
              </div>
            </div>
            <h3 className="font-bold text-slate-100 mb-0.5">{n.nombre}</h3>
            {n.razonsocial && <p className="text-xs text-slate-500 mb-3">{n.razonsocial}</p>}
            <div className="divider" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-600">Rubro</span><p className="text-slate-400 mt-0.5">{n.rubro ?? '—'}</p></div>
              <div><span className="text-slate-600">Mensualidad</span>
                <p className="text-slate-400 mt-0.5">{n.preciomensual ? `$${Number(n.preciomensual).toLocaleString('es-AR')}` : '—'}</p>
              </div>
            </div>
          </div>
        ))}
        {!negocios?.length && (
          <div className="col-span-full card flex flex-col items-center justify-center py-16 text-center">
            <Building2 size={40} className="text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">No hay negocios registrados todavía</p>
            <button className="btn-primary mt-4"><Plus size={14} /> Crear el primero</button>
          </div>
        )}
      </div>
    </div>
  )
}
