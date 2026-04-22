import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, UserX, Plus, Search, Mail, Phone } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: usuario } = await supabase.from('usuario').select('*').eq('id', user!.id).single()

  const { data: clientes } = await supabase
    .from('cliente')
    .select('*')
    .eq('negocio_id', usuario.tenant_id)
    .order('nombre')

  const activos = clientes?.filter(c => c.estado === 'active') ?? []
  const inactivos = clientes?.filter(c => c.estado === 'inactive') ?? []

  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  const nuevosEsteMes = clientes?.filter(c => (c.fecharegistro ?? c.created_at ?? '') >= inicioMes).length ?? 0

  const kpis = [
    { label: 'Total clientes', value: String(clientes?.length ?? 0), sub: 'registrados', icon: Users, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Activos', value: String(activos.length), sub: 'habilitados', icon: UserCheck, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Inactivos', value: String(inactivos.length), sub: 'deshabilitados', icon: UserX, bg: inactivos.length > 0 ? 'bg-gray-100 dark:bg-slate-700' : 'bg-gray-50 dark:bg-slate-700', color: 'text-gray-400 dark:text-slate-400' },
    { label: 'Nuevos este mes', value: String(nuevosEsteMes), sub: 'incorporados', icon: Users, bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Gestión de tu cartera de clientes</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon size={18} className={k.color} />
            </div>
            <div className="font-bold text-xl text-gray-900 dark:text-white">{k.value}</div>
            <div className="text-xs text-gray-600 dark:text-slate-300 font-medium">{k.label}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Listado de clientes</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="pl-8 pr-4 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 border border-transparent dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 h-8 w-52"
            />
          </div>
        </div>

        {(clientes?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Users size={26} className="text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Sin clientes registrados</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">Agregá tu primer cliente para comenzar</p>
            <button className="btn-primary text-xs px-4 py-2 h-auto">
              <Plus size={14} /> Nuevo cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Contacto</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Dirección</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Registro</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {clientes?.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                          <span className="text-blue-700 dark:text-blue-300 font-semibold text-xs">{c.nombre.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="space-y-0.5">
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                            <Mail size={11} /> {c.email}
                          </div>
                        )}
                        {c.telefono && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                            <Phone size={11} /> {c.telefono}
                          </div>
                        )}
                        {!c.email && !c.telefono && <span className="text-xs text-gray-300 dark:text-slate-600">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate">
                      {c.direccion ?? '—'}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                      {new Date(c.fecharegistro ?? c.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${c.estado === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                          : 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'}`}>
                        {c.estado === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
