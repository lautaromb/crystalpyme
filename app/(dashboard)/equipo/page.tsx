import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EmpleadosTable from './EmpleadosTable'

export default async function EquipoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: usuario } = await supabase
    .from('usuario').select('*').eq('id', user!.id).single()

  if (usuario.rol !== 'admin') redirect('/dashboard')

  const { data: empleados } = await supabase
    .from('usuario')
    .select('id, nombre, activo, created_at')
    .eq('tenant_id', usuario.tenant_id)
    .eq('rol', 'vendedor')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi equipo</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Gestioná los empleados que tienen acceso a tu negocio
        </p>
      </div>

      <EmpleadosTable
        empleados={empleados ?? []}
        tenantId={usuario.tenant_id}
      />
    </div>
  )
}
