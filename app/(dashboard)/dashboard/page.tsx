import { createClient } from '@/lib/supabase/server'
import { ShoppingCart, Users, Package, TrendingUp, Clock, ArrowUpRight, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: usuario } = await supabase
    .from('usuario').select('*').eq('id', user!.id).single()

  const [ventas, clientes, articulos] = await Promise.all([
    supabase.from('venta').select('total, estado, fecha').eq('tenant_id', usuario.tenant_id),
    supabase.from('cliente').select('id, fecharegistro').eq('negocio_id', usuario.tenant_id),
    supabase.from('articulo').select('id, stock, stockminimo').eq('tenant_id', usuario.tenant_id).eq('activo', true),
  ])

  const totalVentas = ventas.data?.reduce((acc, v) => acc + Number(v.total), 0) ?? 0
  const ventasPendientes = ventas.data?.filter(v => v.estado === 'pendiente').length ?? 0
  const ventasEntregadas = ventas.data?.filter(v => v.estado === 'entregada').length ?? 0
  const stockBajo = articulos.data?.filter(a => (a.stock ?? 0) <= (a.stockminimo ?? 0)).length ?? 0

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const kpis = [
    {
      label: 'Ingresos totales',
      value: `$${totalVentas.toLocaleString('es-AR')}`,
      sub: `${ventas.data?.length ?? 0} operaciones`,
      icon: TrendingUp,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Clientes',
      value: String(clientes.data?.length ?? 0),
      sub: 'registrados',
      icon: Users,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: '+3',
      trendUp: true,
    },
    {
      label: 'Productos activos',
      value: String(articulos.data?.length ?? 0),
      sub: stockBajo > 0 ? `${stockBajo} con stock bajo` : 'stock en orden',
      icon: Package,
      iconBg: stockBajo > 0 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: stockBajo > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      trend: stockBajo > 0 ? `${stockBajo} alertas` : 'OK',
      trendUp: stockBajo === 0,
    },
    {
      label: 'Ventas pendientes',
      value: String(ventasPendientes),
      sub: `${ventasEntregadas} entregadas`,
      icon: Clock,
      iconBg: ventasPendientes > 0 ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-slate-800',
      iconColor: ventasPendientes > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-slate-500',
      trend: ventasPendientes > 0 ? 'Por entregar' : 'Al día',
      trendUp: ventasPendientes === 0,
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {saludo}, {usuario.nombre.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Resumen de tu negocio · {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.iconColor} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                ${kpi.trendUp ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                <ArrowUpRight size={10} className={kpi.trendUp ? '' : 'rotate-90'} />
                {kpi.trend}
              </span>
            </div>
            <div className="font-bold text-2xl text-gray-900 dark:text-white mb-0.5">{kpi.value}</div>
            <div className="text-sm text-gray-600 dark:text-slate-300">{kpi.label}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Panels row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity placeholder */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Actividad reciente</h2>
            <a href="/dashboard/ventas" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Ver todas <ArrowUpRight size={11} />
            </a>
          </div>
          <div className="space-y-3">
            {(ventas.data ?? []).slice(0, 5).map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <ShoppingCart size={13} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-800 dark:text-slate-200">Venta</div>
                    <div className="text-[11px] text-gray-400 dark:text-slate-500">
                      {new Date(v.fecha).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">${Number(v.total).toLocaleString('es-AR')}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                    ${v.estado === 'entregada' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      v.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {v.estado}
                  </span>
                </div>
              </div>
            ))}
            {(ventas.data?.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart size={28} className="text-gray-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-slate-500">Sin ventas registradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts / stock low */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Alertas de stock</h2>
            <a href="/dashboard/productos" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Ver productos <ArrowUpRight size={11} />
            </a>
          </div>
          {stockBajo > 0 ? (
            <div className="space-y-2">
              {articulos.data?.filter(a => (a.stock ?? 0) <= (a.stockminimo ?? 0)).slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                      <AlertCircle size={13} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-slate-300">Producto #{a.id.slice(0,8)}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                    Stock: {a.stock ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                <Package size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Stock en orden</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Todos los productos tienen stock suficiente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
