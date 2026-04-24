import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Building2, TrendingUp, AlertTriangle, Clock,
  ArrowUpRight, ShoppingCart, Users, Package, CreditCard, UserCheck,
} from 'lucide-react'
import NegociosTable from './NegociosTable'

function getEstadoPago(proximopago: string | null | undefined) {
  if (!proximopago) return 'sin-fecha'
  const hoy = new Date()
  const pago = new Date(proximopago)
  const dias = Math.ceil((pago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 0) return 'vencido'
  if (dias <= 7) return 'proximo'
  return 'al-dia'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: usuario } = await supabase
    .from('usuario').select('*').eq('id', user!.id).single()

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const fechaHoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // ─── Vista de Admin / Vendedor ────────────────────────────────────────────
  if (usuario.rol !== 'superadmin') {
    const [ventas, clientes, articulos] = await Promise.all([
      supabase.from('venta').select('total, estado, fecha').eq('tenant_id', usuario.tenant_id),
      supabase.from('cliente').select('id').eq('negocio_id', usuario.tenant_id),
      supabase.from('articulo').select('id, stock, stockminimo').eq('tenant_id', usuario.tenant_id).eq('activo', true),
    ])

    const totalVentas = ventas.data?.reduce((acc, v) => acc + Number(v.total), 0) ?? 0
    const ventasPendientes = ventas.data?.filter(v => v.estado === 'pendiente').length ?? 0
    const ventasEntregadas = ventas.data?.filter(v => v.estado === 'entregada').length ?? 0
    const stockBajo = articulos.data?.filter(a => (a.stock ?? 0) <= (a.stockminimo ?? 0)).length ?? 0

    return (
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {saludo}, {usuario.nombre.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Resumen de tu negocio · {fechaHoy}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Ingresos totales', value: `$${totalVentas.toLocaleString('es-AR')}`, sub: `${ventas.data?.length ?? 0} operaciones`, icon: TrendingUp, color: 'blue' },
            { label: 'Clientes', value: String(clientes.data?.length ?? 0), sub: 'registrados', icon: Users, color: 'emerald' },
            { label: 'Productos activos', value: String(articulos.data?.length ?? 0), sub: stockBajo > 0 ? `${stockBajo} con stock bajo` : 'stock en orden', icon: Package, color: stockBajo > 0 ? 'amber' : 'emerald' },
            { label: 'Ventas pendientes', value: String(ventasPendientes), sub: `${ventasEntregadas} entregadas`, icon: Clock, color: ventasPendientes > 0 ? 'orange' : 'gray' },
          ].map(kpi => (
            <div key={kpi.label} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg bg-${kpi.color}-50 flex items-center justify-center`}>
                  <kpi.icon size={18} className={`text-${kpi.color}-600`} />
                </div>
                <span className="text-sm text-gray-500">{kpi.label}</span>
              </div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white">{kpi.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Ventas recientes</h2>
            <a href="/dashboard/ventas" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todas <ArrowUpRight size={11} />
            </a>
          </div>
          <div className="space-y-2">
            {(ventas.data ?? []).slice(0, 5).map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <ShoppingCart size={13} className="text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">{new Date(v.fecha).toLocaleDateString('es-AR')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-900">${Number(v.total).toLocaleString('es-AR')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${v.estado === 'entregada' ? 'bg-emerald-50 text-emerald-700' : v.estado === 'pendiente' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                    {v.estado}
                  </span>
                </div>
              </div>
            ))}
            {(ventas.data?.length ?? 0) === 0 && (
              <p className="text-sm text-center text-gray-400 py-6">Sin ventas registradas</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── Vista de Superadmin ──────────────────────────────────────────────────
  const primerDiaMes = new Date()
  primerDiaMes.setDate(1)
  primerDiaMes.setHours(0, 0, 0, 0)

  const [negociosRes, usuariosRes] = await Promise.all([
    supabase
      .from('negocio')
      .select('id, nombre, rubro, estado, preciomensual, proximopago, plantipo, fechacreacion')
      .order('proximopago', { ascending: true }),
    supabase
      .from('usuario')
      .select('id', { count: 'exact' })
      .eq('activo', true)
      .is('deleted_at', null),
  ])

  const hoy = new Date()
  const en7dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)
  const todos = negociosRes.data ?? []

  const activos = todos.filter(n => n.estado === 'active')
  const trials = todos.filter(n => n.estado === 'trial')
  const vencidos = todos.filter(n => n.proximopago && new Date(n.proximopago) < hoy)
  const proximos7 = todos.filter(n => {
    if (!n.proximopago) return false
    const pago = new Date(n.proximopago)
    return pago >= hoy && pago <= en7dias
  })
  const nuevosEsteMes = todos.filter(n => new Date(n.fechacreacion) >= primerDiaMes)
  const mrr = activos.reduce((acc, n) => acc + (n.preciomensual ?? 0), 0)
  const usuariosActivos = usuariosRes.count ?? 0

  const porPlan = todos.reduce((acc, n) => {
    acc[n.plantipo] = (acc[n.plantipo] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const alertas = [
    ...vencidos,
    ...proximos7.filter(n => !vencidos.find(v => v.id === n.id)),
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {saludo}, {usuario.nombre.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Panel de administración · {fechaHoy}
        </p>
      </div>

      {/* KPI Cards — 6 tarjetas en 2 filas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">MRR</span>
          </div>
          <div className="font-bold text-2xl text-gray-900">${mrr.toLocaleString('es-AR')}</div>
          <div className="text-xs text-gray-400 mt-0.5">{activos.length} suscriptores activos</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Building2 size={18} className="text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Negocios activos</span>
          </div>
          <div className="font-bold text-2xl text-gray-900">{activos.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">de {todos.length} totales</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">En trial</span>
          </div>
          <div className="font-bold text-2xl text-gray-900">{trials.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">períodos de prueba activos</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${vencidos.length > 0 ? 'bg-red-50' : 'bg-gray-100'}`}>
              <CreditCard size={18} className={vencidos.length > 0 ? 'text-red-600' : 'text-gray-400'} />
            </div>
            <span className="text-sm text-gray-500">Pagos vencidos</span>
          </div>
          <div className={`font-bold text-2xl ${vencidos.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {vencidos.length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {proximos7.length > 0 ? `${proximos7.length} vencen en 7 días` : 'todos al día'}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
              <UserCheck size={18} className="text-sky-600" />
            </div>
            <span className="text-sm text-gray-500">Usuarios activos</span>
          </div>
          <div className="font-bold text-2xl text-gray-900">{usuariosActivos}</div>
          <div className="text-xs text-gray-400 mt-0.5">en toda la plataforma</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${nuevosEsteMes.length > 0 ? 'bg-violet-50' : 'bg-gray-100'}`}>
              <Building2 size={18} className={nuevosEsteMes.length > 0 ? 'text-violet-600' : 'text-gray-400'} />
            </div>
            <span className="text-sm text-gray-500">Nuevos este mes</span>
          </div>
          <div className={`font-bold text-2xl ${nuevosEsteMes.length > 0 ? 'text-violet-600' : 'text-gray-900'}`}>
            {nuevosEsteMes.length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">negocios registrados</div>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              {vencidos.length > 0 ? `${vencidos.length} pago${vencidos.length > 1 ? 's' : ''} vencido${vencidos.length > 1 ? 's' : ''}` : ''}
              {vencidos.length > 0 && proximos7.length > 0 ? ' · ' : ''}
              {proximos7.length > 0 ? `${proximos7.length} vence${proximos7.length > 1 ? 'n' : ''} en los próximos 7 días` : ''}
            </span>
          </div>
          <div className="space-y-2">
            {alertas.slice(0, 5).map(n => {
              const estado = getEstadoPago(n.proximopago)
              return (
                <Link
                  key={n.id}
                  href={`/admin/negocios/${n.id}`}
                  className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-amber-100 hover:border-amber-300 hover:shadow-sm transition-all"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">{n.nombre}</span>
                    {n.rubro && <span className="text-xs text-gray-400 ml-2">{n.rubro}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {n.proximopago ? new Date(n.proximopago).toLocaleDateString('es-AR') : '—'}
                    </span>
                    {estado === 'vencido'
                      ? <span className="badge-red">Vencido</span>
                      : <span className="badge-yellow">Próximo</span>}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabla de negocios + distribución por plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <NegociosTable negocios={todos} />
        </div>

        {/* Distribución por plan */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Distribución por plan</h2>
          <div className="space-y-3">
            {(['enterprise', 'pro', 'basic'] as const).map(plan => {
              const count = porPlan[plan] ?? 0
              const pct = todos.length > 0 ? Math.round((count / todos.length) * 100) : 0
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{plan}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${plan === 'enterprise' ? 'bg-blue-500' : plan === 'pro' ? 'bg-emerald-500' : 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="divider" />

          <div className="space-y-2">
            {[
              { label: 'Total negocios', value: todos.length, color: 'text-gray-900' },
              { label: 'Activos', value: activos.length, color: 'text-emerald-600' },
              { label: 'En trial', value: trials.length, color: 'text-amber-600' },
              { label: 'Inactivos', value: todos.filter(n => n.estado === 'inactive').length, color: 'text-gray-400' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{row.label}</span>
                <span className={`font-semibold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
