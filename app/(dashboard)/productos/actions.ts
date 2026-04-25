'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthScope, assertNegocioAllowed } from '@/lib/auth/scope'

export interface ProductoInput {
  nombre: string
  descripcion?: string | null
  precio: number
  stock?: number | null
  stockminimo?: number | null
  categoria?: string | null
  negocio_id: string
}

async function generarCodigo(supabase: Awaited<ReturnType<typeof createClient>>, negocio_id: string): Promise<string> {
  const { data } = await supabase
    .from('articulo')
    .select('codigo')
    .eq('negocio_id', negocio_id)
    .like('codigo', 'P%')
    .order('codigo', { ascending: false })
    .limit(1)
    .single()

  const ultimo = data?.codigo ?? 'P000'
  const num = parseInt(ultimo.replace(/\D/g, ''), 10) || 0
  return `P${String(num + 1).padStart(3, '0')}`
}

export async function crearProducto(input: ProductoInput) {
  const scope = await getAuthScope()
  assertNegocioAllowed(scope, input.negocio_id)

  const supabase = await createClient()
  const codigo = await generarCodigo(supabase, input.negocio_id)

  const { data, error } = await supabase
    .from('articulo')
    .insert({
      codigo,
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || null,
      precio: input.precio,
      stock: input.stock ?? 0,
      stockminimo: input.stockminimo ?? null,
      categoria: input.categoria?.trim() || null,
      negocio_id: input.negocio_id,
      tenant_id: scope.tenantId,
      activo: true,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/productos')
  return data.id as string
}

export async function actualizarProducto(id: string, patch: Omit<Partial<ProductoInput>, 'negocio_id'>) {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('articulo').select('negocio_id').eq('id', id).single()
  if (!existing) throw new Error('Producto no encontrado')
  assertNegocioAllowed(scope, existing.negocio_id)

  const { error } = await supabase.from('articulo').update({
    ...(patch.nombre !== undefined && { nombre: patch.nombre.trim() }),
    ...(patch.descripcion !== undefined && { descripcion: patch.descripcion?.trim() || null }),
    ...(patch.precio !== undefined && { precio: patch.precio }),
    ...(patch.stock !== undefined && { stock: patch.stock }),
    ...(patch.stockminimo !== undefined && { stockminimo: patch.stockminimo }),
    ...(patch.categoria !== undefined && { categoria: patch.categoria?.trim() || null }),
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/productos')
}

export async function eliminarProducto(id: string) {
  const scope = await getAuthScope()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('articulo').select('negocio_id').eq('id', id).single()
  if (!existing) throw new Error('Producto no encontrado')
  assertNegocioAllowed(scope, existing.negocio_id)

  const { error } = await supabase.from('articulo')
    .update({ activo: false, deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/productos')
}
