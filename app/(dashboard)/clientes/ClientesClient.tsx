'use client'

import { useState, useTransition, useMemo } from 'react'
import { Users, Plus, Search, Mail, Phone, X, Loader2, Pencil, Trash2 } from 'lucide-react'
import type { Cliente } from '@/types'
import { crearCliente, actualizarCliente, eliminarCliente } from './actions'

interface Props {
  clientes: Cliente[]
  negocios: { id: string; nombre: string }[]
  isSuper: boolean
}

export default function ClientesClient({ clientes, negocios, isSuper }: Props) {
  const [search, setSearch] = useState('')
  const [filterNegocio, setFilterNegocio] = useState<string>('todos')
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [creating, setCreating] = useState(false)

  const negocioMap = useMemo(() => new Map(negocios.map(n => [n.id, n.nombre])), [negocios])

  const filtered = useMemo(() => clientes.filter(c => {
    if (filterNegocio !== 'todos' && c.negocio_id !== filterNegocio) return false
    if (search) {
      const s = search.toLowerCase()
      return c.nombre.toLowerCase().includes(s)
        || (c.email?.toLowerCase().includes(s) ?? false)
        || (c.telefono?.includes(search) ?? false)
    }
    return true
  }), [clientes, search, filterNegocio])

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Gestión de tu cartera de clientes</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-2 flex-wrap">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Cartera · {filtered.length}</h2>
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
                placeholder="Buscar..."
                className="pl-8 pr-4 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 border border-transparent dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 h-8 w-44"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Users size={26} className="text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {clientes.length === 0 ? 'Sin clientes registrados' : 'Sin resultados'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">
              {clientes.length === 0 ? 'Agregá tu primer cliente' : 'Probá con otros filtros'}
            </p>
            {clientes.length === 0 && (
              <button onClick={() => setCreating(true)} className="btn-primary text-xs px-4 py-2 h-auto">
                <Plus size={14} /> Nuevo cliente
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Teléfono</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{c.nombre}</div>
                      {c.direccion && <div className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-xs">{c.direccion}</div>}
                    </td>
                    {isSuper && (
                      <td className="px-6 py-3.5 text-xs text-gray-500 dark:text-slate-400">
                        {negocioMap.get(c.negocio_id) ?? '—'}
                      </td>
                    )}
                    <td className="px-6 py-3.5">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                          <Mail size={11}/>{c.email}
                        </a>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      {c.telefono ? (
                        <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                          <Phone size={11}/>{c.telefono}
                        </a>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${c.estado === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                          : 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'}`}>
                        {c.estado === 'active' ? 'activo' : 'inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setEditing(c)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <Pencil size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <ClienteModal mode="create" negocios={negocios} onClose={() => setCreating(false)} />}
      {editing && <ClienteModal mode="edit" cliente={editing} negocios={negocios} onClose={() => setEditing(null)} />}
    </>
  )
}

function ClienteModal({ mode, cliente, negocios, onClose }: {
  mode: 'create' | 'edit'
  cliente?: Cliente
  negocios: { id: string; nombre: string }[]
  onClose: () => void
}) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? '')
  const [email, setEmail] = useState(cliente?.email ?? '')
  const [telefono, setTelefono] = useState(cliente?.telefono ?? '')
  const [direccion, setDireccion] = useState(cliente?.direccion ?? '')
  const [notas, setNotas] = useState(cliente?.notas ?? '')
  const [negocioId, setNegocioId] = useState(cliente?.negocio_id ?? negocios[0]?.id ?? '')
  const [estado, setEstado] = useState<'active' | 'inactive'>(cliente?.estado ?? 'active')
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit() {
    setError(null)
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!negocioId) { setError('Elegí un negocio'); return }

    start(async () => {
      try {
        if (mode === 'create') {
          await crearCliente({ nombre, email, telefono, direccion, notas, negocio_id: negocioId })
        } else if (cliente) {
          await actualizarCliente(cliente.id, { nombre, email, telefono, direccion, notas, estado })
        }
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  function remove() {
    if (!cliente) return
    if (!confirm(`¿Desactivar a "${cliente.nombre}"?`)) return
    start(async () => {
      try { await eliminarCliente(cliente.id); onClose() }
      catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Nuevo cliente' : 'Editar cliente'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="input-label">Nombre *</label>
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="input-label">Email</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Teléfono</label>
              <input className="input" value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="input-label">Dirección</label>
            <input className="input" value={direccion} onChange={e => setDireccion(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Notas</label>
            <textarea className="input resize-none" rows={2} value={notas} onChange={e => setNotas(e.target.value)} />
          </div>
          {mode === 'create' ? (
            <div>
              <label className="input-label">Negocio *</label>
              <select className="input" value={negocioId} onChange={e => setNegocioId(e.target.value)}>
                {negocios.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="input-label">Estado</label>
              <select className="input" value={estado} onChange={e => setEstado(e.target.value as typeof estado)}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
          {mode === 'edit' ? (
            <button onClick={remove} disabled={pending} className="text-xs text-red-500 hover:text-red-700 font-semibold inline-flex items-center gap-1">
              <Trash2 size={12}/> Desactivar
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
