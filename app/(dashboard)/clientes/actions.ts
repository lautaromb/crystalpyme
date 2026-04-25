'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthScope, assertNegocioAllowed } from '@/lib/auth/scope'

export interface ClienteInput {
  nombre: string
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  notas?: string | null
  negocio_id: string
}

export async function crearCliente(input: ClienteInput) {
  const scope = await getAuthScope()
  assertNegocioAllowed(scope, input.negocio_id)

  const supabase = await createClient()
  const { data, error } = await supabase.from('cliente').insert({
    nombre: input.nombre.trim(),
    telefono: input.telefono?.trim() || null,
    email: input.email?.trim() || null,
    direccion: input.direccion?.trim() || null,
    notas: input.notas?.trim() || null,
    negocio_id: input.negocio_id,
    estado: 'active',
  }).select('id').single()

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('email')) throw new Error('Ya existe un cliente activo con ese email en este negocio')
      if (error.message.includes('telefono')) throw new Error('Ya existe un cliente activo con ese teléfono en este negocio')
    }
    throw new Error(error.message)
  }
  revalidatePath('/clientes')
  return data.id as string
}

export async function actualizarCliente(id: string, patch: Partial<ClienteInput> & { estado?: 'active' | 'inactive' }) {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('cliente').select('negocio_id').eq('id', id).single()
  if (!existing) throw new Error('Cliente no encontrado')
  assertNegocioAllowed(scope, existing.negocio_id)

  const { error } = await supabase.from('cliente').update({
    ...(patch.nombre !== undefined && { nombre: patch.nombre.trim() }),
    ...(patch.telefono !== undefined && { telefono: patch.telefono?.trim() || null }),
    ...(patch.email !== undefined && { email: patch.email?.trim() || null }),
    ...(patch.direccion !== undefined && { direccion: patch.direccion?.trim() || null }),
    ...(patch.notas !== undefined && { notas: patch.notas?.trim() || null }),
    ...(patch.estado !== undefined && { estado: patch.estado }),
  }).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('email')) throw new Error('Ya existe un cliente activo con ese email en este negocio')
      if (error.message.includes('telefono')) throw new Error('Ya existe un cliente activo con ese teléfono en este negocio')
    }
    throw new Error(error.message)
  }
  revalidatePath('/clientes')
}

export async function eliminarCliente(id: string) {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('cliente').select('negocio_id').eq('id', id).single()
  if (!existing) throw new Error('Cliente no encontrado')
  assertNegocioAllowed(scope, existing.negocio_id)

  const { error } = await supabase.from('cliente').update({ estado: 'inactive' }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
}
