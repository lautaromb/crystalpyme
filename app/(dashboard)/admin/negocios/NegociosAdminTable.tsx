'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Pencil, Search, ChevronDown, Ban, CheckCircle } from 'lucide-react'
import EditNegocioModal from './EditNegocioModal'
import { cambiarEstadoNegocio } from './actions'
import type { Negocio, NegocioEstado, PlanSaaS } from '@/types'

function getEstadoEfectivo(n: Negocio): NegocioEstado | 'vencido' {
  if (n.estado === 'suspendido' || n.estado === 'inactive') return n.estado
  if (n.proximopago && new Date(n.proximopago) < new Date()) return 'vencido'
  return n.estado
}

function planBadgeClass(nombre: string): string {
  const n = nombre.toLowerCase()
  if (n === 'basic') return 'badge-gray'
  if (n === 'pro') return 'badge-blue'
  if (n === 'enterprise') return 'badge bg-purple-50 text-purple-700 border border-purple-200'
  return 'badge-blue'
}

const ESTADO_BADGE: Record<NegocioEstado | 'vencido', string> = {
  active: 'badge-green',
  trial: 'badge-yellow',
  inactive: 'badge-gray',
  suspendido: 'badge-red',
  vencido: 'badge-red',
}
const ESTADO_LABEL: Record<NegocioEstado | 'vencido', string> = {
  active: 'Activo',
  trial: 'Trial',
  inactive: 'Inactivo',
  suspendido: 'Suspendido',
  vencido: 'Vencido',
}

function paymentBadge(proximopago: string | null | undefined) {
  if (!proximopago) return null
  const diff = Math.ceil(
    (new Date(proximopago).getTime() - Date.now()) / 86_400_000
  )
  if (diff < 0) return <span className="badge-red text-[10px] px-1.5 py-0.5">Vencido</span>
  if (diff <= 7) return <span className="badge-yellow text-[10px] px-1.5 py-0.5">Próximo</span>
  return <span className="badge-green text-[10px] px-1.5 py-0.5">Al día</span>
}

const ESTADO_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'trial', label: 'Trial' },
  { value: 'inactive', label: 'Inactivos' },
  { value: 'suspendido', label: 'Suspendidos' },
]

interface Props {
  negocios: Negocio[]
  planes: PlanSaaS[]
}

export default function NegociosAdminTable({ negocios, planes }: Props) {
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [editando, setEditando] = useState<Negocio | null>(null)
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return negocios.filter(n => {
      const matchSearch =
        !q ||
        n.nombre.toLowerCase().includes(q) ||
        (n.email ?? '').toLowerCase().includes(q) ||
        (n.rubro ?? '').toLowerCase().includes(q)
      const matchEstado = !estadoFilter || n.estado === estadoFilter
      return matchSearch && matchEstado
    })
  }, [negocios, search, estadoFilter])

  function openEdit(n: Negocio) {
    setEditando(n)
    setModalEditOpen(true)
  }

  async function toggleSuspend(n: Negocio) {
    const nuevoEstado: NegocioEstado = n.estado === 'suspendido' ? 'active' : 'suspendido'
    setTogglingId(n.id)
    try {
      await cambiarEstadoNegocio(n.id, nuevoEstado)
    } catch {
      // silently ignore — the page will revalidate anyway
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Buscar por nombre, email o rubro…"
          />
        </div>
        {/* Estado filter */}
        <div className="relative">
          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value)}
            className="input pr-8 appearance-none cursor-pointer min-w-[140px]"
          >
            {ESTADO_FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Negocio</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Próx. pago</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Precio/mes</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                  No se encontraron negocios
                </td>
              </tr>
            ) : (
              filtered.map(n => (
                <tr key={n.id} className="hover:bg-blue-50/30 transition-colors duration-100">
                  {/* Nombre + rubro */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/negocios/${n.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {n.nombre}
                    </Link>
                    {n.rubro && (
                      <p className="text-xs text-slate-500 mt-0.5">{n.rubro}</p>
                    )}
                  </td>
                  {/* Email */}
                  <td className="px-4 py-3 text-slate-700">
                    {n.email ?? <span className="text-slate-400">—</span>}
                  </td>
                  {/* Plan badge */}
                  <td className="px-4 py-3">
                    <span className={planBadgeClass(n.plantipo)}>
                      {n.plantipo}
                    </span>
                  </td>
                  {/* Estado badge */}
                  <td className="px-4 py-3">
                    {(() => {
                      const e = getEstadoEfectivo(n)
                      return <span className={ESTADO_BADGE[e]}>{ESTADO_LABEL[e]}</span>
                    })()}
                  </td>
                  {/* Próximo pago */}
                  <td className="px-4 py-3">
                    {n.proximopago ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700">
                          {new Date(n.proximopago).toLocaleDateString('es-AR')}
                        </span>
                        {paymentBadge(n.proximopago)}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  {/* Precio */}
                  <td className="px-4 py-3 text-slate-700">
                    {n.preciomensual != null
                      ? `$${Number(n.preciomensual).toLocaleString('es-AR')}`
                      : <span className="text-slate-400">—</span>}
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(n)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                   bg-blue-50 text-blue-700 border border-blue-200
                                   hover:bg-blue-100 transition-colors duration-150"
                        title="Editar"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => toggleSuspend(n)}
                        disabled={togglingId === n.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                   border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                                   ${n.estado === 'suspendido'
                                     ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                     : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                        title={n.estado === 'suspendido' ? 'Activar' : 'Suspender'}
                      >
                        {togglingId === n.id
                          ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          : n.estado === 'suspendido'
                            ? <><CheckCircle size={12} /> Activar</>
                            : <><Ban size={12} /> Suspender</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-500 mt-2">
          Mostrando {filtered.length} de {negocios.length} negocios
        </p>
      )}

      {/* Edit Modal */}
      {editando && (
        <EditNegocioModal
          isOpen={modalEditOpen}
          onClose={() => { setModalEditOpen(false); setEditando(null) }}
          negocio={editando}
          planes={planes}
        />
      )}
    </>
  )
}
