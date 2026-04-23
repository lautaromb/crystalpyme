import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FacturacionClient from './FacturacionClient'

export default async function FacturacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase.from('usuario').select('rol').eq('id', user!.id).single()
  if (yo?.rol !== 'superadmin') redirect('/dashboard')

  const [pagosRes, negociosRes] = await Promise.all([
    supabase
      .from('pago')
      .select('*, negocio:negocio_id(nombre)')
      .order('fecha', { ascending: false })
      .limit(200),
    supabase
      .from('negocio')
      .select('id, nombre, preciomensual')
      .order('nombre'),
  ])

  // KPIs
  const pagos = pagosRes.data ?? []
  const hoy = new Date()
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const cobradoMes = pagos
    .filter(p => p.estado === 'pagado' && new Date(p.fecha) >= primerDiaMes)
    .reduce((acc, p) => acc + Number(p.monto), 0)
  const pendientes = pagos.filter(p => p.estado === 'pendiente').length
  const fallidos = pagos.filter(p => p.estado === 'fallido').length

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
        <p className="text-sm text-gray-500 mt-1">Historial de pagos y registro manual</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Cobrado este mes</p>
          <p className="text-2xl font-bold text-gray-900">${cobradoMes.toLocaleString('es-AR')}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Pagos pendientes</p>
          <p className={`text-2xl font-bold ${pendientes > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{pendientes}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Pagos fallidos</p>
          <p className={`text-2xl font-bold ${fallidos > 0 ? 'text-red-600' : 'text-gray-900'}`}>{fallidos}</p>
        </div>
      </div>

      <FacturacionClient pagos={pagos} negocios={negociosRes.data ?? []} />
    </div>
  )
}
