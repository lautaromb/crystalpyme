'use client'

import { useState, useTransition, useMemo } from 'react'
import { ArrowUpRight, CheckCircle2, ChevronUp, ChevronDown, ChevronsUpDown, Search, SlidersHorizontal, Plus } from 'lucide-react'
import { marcarPagoRecibido } from './actions'
import NuevoClienteModal from './NuevoClienteModal'

type Negocio = {
  id: string
  nombre: string
  rubro?: string | null
  estado: string
  preciomensual?: number | null
  proximopago?: string | null
  plantipo: string
  fechacreacion: string
}

type SortKey = 'nombre' | 'proximopago' | 'preciomensual' | 'estado'
type SortDir = 'asc' | 'desc'

function getEstadoPago(proximopago: string | null | undefined) {
  if (!proximopago) return 'sin-fecha'
  const hoy = new Date()
  const pago = new Date(proximopago)
  const dias = Math.ceil((pago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 0) return 'vencido'
  if (dias <= 7) return 'proximo'
  return 'al-dia'
}

function BadgePago({ proximopago }: { proximopago: string | null | undefined }) {
  const estado = getEstadoPago(proximopago)
  if (estado === 'vencido') return <span className="badge-red">Vencido</span>
  if (estado === 'proximo') return <span className="badge-yellow">Próximo</span>
  if (estado === 'al-dia') return <span className="badge-green">Al día</span>
  return <span className="badge-gray">Sin fecha</span>
}

function BadgePlan({ plan }: { plan: string }) {
  if (plan === 'enterprise') return <span className="badge-blue">Enterprise</span>
  if (plan === 'pro') return <span className="badge-green">Pro</span>
  return <span className="badge-gray">{plan}</span>
}

function BadgeEstado({ estado }: { estado: string }) {
  if (estado === 'active') return <span className="badge-green">Activo</span>
  if (estado === 'trial') return <span className="badge-yellow">Trial</span>
  return <span className="badge-gray">Inactivo</span>
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={12} className="text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="text-blue-500" />
    : <ChevronDown size={12} className="text-blue-500" />
}

export default function NegociosTable({ negocios }: { negocios: Negocio[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroPlan, setFiltroPlan] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [sortKey, setSortKey] = useState<SortKey>('proximopago')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [pendingId, startTransition] = useTransition()
  const [procesando, setProcesando] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const datos = useMemo(() => {
    let resultado = negocios

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter(n =>
        n.nombre.toLowerCase().includes(q) || (n.rubro ?? '').toLowerCase().includes(q)
      )
    }
    if (filtroPlan !== 'todos') resultado = resultado.filter(n => n.plantipo === filtroPlan)
    if (filtroEstado !== 'todos') resultado = resultado.filter(n => n.estado === filtroEstado)

    resultado = [...resultado].sort((a, b) => {
      let va: string | number = ''
      let vb: string | number = ''
      if (sortKey === 'nombre') { va = a.nombre; vb = b.nombre }
      else if (sortKey === 'proximopago') { va = a.proximopago ?? '9999'; vb = b.proximopago ?? '9999' }
      else if (sortKey === 'preciomensual') { va = a.preciomensual ?? 0; vb = b.preciomensual ?? 0 }
      else if (sortKey === 'estado') { va = a.estado; vb = b.estado }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return resultado
  }, [negocios, busqueda, filtroPlan, filtroEstado, sortKey, sortDir])

  const handleMarcarPago = (n: Negocio) => {
    if (confirmando === n.id) {
      setProcesando(n.id)
      setConfirmando(null)
      startTransition(async () => {
        await marcarPagoRecibido(n.id, n.proximopago ?? null)
        setProcesando(null)
      })
    } else {
      setConfirmando(n.id)
      setTimeout(() => setConfirmando(prev => prev === n.id ? null : prev), 3000)
    }
  }

  return (
    <>
    <NuevoClienteModal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 py-2 text-xs"
            placeholder="Buscar por nombre o rubro..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select
            className="input py-2 text-xs w-auto"
            value={filtroPlan}
            onChange={e => setFiltroPlan(e.target.value)}
          >
            <option value="todos">Todos los planes</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            className="input py-2 text-xs w-auto"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="trial">Trial</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <a href="/admin/negocios" className="text-xs text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap">
            Gestionar <ArrowUpRight size={11} />
          </a>
          <button
            onClick={() => setModalAbierto(true)}
            className="btn-primary py-2 px-3 text-xs"
          >
            <Plus size={13} /> Nuevo cliente
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {([
                { key: 'nombre', label: 'Negocio' },
                { key: 'estado', label: 'Estado' },
              ] as { key: SortKey; label: string }[]).map(col => (
                <th
                  key={col.key}
                  className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort('proximopago')}
              >
                <span className="flex items-center gap-1">
                  Próximo pago
                  <SortIcon col="proximopago" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort('preciomensual')}
              >
                <span className="flex items-center justify-end gap-1">
                  $/mes
                  <SortIcon col="preciomensual" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {datos.map((n, i) => (
              <tr
                key={n.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === datos.length - 1 ? 'border-0' : ''}`}
              >
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">{n.nombre}</div>
                  {n.rubro && <div className="text-xs text-gray-400">{n.rubro}</div>}
                </td>
                <td className="px-6 py-3"><BadgeEstado estado={n.estado} /></td>
                <td className="px-4 py-3"><BadgePlan plan={n.plantipo} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs">
                      {n.proximopago ? new Date(n.proximopago).toLocaleDateString('es-AR') : '—'}
                    </span>
                    <BadgePago proximopago={n.proximopago} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {n.preciomensual ? `$${Number(n.preciomensual).toLocaleString('es-AR')}` : '—'}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleMarcarPago(n)}
                    disabled={procesando === n.id}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all
                      ${confirmando === n.id
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <CheckCircle2 size={13} />
                    {procesando === n.id ? 'Guardando...' : confirmando === n.id ? '¿Confirmar?' : 'Marcar pago'}
                  </button>
                </td>
              </tr>
            ))}
            {datos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                  No hay negocios que coincidan con los filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {datos.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
          {datos.length} de {negocios.length} negocios
        </div>
      )}
    </div>
    </>
  )
}
