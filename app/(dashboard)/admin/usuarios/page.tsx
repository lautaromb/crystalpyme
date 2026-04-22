import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsuariosTable from './UsuariosTable'
import NuevoUsuarioModal from './NuevoUsuarioModal'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase.from('usuario').select('rol').eq('id', user!.id).single()
  if (yo?.rol !== 'superadmin') redirect('/dashboard')

  const { data: usuarios } = await supabase
    .from('usuario')
    .select('*, tenant:tenant_id ( nombre )')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: tenants } = await supabase.from('tenant').select('id, nombre').eq('activo', true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-slate-100">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-1">{usuarios?.length ?? 0} usuarios registrados</p>
        </div>
        <NuevoUsuarioModal tenants={tenants ?? []} />
      </div>
      <UsuariosTable usuarios={usuarios ?? []} />
    </div>
  )
}
