'use client'
import { useState } from 'react'
import { Search, MoreVertical, CheckCircle2, XCircle, Shield } from 'lucide-react'
import type { Usuario } from '@/types'

type UsuarioConTenant = Usuario & { tenant?: { nombre: string } | null }

const ROL_BADGE: Record<string, string> = {
  superadmin: 'badge-red', admin: 'badge-blue', vendedor: 'badge-yellow', cliente: 'badge-gray',
}
const ROL_LABEL: Record<string, string> = {
  superadmin: 'Super Admin', admin: 'Admin', vendedor: 'Vendedor', cliente: 'Cliente',
}

export default function UsuariosTable({ usuarios }: { usuarios: UsuarioConTenant[] }) {
  const [search, setSearch] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')

  const filtered = usuarios.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
    const matchRol = filtroRol === 'todos' || u.rol === filtroRol
    return matchSearch && matchRol
  })

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-slate-700/60">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Buscar usuario..." value={search}
                 onChange={e => setSearch(e.target.value)} className="input pl-8 py-1.5 text-xs h-8" />
        </div>
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
                className="input py-1.5 text-xs h-8 w-auto min-w-[130px]">
          <option value="todos">Todos los roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="vendedor">Vendedor</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60">
              {['Usuario', 'Rol', 'Tenant', 'Estado', 'Creado', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-600 text-sm">No se encontraron usuarios</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-[#1e293b]/50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-sky-500/15 flex items-center justify-center">
                      <span className="text-sky-400 font-bold text-xs">{u.nombre.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-200 text-sm">{u.nombre}</div>
                      {u.username && <div className="text-xs text-slate-500">@{u.username}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={ROL_BADGE[u.rol] ?? 'badge-gray'}>
                    {u.rol === 'superadmin' && <Shield size={10} />}
                    {ROL_LABEL[u.rol] ?? u.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{(u as any).tenant?.nombre ?? '—'}</td>
                <td className="px-4 py-3">
                  {u.activo
                    ? <span className="badge-green"><CheckCircle2 size={10} /> Activo</span>
                    : <span className="badge-red"><XCircle size={10} /> Inactivo</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <button className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100"><MoreVertical size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-700/60">
        <span className="text-xs text-slate-500">Mostrando {filtered.length} de {usuarios.length} usuarios</span>
      </div>
    </div>
  )
}
