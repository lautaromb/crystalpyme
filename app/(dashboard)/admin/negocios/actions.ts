'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { NegocioEstado, TenantPlan } from '@/types'

export async function editarNegocio(
  id: string,
  data: {
    nombre: string
    slug?: string
    descripcion?: string
    razonsocial?: string
    rubro?: string
    email?: string
    direccion?: string
    plantipo: TenantPlan
    estado: NegocioEstado
    preciomensual?: number
    proximopago?: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('negocio')
    .update({
      nombre: data.nombre,
      slug: data.slug || null,
      descripcion: data.descripcion || null,
      razonsocial: data.razonsocial || null,
      rubro: data.rubro || null,
      email: data.email || null,
      direccion: data.direccion || null,
      plantipo: data.plantipo,
      estado: data.estado,
      preciomensual: data.preciomensual ?? null,
      proximopago: data.proximopago || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/negocios')
  revalidatePath(`/admin/negocios/${id}`)
  revalidatePath('/dashboard')
}

export async function cambiarEstadoNegocio(id: string, estado: NegocioEstado) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('negocio')
    .update({ estado })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/negocios')
  revalidatePath('/dashboard')
}
