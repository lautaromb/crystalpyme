'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function crearUsuario(data: {
  nombre: string
  username?: string
  email: string
  password: string
  rol: string
  tenant_id: string
}) {
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    user_metadata: { nombre: data.nombre },
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already registered')) throw new Error('El email ya está registrado')
    throw new Error(authError.message)
  }

  const { error: usuarioError } = await adminClient.from('usuario').upsert({
    id: authData.user.id,
    nombre: data.nombre,
    username: data.username || null,
    rol: data.rol,
    tenant_id: data.tenant_id,
    activo: true,
  }, { onConflict: 'id' })

  if (usuarioError) throw new Error(usuarioError.message)

  revalidatePath('/admin/usuarios')
}
