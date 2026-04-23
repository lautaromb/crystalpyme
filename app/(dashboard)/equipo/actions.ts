'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function invitarEmpleado(data: {
  nombre: string
  email: string
  tenantId: string
}) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: { nombre: data.nombre },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    }
  )

  if (authError) {
    if (authError.message.includes('already registered')) throw new Error('El email ya está registrado en el sistema')
    throw new Error(authError.message)
  }

  const { error: usuarioError } = await supabase.from('usuario').upsert({
    id: authData.user.id,
    nombre: data.nombre,
    rol: 'vendedor',
    tenant_id: data.tenantId,
    activo: true,
  })

  if (usuarioError) throw new Error(usuarioError.message)

  revalidatePath('/dashboard/equipo')
}

export async function toggleEmpleadoActivo(empleadoId: string, activo: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('usuario')
    .update({ activo })
    .eq('id', empleadoId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/equipo')
}
