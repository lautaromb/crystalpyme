'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function configurarPaginaPublica(
  negocioId: string,
  slug: string,
  descripcion: string
) {
  const supabase = await createClient()

  const { data: existente } = await supabase
    .from('negocio')
    .select('id')
    .eq('slug', slug)
    .neq('id', negocioId)
    .maybeSingle()

  if (existente) throw new Error(`La URL "/p/${slug}" ya está en uso por otro negocio`)

  const { error } = await supabase
    .from('negocio')
    .update({ slug, descripcion: descripcion || null })
    .eq('id', negocioId)

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/negocios/${negocioId}`)
  revalidatePath('/admin/negocios')
}
