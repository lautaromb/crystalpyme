'use client'

import { useState, useTransition, useMemo } from 'react'
import { ShoppingCart, Plus, Filter, X, Loader2, Trash2, Search } from 'lucide-react'
import type { Articulo, Cliente } from '@/types'
import { crearVenta, actualizarEstadoVenta, eliminarVenta, type VentaItemInput } from './actions'

const ESTADO_STYLE: Record<string, string> = {
  entregada: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
  pendiente: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  cancelada: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
}

export interface VentaRow {
  id: string
  fecha: string
  total: number
  estado: 'pendiente' | 'entregada' | 'cancelada'
  notas: string | null
  negocio_id: string
  cliente: { nombre: string } | null
}

interface Props {
  ventas: VentaRow[]
  articulos: Articulo[]
  clientes: Cliente[]
  negocios: { id: string; nombre: string }[]
  isSuper: boolean
}

export default function VentasClient({ ventas, articulos, clientes, negocios, isSuper }: Props) {
  const [creating, setCreating] = useState(false)
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [filterNegocio, setFilterNegocio] = useState<string>('todos')

  const negocioMap = useMemo(() => new Map(negocios.map(n => [n.id, n.nombre])), [negocios])

  const filtered = useMemo(() => ventas.filter(v => {
    if (filterEstado !== 'todos' && v.estado !== filterEstado) return false
    if (filterNegocio !== 'todos' && v.negocio_id !== filterNegocio) return false
    return true
  }), [ventas, filterEstado, filterNegocio])

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Gestión de pedidos y facturación</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={16} /> Nueva venta
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-2 flex-wrap">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Listado · {filtered.length}</h2>
          <div className="flex items-center gap-2 ml-auto">
            {isSuper && negocios.length > 1 && (
              <select
                value={filterNegocio}
                onChange={e => setFilterNegocio(e.target.value)}
                className="text-xs bg-gray-100 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-2.5 py-1.5 font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
              >
                <option value="todos">Todos los negocios</option>
                {negocios.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            )}
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="text-xs bg-gray-100 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-2.5 py-1.5 font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="entregada">Entregadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <ShoppingCart size={26} className="text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {ventas.length === 0 ? 'Sin ventas registradas' : 'Sin resultados con esos filtros'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">
              {ventas.length === 0 ? 'Creá tu primera venta para comenzar' : 'Probá con otros filtros'}
            </p>
            {ventas.length === 0 && (
              <button onClick={() => setCreating(true)} className="btn-primary text-xs px-4 py-2 h-auto">
                <Plus size={14} /> Nueva venta
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Cliente</th>
                  {isSuper && <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Negocio</th>}
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Notas</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Total</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(v => (
                  <VentaRow
                    key={v.id}
                    venta={v}
                    negocioNombre={negocioMap.get(v.negocio_id)}
                    isSuper={isSuper}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && (
        <NuevaVentaModal
          articulos={articulos}
          clientes={clientes}
          negocios={negocios}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  )
}

function VentaRow({ venta, negocioNombre, isSuper }: {
  venta: VentaRow
  negocioNombre?: string
  isSuper: boolean
}) {
  const [pending, start] = useTransition()
  const [estado, setEstado] = useState(venta.estado)

  function changeEstado(next: typeof estado) {
    setEstado(next)
    start(async () => {
      try { await actualizarEstadoVenta(venta.id, next) } catch { setEstado(venta.estado) }
    })
  }

  function remove() {
    if (!confirm('¿Cancelar esta venta? Se restituirá el stock.')) return
    start(async () => { try { await eliminarVenta(venta.id) } catch {} })
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group">
      <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
        {new Date(venta.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-6 py-3.5">
        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
          {venta.cliente?.nombre ?? '—'}
        </span>
      </td>
      {isSuper && (
        <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400">
          {negocioNombre ?? '—'}
        </td>
      )}
      <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-slate-500 max-w-xs truncate">
        {venta.notas ?? '—'}
      </td>
      <td className="px-6 py-3.5 text-right">
        <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          ${Number(venta.total).toLocaleString('es-AR')}
        </span>
      </td>
      <td className="px-6 py-3.5 text-center">
        <select
          value={estado}
          onChange={e => changeEstado(e.target.value as typeof estado)}
          disabled={pending}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${ESTADO_STYLE[estado]} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
        >
          <option value="pendiente">pendiente</option>
          <option value="entregada">entregada</option>
          <option value="cancelada">cancelada</option>
        </select>
      </td>
      <td className="px-6 py-3.5 text-right">
        <button
          onClick={remove}
          disabled={pending}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
          title="Cancelar venta"
        >
          <Trash2 size={14}/>
        </button>
      </td>
    </tr>
  )
}

/* ── Nueva venta modal ──────────────────────────────────── */
function NuevaVentaModal({ articulos, clientes, negocios, onClose }: {
  articulos: Articulo[]
  clientes: Cliente[]
  negocios: { id: string; nombre: string }[]
  onClose: () => void
}) {
  const [negocioId, setNegocioId] = useState(negocios[0]?.id ?? '')
  const [clienteId, setClienteId] = useState('')
  const [estado, setEstado] = useState<'pendiente' | 'entregada' | 'cancelada'>('pendiente')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<VentaItemInput[]>([])
  const [search, setSearch] = useState('')
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const articulosNeg = useMemo(
    () => articulos.filter(a => a.negocio_id === negocioId && a.activo),
    [articulos, negocioId],
  )
  const articulosFiltered = useMemo(() => {
    if (!search) return articulosNeg.slice(0, 8)
    const s = search.toLowerCase()
    return articulosNeg.filter(a =>
      a.nombre.toLowerCase().includes(s) || a.codigo.toLowerCase().includes(s)
    ).slice(0, 8)
  }, [articulosNeg, search])

  const clientesNeg = useMemo(
    () => clientes.filter(c => c.negocio_id === negocioId),
    [clientes, negocioId],
  )

  const total = items.reduce((a, it) => a + it.precio * it.cantidad, 0)

  function addItem(a: Articulo) {
    setItems(prev => {
      const existing = prev.find(it => it.articulo_id === a.id)
      if (existing) {
        return prev.map(it => it.articulo_id === a.id ? { ...it, cantidad: it.cantidad + 1 } : it)
      }
      return [...prev, { articulo_id: a.id, nombre: a.nombre, precio: Number(a.precio), cantidad: 1 }]
    })
    setSearch('')
  }

  function removeItem(articuloId: string) {
    setItems(prev => prev.filter(it => it.articulo_id !== articuloId))
  }

  function setCantidad(articuloId: string, cantidad: number) {
    if (cantidad <= 0) { removeItem(articuloId); return }
    setItems(prev => prev.map(it => it.articulo_id === articuloId ? { ...it, cantidad } : it))
  }

  function submit() {
    setError(null)
    if (!negocioId) { setError('Elegí un negocio'); return }
    if (!clienteId) { setError('Elegí un cliente'); return }
    if (items.length === 0) { setError('Agregá al menos un producto'); return }

    start(async () => {
      try {
        await crearVenta({
          negocio_id: negocioId,
          cliente_id: clienteId,
          notas: notas || null,
          estado,
          items,
        })
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al crear la venta')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nueva venta</h3>
            <p className="text-xs text-slate-400">El stock se descuenta automáticamente</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="input-label">Negocio</label>
              <select className="input" value={negocioId} onChange={e => { setNegocioId(e.target.value); setItems([]); setClienteId('') }}>
                {negocios.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Estado</label>
              <select className="input" value={estado} onChange={e => setEstado(e.target.value as typeof estado)}>
                <option value="pendiente">Pendiente</option>
                <option value="entregada">Entregada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Cliente</label>
            {clientesNeg.length > 0 ? (
              <select className="input" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                <option value="">— elegí cliente —</option>
                {clientesNeg.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            ) : (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 rounded-lg">
                No hay clientes en este negocio. Creá uno desde Clientes primero.
              </p>
            )}
          </div>

          {/* Productos picker */}
          <div>
            <label className="input-label">Agregar productos</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={articulosNeg.length === 0 ? 'No hay productos en este negocio' : 'Buscar producto por nombre o código...'}
                disabled={articulosNeg.length === 0}
                className="input pl-9"
              />
            </div>
            {articulosFiltered.length > 0 && (search || articulosFiltered.length > 0) && (
              <div className="mt-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-1 max-h-44 overflow-y-auto border border-gray-100 dark:border-slate-700">
                {articulosFiltered.map(a => (
                  <button
                    key={a.id}
                    onClick={() => addItem(a)}
                    disabled={(a.stock ?? 0) <= 0}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white dark:hover:bg-slate-800 rounded-md text-left disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{a.nombre}</p>
                      <p className="text-[11px] text-slate-400">{a.codigo} · stock {a.stock ?? 0}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      ${Number(a.precio).toLocaleString('es-AR')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Items · {items.length}</p>
              {items.map(it => (
                <div key={it.articulo_id} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2">
                  <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{it.nombre}</p>
                  <input
                    type="number"
                    value={it.cantidad}
                    min={1}
                    onChange={e => setCantidad(it.articulo_id, Number(e.target.value))}
                    className="w-16 text-center text-sm rounded bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-2 py-1 tabular-nums"
                  />
                  <span className="text-sm text-slate-400 tabular-nums">×</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums w-20 text-right">
                    ${Number(it.precio).toLocaleString('es-AR')}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums w-24 text-right">
                    ${(it.precio * it.cantidad).toLocaleString('es-AR')}
                  </span>
                  <button onClick={() => removeItem(it.articulo_id)} className="text-slate-300 hover:text-red-500">
                    <X size={14}/>
                  </button>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="input-label">Notas (opcional)</label>
            <textarea className="input resize-none" rows={2} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones, forma de pago, etc." />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
          >
            {pending && <Loader2 size={14} className="animate-spin"/>}
            Crear venta
          </button>
        </div>
      </div>
    </div>
  )
}
