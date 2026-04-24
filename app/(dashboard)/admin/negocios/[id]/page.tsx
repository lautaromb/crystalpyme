import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, ExternalLink, Globe } from 'lucide-react'
import type { Negocio, Pago, PlanSaaS } from '@/types'
import AccionesNegocio from './AccionesNegocio'

const ESTADO_BADGE: Record<string, string> = {
  active: 'badge-green',
  trial: 'badge-yellow',
  inactive: 'badge-gray',
  suspendido: 'badge-red',
  vencido: 'badge-red',
}
const ESTADO_LABEL: Record<string, string> = {
  active: 'Activo',
  trial: 'Trial',
  inactive: 'Inactivo',
  suspendido: 'Suspendido',
  vencido: 'Vencido',
}
const PAGO_BADGE: Record<string, string> = {
  pagado: 'badge-green',
  pendiente: 'badge-yellow',
  fallido: 'badge-red',
}
const PAGO_LABEL: Record<string, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  fallido: 'Fallido',
}

function getEstadoEfectivo(n: Negocio): string {
  if (n.estado === 'suspendido' || n.estado === 'inactive') return n.estado
  if (n.proximopago && new Date(n.proximopago) < new Date()) return 'vencido'
  return n.estado
}

export default async function NegocioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase.from('usuario').select('rol').eq('id', user!.id).single()
  if (yo?.rol !== 'superadmin') redirect('/dashboard')

  const [{ data: negocio }, { data: pagos }, { data: planes }] = await Promise.all([
    supabase.from('negocio').select('*').eq('id', id).single(),
    supabase.from('pago').select('*').eq('negocio_id', id).order('fecha', { ascending: false }),
    supabase.from('plan').select('*').eq('activo', true).order('precio'),
  ])

  if (!negocio) notFound()

  const n = negocio as Negocio
  const estadoEfectivo = getEstadoEfectivo(n)
  const listaPlanes = (planes ?? []) as PlanSaaS[]
  const listaPagos = (pagos ?? []) as Pago[]

  const diasProximoPago = n.proximopago
    ? Math.ceil((new Date(n.proximopago).getTime() - Date.now()) / 86_400_000)
    : null

  const totalCobrado = listaPagos
    .filter(p => p.estado === 'pagado')
    .reduce((acc, p) => acc + Number(p.monto), 0)

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/negocios"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={15} /> Volver a negocios
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{n.nombre}</h1>
              <span className={ESTADO_BADGE[estadoEfectivo]}>{ESTADO_LABEL[estadoEfectivo]}</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {n.rubro && <span>{n.rubro} · </span>}
              Cliente desde {new Date(n.fechacreacion).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <AccionesNegocio negocio={n} planes={listaPlanes} />
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Plan</p>
          <p className="text-xl font-bold text-blue-600">{n.plantipo}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Precio/mes</p>
          <p className="text-xl font-bold text-slate-900">
            {n.preciomensual != null ? `$${Number(n.preciomensual).toLocaleString('es-AR')}` : '—'}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total cobrado</p>
          <p className="text-xl font-bold text-emerald-600">${totalCobrado.toLocaleString('es-AR')}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Próx. pago</p>
          <p className={`text-xl font-bold ${
            diasProximoPago !== null && diasProximoPago < 0
              ? 'text-red-600'
              : diasProximoPago !== null && diasProximoPago <= 7
                ? 'text-amber-600'
                : 'text-slate-900'
          }`}>
            {diasProximoPago === null
              ? '—'
              : diasProximoPago < 0
                ? `Vencido ${Math.abs(diasProximoPago)}d`
                : diasProximoPago === 0
                  ? 'Hoy'
                  : `${diasProximoPago}d`}
          </p>
          {n.proximopago && (
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(n.proximopago).toLocaleDateString('es-AR')}
            </p>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: info + historial */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info general */}
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">Información general</h2>
            {n.descripcion && (
              <p className="text-sm text-slate-600 mb-4 pb-4 border-b border-gray-100 italic">
                &ldquo;{n.descripcion}&rdquo;
              </p>
            )}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                { label: 'Razón social', value: n.razonsocial },
                { label: 'Rubro', value: n.rubro },
                { label: 'Email', value: n.email },
                { label: 'Dirección', value: n.direccion },
                {
                  label: 'Fecha de alta',
                  value: new Date(n.fechacreacion).toLocaleDateString('es-AR'),
                },
                {
                  label: 'Última actividad',
                  value: n.ultima_actividad
                    ? new Date(n.ultima_actividad).toLocaleDateString('es-AR')
                    : null,
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                  <dd className="text-slate-800 mt-0.5">{value ?? <span className="text-slate-400">—</span>}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Historial de pagos */}
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">Historial de pagos</h2>
            {listaPagos.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">Sin pagos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Fecha', 'Monto', 'Estado', 'Método', 'Notas'].map(h => (
                        <th key={h} className="text-left pb-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide pr-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {listaPagos.map(p => (
                      <tr key={p.id}>
                        <td className="py-3 text-slate-700 pr-4">
                          {new Date(p.fecha).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-3 font-semibold text-slate-900 pr-4">
                          ${Number(p.monto).toLocaleString('es-AR')}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={PAGO_BADGE[p.estado] ?? 'badge-gray'}>
                            {PAGO_LABEL[p.estado] ?? p.estado}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 capitalize pr-4">{p.metodo}</td>
                        <td className="py-3 text-slate-500">{p.notas ?? <span className="text-slate-300">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={5} className="pt-3 text-xs text-slate-500">
                        {listaPagos.filter(p => p.estado === 'pagado').length} pagos confirmados ·{' '}
                        Total: <span className="font-semibold text-slate-700">${totalCobrado.toLocaleString('es-AR')}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: página pública + facturación */}
        <div className="space-y-6">
          {/* Página pública */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={15} className="text-blue-500" />
              <h2 className="font-semibold text-slate-900">Página pública</h2>
            </div>
            {n.slug ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-slate-400 text-xs">/p/</span>
                  <span className="text-slate-700 text-sm font-medium flex-1">{n.slug}</span>
                </div>
                <Link
                  href={`/p/${n.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink size={12} /> Ver página pública
                </Link>
                {n.descripcion && (
                  <p className="text-xs text-slate-500 italic border-t border-gray-100 pt-3">
                    &ldquo;{n.descripcion}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 mb-2">Sin página configurada</p>
                <p className="text-xs text-slate-400">
                  Editá el negocio y asigná una URL para activar la página pública.
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">Facturación</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan activo</dt>
                <dd className="text-slate-900 font-semibold mt-0.5">{n.plantipo}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio mensual</dt>
                <dd className="text-slate-900 mt-0.5">
                  {n.preciomensual != null
                    ? `$${Number(n.preciomensual).toLocaleString('es-AR')}`
                    : <span className="text-slate-400">—</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Próximo pago</dt>
                <dd className="mt-1">
                  {n.proximopago ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-900">{new Date(n.proximopago).toLocaleDateString('es-AR')}</span>
                      {diasProximoPago !== null && (
                        <span className={`text-xs font-medium ${
                          diasProximoPago < 0 ? 'text-red-600' : diasProximoPago <= 7 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {diasProximoPago < 0
                            ? `Vencido hace ${Math.abs(diasProximoPago)} días`
                            : diasProximoPago === 0
                              ? 'Vence hoy'
                              : `Vence en ${diasProximoPago} días`}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pagos confirmados</dt>
                <dd className="text-slate-900 font-bold text-lg mt-0.5">
                  {listaPagos.filter(p => p.estado === 'pagado').length}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total histórico</dt>
                <dd className="text-emerald-600 font-bold text-lg mt-0.5">
                  ${totalCobrado.toLocaleString('es-AR')}
                </dd>
              </div>
            </dl>
          </div>

          {/* Estado del negocio */}
          {estadoEfectivo === 'vencido' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-800 mb-1">Pago vencido</p>
              <p className="text-xs text-red-600">
                Este negocio tiene un pago vencido hace {Math.abs(diasProximoPago!)} días.
                Registrá el pago o suspendé el acceso desde las acciones de arriba.
              </p>
            </div>
          )}
          {estadoEfectivo === 'trial' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">En período de prueba</p>
              <p className="text-xs text-amber-600">
                Cuando el trial termine, cambiá el estado a Activo y registrá el primer pago.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
