'use server'

import { createClient } from '@/lib/supabase/server'
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

export async function crearNegocio(data: {
  nombre: string
  razonsocial?: string
  rubro?: string
  direccion?: string
  plantipo: 'basic' | 'pro' | 'enterprise'
  estado: 'active' | 'trial' | 'inactive'
  preciomensual?: number
  proximopago?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('negocio').insert({
    nombre: data.nombre,
    razonsocial: data.razonsocial ?? null,
    rubro: data.rubro ?? null,
    direccion: data.direccion ?? null,
    plantipo: data.plantipo,
    estado: data.estado,
    preciomensual: data.preciomensual ?? null,
    proximopago: data.proximopago ?? null,
    fechacreacion: new Date().toISOString().split('T')[0],
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/admin/negocios')
}
