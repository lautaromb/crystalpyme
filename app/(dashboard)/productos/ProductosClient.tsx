'use client'

import { useState, useTransition, useMemo } from 'react'
import { Package, Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import type { Articulo } from '@/types'
import { crearProducto, actualizarProducto, eliminarProducto } from './actions'

interface Props {
  articulos: Articulo[]
  negocios: { id: string; nombre: string }[]
  isSuper: boolean
}

type FormState = {
  nombre: string
  descripcion: string
  precio: string
  stock: string
  stockminimo: string
  categoria: string
  negocio_id: string
}

const emptyForm = (negocioId: string): FormState => ({
  nombre: '', descripcion: '', precio: '', stock: '0',
  stockminimo: '', categoria: '', negocio_id: negocioId,
})

export default function ProductosClient({ articulos, negocios, isSuper }: Props) {
  const [search, setSearch] = useState('')
  const [filterNegocio, setFilterNegocio] = useState<string>('todos')
  const [editing, setEditing] = useState<Articulo | null>(null)
  const [creating, setCreating] = useState(false)

  const negocioMap = useMemo(() => new Map(negocios.map(n => [n.id, n.nombre])), [negocios])

  const filtered = useMemo(() => articulos.filter(a => {
    if (filterNegocio !== 'todos' && a.negocio_id !== filterNegocio) return false
    if (search) {
      const s = search.toLowerCase()
      return a.nombre.toLowerCase().includes(s)
        || a.codigo.toLowerCase().includes(s)
        || (a.categoria?.toLowerCase().includes(s) ?? false)
    }
    return true
  }), [articulos, search, filterNegocio])

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Inventario y catálogo de artículos</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3 flex-wrap">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Catálogo · {filtered.length}</h2>
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
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="pl-8 pr-4 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 border border-transparent dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 h-8 w-52"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Package size={26} className="text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {search || filterNegocio !== 'todos' ? 'Sin resultados' : 'Sin productos registrados'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">
              {search || filterNegocio !== 'todos' ? 'Probá con otros filtros' : 'Agregá tu primer producto al catálogo'}
            </p>
            {!search && filterNegocio === 'todos' && (
              <button onClick={() => setCreating(true)} className="btn-primary text-xs px-4 py-2 h-auto">
                <Plus size={14} /> Nuevo producto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Nombre</th>
                  {isSuper && <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Negocio</th>}
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Categoría</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Precio</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Stock</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(a => {
                  const bajo = a.stockminimo != null && (a.stock ?? 0) <= a.stockminimo
                  const agotado = (a.stock ?? 0) === 0
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 shrink-0">
                            {a.codigo}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{a.nombre}</div>
                            {a.descripcion && (
                              <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">{a.descripcion}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {isSuper && (
                        <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400">
                          {negocioMap.get(a.negocio_id) ?? '—'}
                        </td>
                      )}
                      <td className="px-6 py-3.5">
                        {a.categoria ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                            {a.categoria}
                          </span>
                        ) : <span className="text-xs text-gray-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900 dark:text-white text-sm tabular-nums">
                        ${Number(a.precio).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-sm font-semibold tabular-nums ${agotado ? 'text-red-500 dark:text-red-400' : bajo ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-slate-200'}`}>
                          {a.stock ?? 0}
                        </span>
                        {a.stockminimo != null && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">/ mín {a.stockminimo}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${agotado ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700' :
                            bajo ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'}`}>
                          {agotado ? 'Sin stock' : bajo ? 'Stock bajo' : 'Disponible'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setEditing(a)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil size={14}/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && (
        <ProductoModal mode="create" negocios={negocios} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <ProductoModal mode="edit" articulo={editing} negocios={negocios} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

function ProductoModal({ mode, articulo, negocios, onClose }: {
  mode: 'create' | 'edit'
  articulo?: Articulo
  negocios: { id: string; nombre: string }[]
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(() => articulo ? {
    nombre: articulo.nombre,
    descripcion: articulo.descripcion ?? '',
    precio: articulo.precio.toString(),
    stock: (articulo.stock ?? 0).toString(),
    stockminimo: (articulo.stockminimo ?? '').toString(),
    categoria: articulo.categoria ?? '',
    negocio_id: articulo.negocio_id,
  } : emptyForm(negocios[0]?.id ?? ''))
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function submit() {
    setError(null)
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.negocio_id) { setError('Elegí un negocio'); return }
    const precio = Number(form.precio)
    if (Number.isNaN(precio) || precio < 0) { setError('Precio inválido'); return }
    const stock = form.stock === '' ? 0 : Number(form.stock)
    if (Number.isNaN(stock)) { setError('Stock inválido'); return }
    const stockminimo = form.stockminimo === '' ? null : Number(form.stockminimo)
    if (stockminimo != null && Number.isNaN(stockminimo)) { setError('Stock mínimo inválido'); return }

    start(async () => {
      try {
        if (mode === 'create') {
          await crearProducto({
            nombre: form.nombre, descripcion: form.descripcion || null,
            precio, stock, stockminimo,
            categoria: form.categoria || null,
            negocio_id: form.negocio_id,
          })
        } else if (articulo) {
          await actualizarProducto(articulo.id, {
            nombre: form.nombre, descripcion: form.descripcion || null,
            precio, stock, stockminimo,
            categoria: form.categoria || null,
          })
        }
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  function remove() {
    if (!articulo) return
    if (!confirm(`¿Eliminar "${articulo.nombre}"?`)) return
    start(async () => {
      try {
        await eliminarProducto(articulo.id)
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al eliminar')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
            </h3>
            {mode === 'edit' && articulo && (
              <span className="text-xs font-mono text-gray-400 dark:text-slate-500">{articulo.codigo}</span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="input-label">Nombre *</label>
            <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} autoFocus />
          </div>

          <div>
            <label className="input-label">Descripción</label>
            <textarea className="input resize-none" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="input-label">Precio *</label>
              <input type="number" className="input" value={form.precio} onChange={e => set('precio', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="input-label">Stock</label>
              <input type="number" className="input" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Stock mínimo</label>
              <input type="number" className="input" value={form.stockminimo} onChange={e => set('stockminimo', e.target.value)} placeholder="—" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="input-label">Categoría</label>
              <input className="input" value={form.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Opcional" />
            </div>
            {mode === 'create' && (
              <div>
                <label className="input-label">Negocio *</label>
                <select className="input" value={form.negocio_id} onChange={e => set('negocio_id', e.target.value)}>
                  {negocios.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
          {mode === 'edit' ? (
            <button onClick={remove} disabled={pending} className="text-xs text-red-500 hover:text-red-700 font-semibold inline-flex items-center gap-1">
              <Trash2 size={12}/> Eliminar
            </button>
          ) : <span/>}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300">
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {pending && <Loader2 size={14} className="animate-spin"/>}
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
