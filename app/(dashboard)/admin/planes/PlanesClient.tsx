'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Users, Package, Infinity } from 'lucide-react'
import { togglePlanActivo } from './actions'
import PlanModal from './PlanModal'
import type { PlanSaaS } from '@/types'

export default function PlanesClient({ planes }: { planes: PlanSaaS[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<PlanSaaS | null>(null)
  const [isPending, startTransition] = useTransition()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function handleEditar(plan: PlanSaaS) { setEditando(plan); setModalOpen(true) }
  function handleNuevo() { setEditando(null); setModalOpen(true) }
  function handleToggle(id: string, activo: boolean) {
    setTogglingId(id)
    startTransition(async () => { await togglePlanActivo(id, !activo); setTogglingId(null) })
  }

  return (
    <>
      <PlanModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null) }} plan={editando} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes</h1>
          <p className="text-sm text-gray-500 mt-1">{planes.length} plan{planes.length !== 1 ? 'es' : ''} configurado{planes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleNuevo} className="btn-primary"><Plus size={15} /> Nuevo plan</button>
      </div>

      {planes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Plus size={24} className="text-blue-500" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No hay planes todavía</p>
          <p className="text-sm text-gray-400 mb-5">Creá los planes que ofrecés a tus clientes</p>
          <button onClick={handleNuevo} className="btn-primary"><Plus size={14} /> Crear el primero</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {planes.map(plan => (
            <div key={plan.id} className={`card flex flex-col gap-4 ${!plan.activo ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{plan.nombre}</h3>
                  {plan.descripcion && <p className="text-xs text-gray-400 mt-0.5">{plan.descripcion}</p>}
                </div>
                {plan.activo
                  ? <span className="badge-green">Activo</span>
                  : <span className="badge-gray">Inactivo</span>}
              </div>

              <div className="text-3xl font-bold text-gray-900">
                ${Number(plan.precio).toLocaleString('es-AR')}
                <span className="text-sm font-normal text-gray-400 ml-1">/{plan.intervalo}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Package size={13} className="text-gray-400" />
                  {plan.limite_productos
                    ? `Hasta ${plan.limite_productos} productos`
                    : <span className="flex items-center gap-1"><Infinity size={12} /> Productos ilimitados</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users size={13} className="text-gray-400" />
                  {plan.limite_usuarios
                    ? `Hasta ${plan.limite_usuarios} usuarios`
                    : <span className="flex items-center gap-1"><Infinity size={12} /> Usuarios ilimitados</span>}
                </div>
              </div>

              <div className="divider" />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditar(plan)}
                  className="btn-secondary py-1.5 px-3 text-xs flex-1"
                >
                  <Pencil size={12} /> Editar
                </button>
                <button
                  onClick={() => handleToggle(plan.id, plan.activo)}
                  disabled={togglingId === plan.id || isPending}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40
                    ${plan.activo
                      ? 'bg-gray-100 text-gray-600 border-transparent hover:bg-red-50 hover:text-red-600'
                      : 'bg-gray-100 text-gray-600 border-transparent hover:bg-emerald-50 hover:text-emerald-700'}`}
                >
                  {plan.activo ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {plan.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
