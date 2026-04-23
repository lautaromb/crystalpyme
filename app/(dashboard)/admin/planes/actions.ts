'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearPlan(data: {
  nombre: string
  precio: number
  intervalo: 'mensual' | 'anual'
  descripcion?: string
  limite_productos?: number
  limite_usuarios?: number
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('plan').insert({ ...data, activo: true })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/planes')
}

export async function editarPlan(id: string, data: {
  nombre: string
  precio: number
  intervalo: 'mensual' | 'anual'
  descripcion?: string
  limite_productos?: number
  limite_usuarios?: number
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('plan').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/planes')
}

export async function togglePlanActivo(id: string, activo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('plan').update({ activo, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/planes')
}
