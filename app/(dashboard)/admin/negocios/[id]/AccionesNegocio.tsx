'use client'
import { useState } from 'react'
import { Pencil, Ban, CheckCircle } from 'lucide-react'
import { cambiarEstadoNegocio } from '../actions'
import EditNegocioModal from '../EditNegocioModal'
import type { Negocio, NegocioEstado, PlanSaaS } from '@/types'

interface Props {
  negocio: Negocio
  planes: PlanSaaS[]
}

export default function AccionesNegocio({ negocio, planes }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function toggleSuspend() {
    const nuevoEstado: NegocioEstado = negocio.estado === 'suspendido' ? 'active' : 'suspendido'
    setToggling(true)
    try {
      await cambiarEstadoNegocio(negocio.id, nuevoEstado)
    } finally {
      setToggling(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          onClick={toggleSuspend}
          disabled={toggling}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     border transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     ${negocio.estado === 'suspendido'
                       ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                       : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
        >
          {toggling
            ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            : negocio.estado === 'suspendido'
              ? <><CheckCircle size={12} /> Activar</>
              : <><Ban size={12} /> Suspender</>}
        </button>
      </div>

      <EditNegocioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        negocio={negocio}
        planes={planes}
      />
    </>
  )
}
