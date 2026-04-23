'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserCheck, UserX, Mail } from 'lucide-react'
import { toggleEmpleadoActivo } from './actions'
import InvitarEmpleadoModal from './InvitarEmpleadoModal'

type Empleado = {
  id: string
  nombre: string
  activo: boolean
  created_at: string
}

export default function EmpleadosTable({ empleados, tenantId }: { empleados: Empleado[]; tenantId: string }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function handleToggle(id: string, activo: boolean) {
    setTogglingId(id)
    startTransition(async () => {
      await toggleEmpleadoActivo(id, !activo)
      setTogglingId(null)
    })
  }

  return (
    <>
      <InvitarEmpleadoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        tenantId={tenantId}
      />

      <div className="card p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Empleados</h2>
            <p className="text-xs text-gray-400 mt-0.5">{empleados.length} en tu equipo</p>
          </div>
          <button onClick={() => setModalAbierto(true)} className="btn-primary py-2 px-3 text-xs">
            <UserPlus size={13} /> Invitar empleado
          </button>
        </div>

        {/* Tabla */}
        {empleados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <UserPlus size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Todavía no tenés empleados</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Invitá a tu equipo para que puedan acceder al sistema</p>
            <button onClick={() => setModalAbierto(true)} className="btn-primary py-2 px-4 text-xs">
              <UserPlus size={13} /> Invitar el primero
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Desde</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {empleados.map((e, i) => (
                <tr key={e.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === empleados.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-semibold text-xs">{e.nombre.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-900">{e.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-gray">Vendedor</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(e.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    {e.activo
                      ? <span className="badge-green"><UserCheck size={11} /> Activo</span>
                      : <span className="badge-red"><UserX size={11} /> Inactivo</span>
                    }
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleToggle(e.id, e.activo)}
                      disabled={togglingId === e.id || isPending}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40
                        ${e.activo
                          ? 'bg-gray-100 text-gray-600 border-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : 'bg-gray-100 text-gray-600 border-transparent hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                    >
                      {e.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
