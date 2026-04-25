'use client'
import { useState } from 'react'
import { Search, ChevronDown, Shield, CheckCircle2, XCircle } from 'lucide-react'
import type { Usuario } from '@/types'

type UsuarioConTenant = Usuario & { tenant?: { nombre: string } | null }

const ROL_BADGE: Record<string, string> = {
  superadmin: 'badge-red',
  suscriptor: 'badge-blue',
  empleado: 'badge-yellow',
}
const ROL_LABEL: Record<string, string> = {
  superadmin: 'Super Admin',
  suscriptor: 'Suscriptor',
  empleado: 'Empleado',
}
const SUBROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  manager: 'Encargado',
  staff: 'Dependiente',
}

export default function UsuariosTable({ usuarios }: { usuarios: UsuarioConTenant[] }) {
  const [search, setSearch] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')

  const filtered = usuarios.filter(u => {
    const matchSearch =
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (u.username ?? '').toLowerCase().includes(search.toLowerCase())
    const matchRol = filtroRol === 'todos' || u.rol === filtroRol
    return matchSearch && matchRol
  })

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 px-4 py-3 border-b border-gray-100">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Buscar por nombre o username…"
          />
        </div>
        <div className="relative">
          <select
            value={filtroRol}
            onChange={e => setFiltroRol(e.target.value)}
            className="input pr-8 appearance-none cursor-pointer min-w-[150px]"
          >
            <option value="todos">Todos los roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="suscriptor">Suscriptor</option>
            <option value="empleado">Empleado</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Usuario</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Rol</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Tenant</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Estado</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Alta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-slate-500 text-sm">
                No se encontraron usuarios
              </td>
            </tr>
          ) : filtered.map(u => (
            <tr key={u.id} className="hover:bg-blue-50/30 transition-colors duration-100">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">{u.nombre.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{u.nombre}</p>
                    {u.username && <p className="text-xs text-slate-500">@{u.username}</p>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className={ROL_BADGE[u.rol] ?? 'badge-gray'}>
                    {u.rol === 'superadmin' && <Shield size={10} />}
                    {ROL_LABEL[u.rol] ?? u.rol}
                  </span>
                  {u.sub_rol && (
                    <span className="badge-gray text-[10px]">{SUBROLE_LABEL[u.sub_rol] ?? u.sub_rol}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600 text-sm">
                {(u as UsuarioConTenant).tenant?.nombre ?? <span className="text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3">
                {u.activo
                  ? <span className="badge-green"><CheckCircle2 size={10} /> Activo</span>
                  : <span className="badge-red"><XCircle size={10} /> Inactivo</span>}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-500 px-4 py-2 border-t border-gray-100">
          Mostrando {filtered.length} de {usuarios.length} usuarios
        </p>
      )}
    </div>
  )
}
