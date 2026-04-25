'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthScope, assertNegocioAllowed } from '@/lib/auth/scope'

export interface VentaItemInput {
  articulo_id: string
  nombre: string
  precio: number
  cantidad: number
}

export interface VentaInput {
  negocio_id: string
  cliente_id: string
  notas?: string | null
  estado?: 'pendiente' | 'entregada' | 'cancelada'
  items: VentaItemInput[]
}

export async function crearVenta(input: VentaInput) {
  const scope = await getAuthScope()
  assertNegocioAllowed(scope, input.negocio_id)

  if (input.items.length === 0) throw new Error('La venta debe tener al menos un producto')
  for (const it of input.items) {
    if (it.cantidad <= 0) throw new Error('Cantidad inválida')
    if (it.precio < 0) throw new Error('Precio inválido')
  }

  const total = input.items.reduce((a, it) => a + it.precio * it.cantidad, 0)
  const supabase = await createClient()

  const { data: venta, error: errVenta } = await supabase
    .from('venta')
    .insert({
      negocio_id: input.negocio_id,
      cliente_id: input.cliente_id,
      usuario_id: scope.userId,
      tenant_id: scope.tenantId,
      total,
      fecha: new Date().toISOString(),
      estado: input.estado ?? 'pendiente',
      entregada: input.estado === 'entregada',
      notas: input.notas?.trim() || null,
    })
    .select('id')
    .single()

  if (errVenta) throw new Error(errVenta.message)

  const detalles = input.items.map(it => ({
    venta_id: venta.id,
    articulo_id: it.articulo_id,
    nombre: it.nombre,
    precio: it.precio,
    cantidad: it.cantidad,
    subtotal: it.precio * it.cantidad,
  }))

  const { error: errDet } = await supabase.from('detalleventa').insert(detalles)
  if (errDet) {
    await supabase.from('venta').delete().eq('id', venta.id)
    throw new Error(errDet.message)
  }

  revalidatePath('/ventas')
  revalidatePath('/productos')
  revalidatePath('/dashboard')
  return venta.id as string
}

export async function actualizarEstadoVenta(
  id: string,
  estado: 'pendiente' | 'entregada' | 'cancelada',
) {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('venta').select('negocio_id').eq('id', id).single()
  if (!existing) throw new Error('Venta no encontrada')
  assertNegocioAllowed(scope, existing.negocio_id)

  const { error } = await supabase.from('venta').update({
    estado,
    entregada: estado === 'entregada',
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/ventas')
}

export async function eliminarVenta(id: string) {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('venta').select('negocio_id').eq('id', id).single()
  if (!existing) throw new Error('Venta no encontrada')
  assertNegocioAllowed(scope, existing.negocio_id)

  const { error } = await supabase.from('venta')
    .update({ deleted_at: new Date().toISOString(), estado: 'cancelada', entregada: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/ventas')
  revalidatePath('/productos')
}
