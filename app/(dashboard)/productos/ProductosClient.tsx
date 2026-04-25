'use client'

import { useState, useTransition, useMemo } from 'react'
import { Package, Plus, Search, Pencil, Trash2, X, Loader2, ChevronDown } from 'lucide-react'
import type { Articulo, Categoria, Subcategoria } from '@/types'
import { crearProducto, actualizarProducto, eliminarProducto } from './actions'

interface Props {
  articulos: Articulo[]
  categorias: Categoria[]
  negocios: { id: string; nombre: string }[]
  isSuper: boolean
}

type FormState = {
  nombre: string
  descripcion: string
  precio: string
  stock: string
  stockminimo: string
  categoria_id: string
  subcategoria_ids: number[]
  negocio_id: string
}

const emptyForm = (negocioId: string): FormState => ({
  nombre: '', descripcion: '', precio: '', stock: '0',
  stockminimo: '', categoria_id: '', subcategoria_ids: [], negocio_id: negocioId,
})

export default function ProductosClient({ articulos, categorias, negocios, isSuper }: Props) {
  const [search, setSearch] = useState('')
  const [filterNegocio, setFilterNegocio] = useState('todos')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [editing, setEditing] = useState<Articulo | null>(null)
  const [creating, setCreating] = useState(false)

  const negocioMap = useMemo(() => new Map(negocios.map(n => [n.id, n.nombre])), [negocios])
  const categoriaMap = useMemo(() => new Map(categorias.map(c => [c.id, c])), [categorias])

  const filtered = useMemo(() => articulos.filter(a => {
    if (filterNegocio !== 'todos' && a.negocio_id !== filterNegocio) return false
    if (filterCategoria !== 'todas' && String(a.categoria_id) !== filterCategoria) return false
    if (search) {
      const s = search.toLowerCase()
      return a.nombre.toLowerCase().includes(s)
        || (a.codigo?.toLowerCase().includes(s) ?? false)
        || (a.subcategorias?.some(sc => sc.nombre.toLowerCase().includes(s)) ?? false)
    }
    return true
  }), [articulos, search, filterNegocio, filterCategoria])

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
        <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3 flex-wrap">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm shrink-0">Catálogo · {filtered.length}</h2>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <select
              value={filterCategoria}
              onChange={e => setFilterCategoria(e.target.value)}
              className="text-xs bg-gray-100 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-2.5 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.icono} {c.nombre}</option>)}
            </select>
            {isSuper && negocios.length > 1 && (
              <select
                value={filterNegocio}
                onChange={e => setFilterNegocio(e.target.value)}
                className="text-xs bg-gray-100 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-2.5 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
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
                placeholder="Buscar..."
                className="pl-8 pr-4 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 border border-transparent dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 h-8 w-44"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Package size={26} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {search || filterNegocio !== 'todos' || filterCategoria !== 'todas' ? 'Sin resultados' : 'Sin productos registrados'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">
              {search || filterNegocio !== 'todos' || filterCategoria !== 'todas' ? 'Probá con otros filtros' : 'Agregá tu primer producto al catálogo'}
            </p>
            {!search && filterNegocio === 'todos' && filterCategoria === 'todas' && (
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
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(a => {
                  const bajo = a.stockminimo != null && (a.stock ?? 0) <= a.stockminimo
                  const agotado = (a.stock ?? 0) === 0
                  const cat = a.categoria_id ? categoriaMap.get(a.categoria_id) : null
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5">
                            {a.codigo}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{a.nombre}</div>
                            {a.subcategorias && a.subcategorias.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {a.subcategorias.map((sc: Subcategoria) => (
                                  <span key={sc.id} className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    {sc.nombre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {isSuper && (
                        <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400">
                          {negocioMap.get(a.negocio_id) ?? '—'}
                        </td>
                      )}
                      <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400">
                        {cat ? <span>{cat.icono} {cat.nombre}</span> : <span className="text-gray-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900 dark:text-white text-sm tabular-nums">
                        ${Number(a.precio).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-sm font-semibold tabular-nums ${agotado ? 'text-red-500' : bajo ? 'text-amber-600' : 'text-gray-800 dark:text-slate-200'}`}>
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
                        <button onClick={() => setEditing(a)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600">
                          <Pencil size={14} />
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
        <ProductoModal mode="create" categorias={categorias} negocios={negocios} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <ProductoModal mode="edit" articulo={editing} categorias={categorias} negocios={negocios} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

function ProductoModal({ mode, articulo, categorias, negocios, onClose }: {
  mode: 'create' | 'edit'
  articulo?: Articulo
  categorias: Categoria[]
  negocios: { id: string; nombre: string }[]
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(() => articulo ? {
    nombre: articulo.nombre,
    descripcion: articulo.descripcion ?? '',
    precio: articulo.precio.toString(),
    stock: (articulo.stock ?? 0).toString(),
    stockminimo: (articulo.stockminimo ?? '').toString(),
    categoria_id: articulo.categoria_id ? String(articulo.categoria_id) : '',
    subcategoria_ids: articulo.subcategorias?.map(sc => sc.id) ?? [],
    negocio_id: articulo.negocio_id,
  } : emptyForm(negocios[0]?.id ?? ''))

  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const subcategoriasDisponibles = useMemo<Subcategoria[]>(() => {
    if (!form.categoria_id) return []
    const cat = categorias.find(c => c.id === Number(form.categoria_id))
    return cat?.subcategorias ?? []
  }, [form.categoria_id, categorias])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function toggleSubcategoria(id: number) {
    setForm(prev => ({
      ...prev,
      subcategoria_ids: prev.subcategoria_ids.includes(id)
        ? prev.subcategoria_ids.filter(s => s !== id)
        : [...prev.subcategoria_ids, id],
    }))
  }

  function handleCategoriaChange(val: string) {
    setForm(prev => ({ ...prev, categoria_id: val, subcategoria_ids: [] }))
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
        const payload = {
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          precio, stock, stockminimo,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
          subcategoria_ids: form.subcategoria_ids,
        }
        if (mode === 'create') {
          await crearProducto({ ...payload, negocio_id: form.negocio_id })
        } else if (articulo) {
          await actualizarProducto(articulo.id, payload)
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
      try { await eliminarProducto(articulo.id); onClose() }
      catch (e) { setError(e instanceof Error ? e.message : 'Error al eliminar') }
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
              <span className="text-xs font-mono text-gray-400">{articulo.codigo}</span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
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
              <label className="input-label flex items-center gap-1">
                Stock mínimo
                <span className="relative group/tip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 cursor-help">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-slate-800 text-white text-[11px] leading-snug px-3 py-2 opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg">
                    Cuando el stock llegue a este número o menos, el producto se marcará como <strong>Stock bajo</strong> para avisarte que es hora de reponer.
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                  </span>
                </span>
              </label>
              <input type="number" className="input" value={form.stockminimo} onChange={e => set('stockminimo', e.target.value)} placeholder="—" />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="input-label">Categoría</label>
            <div className="relative">
              <select
                className="input appearance-none pr-8"
                value={form.categoria_id}
                onChange={e => handleCategoriaChange(e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categorias.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.icono} {c.nombre}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Subcategorías */}
          {subcategoriasDisponibles.length > 0 && (
            <div>
              <label className="input-label">Subcategorías <span className="text-gray-400 font-normal">(podés elegir varias)</span></label>
              <div className="flex flex-wrap gap-2 mt-1">
                {subcategoriasDisponibles.map(sc => {
                  const selected = form.subcategoria_ids.includes(sc.id)
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => toggleSubcategoria(sc.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                        ${selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:border-blue-400'
                        }`}
                    >
                      {sc.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div>
              <label className="input-label">Negocio *</label>
              <select className="input" value={form.negocio_id} onChange={e => set('negocio_id', e.target.value)}>
                {negocios.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
          {mode === 'edit' ? (
            <button onClick={remove} disabled={pending} className="text-xs text-red-500 hover:text-red-700 font-semibold inline-flex items-center gap-1">
              <Trash2 size={12} /> Eliminar
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300">
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {pending && <Loader2 size={14} className="animate-spin" />}
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
