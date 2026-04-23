'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarPago(data: {
  negocio_id: string
  monto: number
  fecha: string
  estado: 'pagado' | 'pendiente' | 'fallido'
  notas?: string
  metodo?: string
}) {
  const supabase = await createClient()

  const { error: pagoError } = await supabase.from('pago').insert({
    negocio_id: data.negocio_id,
    monto: data.monto,
    fecha: data.fecha,
    estado: data.estado,
    notas: data.notas ?? null,
    metodo: data.metodo ?? 'manual',
  })
  if (pagoError) throw new Error(pagoError.message)

  // Si el pago está pagado, avanzar próximo pago del negocio
  if (data.estado === 'pagado') {
    const { data: negocio } = await supabase
      .from('negocio').select('proximopago').eq('id', data.negocio_id).single()

    const base = negocio?.proximopago ? new Date(negocio.proximopago) : new Date()
    const siguiente = new Date(base)
    siguiente.setMonth(siguiente.getMonth() + 1)

    await supabase.from('negocio')
      .update({ proximopago: siguiente.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', data.negocio_id)
  }

  revalidatePath('/admin/facturacion')
  revalidatePath('/dashboard')
}
