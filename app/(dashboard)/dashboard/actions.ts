'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function marcarPagoRecibido(negocioId: string, proximopagoActual: string | null) {
  const supabase = await createClient()

  const base = proximopagoActual ? new Date(proximopagoActual) : new Date()
  const siguiente = new Date(base)
  siguiente.setMonth(siguiente.getMonth() + 1)

  const { error } = await supabase
    .from('negocio')
    .update({ proximopago: siguiente.toISOString().split('T')[0] })
    .eq('id', negocioId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}

export async function crearCliente(data: {
  nombre: string
  razonsocial?: string
  rubro?: string
  direccion?: string
  plantipo: string
  estado: 'active' | 'trial' | 'inactive'
  preciomensual?: number
  proximopago?: string
  adminNombre: string
  adminEmail: string
  adminPassword: string
}) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // 1. Crear tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenant')
    .insert({ nombre: data.nombre, plan: 'starter', activo: true })
    .select('id')
    .single()

  if (tenantError) throw new Error(`Error al crear tenant: ${tenantError.message}`)

  // 2. Crear negocio vinculado al tenant
  const { data: negocio, error: negocioError } = await supabase
    .from('negocio')
    .insert({
      nombre: data.nombre,
      razonsocial: data.razonsocial ?? null,
      rubro: data.rubro ?? null,
      direccion: data.direccion ?? null,
      plantipo: data.plantipo,
      estado: data.estado,
      preciomensual: data.preciomensual ?? null,
      proximopago: data.proximopago ?? null,
      tenant_id: tenant.id,
      fechacreacion: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single()

  if (negocioError) {
    await supabase.from('tenant').delete().eq('id', tenant.id)
    throw new Error(`Error al crear negocio: ${negocioError.message}`)
  }

  // 3. Crear usuario en Supabase Auth (email ya confirmado)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.adminEmail,
    password: data.adminPassword,
    user_metadata: { nombre: data.adminNombre },
    email_confirm: true,
  })

  if (authError) {
    await supabase.from('negocio').delete().eq('id', negocio.id)
    await supabase.from('tenant').delete().eq('id', tenant.id)
    if (authError.message.includes('already registered')) {
      throw new Error('El email ya está registrado en el sistema')
    }
    throw new Error(`Error al crear usuario: ${authError.message}`)
  }

  // 4. Upsert usuario con rol admin — usamos adminClient para saltear RLS
  const { error: usuarioError } = await adminClient
    .from('usuario')
    .upsert({
      id: authData.user.id,
      nombre: data.adminNombre,
      rol: 'admin',
      tenant_id: tenant.id,
      activo: true,
    }, { onConflict: 'id' })

  if (usuarioError) throw new Error(`Error al configurar usuario: ${usuarioError.message}`)

  revalidatePath('/dashboard')
  revalidatePath('/admin/negocios')
  revalidatePath('/admin/usuarios')
}
