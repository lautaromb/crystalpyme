import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Activity, Users, Package, ShoppingCart, Eye } from 'lucide-react'
import type { Negocio, Pago, PlanSaaS, Usuario } from '@/types'
import AccionesNegocio from './AccionesNegocio'
import PaginaPublicaCard from './PaginaPublicaCard'
import DominioCustomCard from './DominioCustomCard'

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

function tiempoRelativo(fecha: string | null | undefined): string {
  if (!fecha) return 'Nunca'
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff < 30) return `Hace ${diff}d`
  if (diff < 365) return `Hace ${Math.floor(diff / 30)} meses`
  return `Hace ${Math.floor(diff / 365)} años`
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

  const { data: negocio } = await supabase.from('negocio').select('*').eq('id', id).single()
  if (!negocio) notFound()

  const n = negocio as Negocio
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [pagosRes, planesRes, usuariosRes, artRes, clRes, ventasRes, visitasRes] = await Promise.all([
    supabase.from('pago').select('*').eq('negocio_id', id).order('fecha', { ascending: false }),
    supabase.from('plan').select('*').eq('activo', true).order('precio'),
    supabase.from('usuario').select('*').eq('tenant_id', n.tenant_id ?? '').eq('activo', true),
    supabase.from('articulo').select('*', { count: 'exact', head: true }).eq('negocio_id', id).eq('activo', true),
    supabase.from('cliente').select('*', { count: 'exact', head: true }).eq('negocio_id', id),
    supabase.from('venta').select('id, total').eq('negocio_id', id).gte('fecha', startOfMonth).neq('estado', 'cancelada'),
    supabase.from('visita').select('*', { count: 'exact', head: true }).eq('negocio_id', id).gte('fecha', startOfMonth),
  ])

  const listaPagos = (pagosRes.data ?? []) as Pago[]
  const listaPlanes = (planesRes.data ?? []) as PlanSaaS[]
  const usuarios = (usuariosRes.data ?? []) as Usuario[]
  const articulosCount = artRes.count ?? 0
  const clientesCount = clRes.count ?? 0
  const visitasMes = visitasRes.count ?? 0
  const ventasMes = ventasRes.data ?? []
  const ventasMesTotal = ventasMes.reduce((acc, v) => acc + Number(v.total), 0)

  const estadoEfectivo = getEstadoEfectivo(n)
  const diasProximoPago = n.proximopago
    ? Math.ceil((new Date(n.proximopago).getTime() - Date.now()) / 86_400_000)
    : null
  const totalCobrado = listaPagos
    .filter(p => p.estado === 'pagado')
    .reduce((acc, p) => acc + Number(p.monto), 0)
  const pagosConfirmados = listaPagos.filter(p => p.estado === 'pagado').length

  const owners = usuarios.filter(u => u.sub_rol === 'owner')
  const staff = usuarios.filter(u => u.sub_rol === 'manager' || u.sub_rol === 'staff')

  const usuariosLabel = usuarios.length === 0
    ? 'Sin usuarios'
    : [owners.length > 0 && `${owners.length} owner`, staff.length > 0 && `${staff.length} empl.`]
        .filter(Boolean).join(' · ')

  const diasUltimaActividad = n.ultima_actividad
    ? Math.floor((Date.now() - new Date(n.ultima_actividad).getTime()) / 86_400_000)
    : null

  const salud: { label: string; color: 'green' | 'amber' | 'red'; desc: string } =
    estadoEfectivo === 'vencido' || estadoEfectivo === 'suspendido'
      ? { label: 'En riesgo', color: 'red', desc: 'Pago vencido o cuenta suspendida.' }
      : diasUltimaActividad === null || diasUltimaActividad > 30
        ? { label: 'Inactivo', color: 'red', desc: 'Sin actividad registrada en más de 30 días.' }
        : articulosCount === 0 || ventasMes.length === 0
          ? { label: 'Poco uso', color: 'amber', desc: 'Sin productos cargados o sin ventas este mes.' }
          : { label: 'Saludable', color: 'green', desc: 'Activo y usando el sistema regularmente.' }

  const saludBadge = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
  }[salud.color]

  const saludDot = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
  }[salud.color]

  return (
    <div className="space-y-6">
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
              <span className="badge-blue">{n.plantipo}</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {n.rubro && <span>{n.rubro} · </span>}
              Cliente desde {new Date(n.fechacreacion).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <AccionesNegocio negocio={n} planes={listaPlanes} />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">MRR</p>
          <p className="text-xl font-bold text-slate-900">
            {n.preciomensual != null ? `$${Number(n.preciomensual).toLocaleString('es-AR')}` : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">por mes</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total cobrado</p>
          <p className="text-xl font-bold text-emerald-600">${totalCobrado.toLocaleString('es-AR')}</p>
          <p className="text-xs text-slate-400 mt-0.5">{pagosConfirmados} {pagosConfirmados === 1 ? 'pago' : 'pagos'}</p>
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
                ? `Venc. ${Math.abs(diasProximoPago)}d`
                : diasProximoPago === 0
                  ? 'Hoy'
                  : `En ${diasProximoPago}d`}
          </p>
          {n.proximopago && (
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(n.proximopago).toLocaleDateString('es-AR')}
            </p>
          )}
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ventas (mes)</p>
          <p className="text-xl font-bold text-blue-600">{ventasMes.length}</p>
          {ventasMes.length > 0 ? (
            <p className="text-xs text-slate-400 mt-0.5">${ventasMesTotal.toLocaleString('es-AR')}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">este mes</p>
          )}
        </div>
      </div>

      {/* Activity row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            icon: Activity,
            label: 'Última actividad',
            value: tiempoRelativo(n.ultima_actividad),
            sub: n.ultima_actividad
              ? new Date(n.ultima_actividad).toLocaleDateString('es-AR')
              : 'Sin actividad registrada',
          },
          {
            icon: Users,
            label: 'Usuarios',
            value: usuarios.length > 0 ? `${usuarios.length}` : '0',
            sub: usuariosLabel,
          },
          {
            icon: Package,
            label: 'Productos',
            value: articulosCount.toString(),
            sub: articulosCount === 0 ? 'Sin productos cargados' : 'activos',
          },
          {
            icon: ShoppingCart,
            label: 'Clientes',
            value: clientesCount.toString(),
            sub: clientesCount === 0 ? 'Sin clientes registrados' : 'registrados',
          },
          {
            icon: Eye,
            label: 'Visitantes (mes)',
            value: visitasMes.toString(),
            sub: n.slug ? `este mes en /p/${n.slug}` : 'Sin página pública',
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
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
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Razón social</dt>
                <dd className="text-slate-800 mt-0.5">{n.razonsocial ?? <span className="text-slate-400">No configurado</span>}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rubro</dt>
                <dd className="text-slate-800 mt-0.5">{n.rubro ?? <span className="text-slate-400">No configurado</span>}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</dt>
                <dd className="mt-0.5">
                  {n.email
                    ? <a href={`mailto:${n.email}`} className="text-blue-600 hover:text-blue-700 transition-colors">{n.email}</a>
                    : <span className="text-slate-400">No configurado</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dirección</dt>
                <dd className="text-slate-800 mt-0.5">{n.direccion ?? <span className="text-slate-400">No configurado</span>}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha de alta</dt>
                <dd className="text-slate-800 mt-0.5">{new Date(n.fechacreacion).toLocaleDateString('es-AR')}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Última actividad</dt>
                <dd className="text-slate-800 mt-0.5">
                  {n.ultima_actividad
                    ? <span title={new Date(n.ultima_actividad).toLocaleString('es-AR')}>{tiempoRelativo(n.ultima_actividad)}</span>
                    : <span className="text-slate-400">Sin actividad registrada</span>}
                </dd>
              </div>
            </dl>
          </div>

          {/* Historial de pagos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Historial de pagos</h2>
              {listaPagos.length > 0 && (
                <p className="text-xs text-slate-500">
                  {pagosConfirmados} pagados ·{' '}
                  <span className="font-semibold text-slate-700">${totalCobrado.toLocaleString('es-AR')}</span>
                </p>
              )}
            </div>
            {listaPagos.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-sm text-slate-400 mb-3">Sin pagos registrados aún</p>
                <p className="text-xs text-slate-400">Usá el botón <span className="font-medium text-emerald-600">Registrar pago</span> en la parte de arriba.</p>
              </div>
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
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <PaginaPublicaCard
            negocio={n}
            appUrl={process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}
          />

          {n.slug && <DominioCustomCard negocio={n} />}

          {/* Usuarios del negocio */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-blue-500" />
              <h2 className="font-semibold text-slate-900">Usuarios</h2>
              <span className="ml-auto text-xs text-slate-400">{usuarios.length} activos</span>
            </div>
            {usuarios.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Sin usuarios configurados</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {usuarios.map(u => (
                  <div key={u.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u.nombre}</p>
                      {u.username && <p className="text-xs text-slate-400">@{u.username}</p>}
                    </div>
                    <span className="badge-gray text-[10px] px-1.5 py-0.5">{u.rol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Salud del cliente */}
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-3">Salud del cliente</h2>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${saludBadge}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${saludDot}`} />
              {salud.label}
            </div>
            <p className="text-xs text-slate-500 mt-2">{salud.desc}</p>
            {salud.color !== 'green' && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-slate-500">
                {diasUltimaActividad !== null && diasUltimaActividad > 14 && (
                  <p>· Sin actividad hace {diasUltimaActividad} días</p>
                )}
                {articulosCount === 0 && <p>· No tiene productos cargados</p>}
                {ventasMes.length === 0 && <p>· Sin ventas este mes</p>}
                {estadoEfectivo === 'vencido' && diasProximoPago !== null && (
                  <p>· Pago vencido hace {Math.abs(diasProximoPago)} días</p>
                )}
              </div>
            )}
          </div>

          {/* Alertas */}
          {estadoEfectivo === 'vencido' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-800 mb-1">Pago vencido</p>
              <p className="text-xs text-red-600">
                Vencido hace {Math.abs(diasProximoPago!)} días. Usá "Registrar pago" para poner al día la cuenta.
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
