'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Clock, XCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { registrarPago } from './actions'

type Pago = {
  id: string
  negocio_id: string
  monto: number
  fecha: string
  estado: 'pagado' | 'pendiente' | 'fallido'
  notas?: string | null
  metodo: string
  negocio?: { nombre: string } | null
}

type Negocio = { id: string; nombre: string; preciomensual?: number | null }

function BadgePago({ estado }: { estado: string }) {
  if (estado === 'pagado') return <span className="badge-green"><CheckCircle2 size={10} /> Pagado</span>
  if (estado === 'pendiente') return <span className="badge-yellow"><Clock size={10} /> Pendiente</span>
  return <span className="badge-red"><XCircle size={10} /> Fallido</span>
}

export default function FacturacionClient({ pagos, negocios }: { pagos: Pago[]; negocios: Negocio[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroNegocio, setFiltroNegocio] = useState('todos')

  const [form, setForm] = useState({
    negocio_id: '', monto: '', fecha: new Date().toISOString().split('T')[0],
    estado: 'pagado' as 'pagado' | 'pendiente' | 'fallido', notas: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const filtrados = pagos.filter(p => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
    if (filtroNegocio !== 'todos' && p.negocio_id !== filtroNegocio) return false
    return true
  })

  function autocompletarMonto(negocioId: string) {
    const n = negocios.find(n => n.id === negocioId)
    if (n?.preciomensual) setForm(f => ({ ...f, negocio_id: negocioId, monto: String(n.preciomensual) }))
    else setForm(f => ({ ...f, negocio_id: negocioId }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.negocio_id || !form.monto) return
    setSubmitting(true)
    setServerError(null)
    try {
      await registrarPago({
        negocio_id: form.negocio_id,
        monto: Number(form.monto),
        fecha: form.fecha,
        estado: form.estado,
        notas: form.notas || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setModalOpen(false)
        setForm({ negocio_id: '', monto: '', fecha: new Date().toISOString().split('T')[0], estado: 'pagado', notas: '' })
      }, 1500)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error inesperado')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Modal registrar pago */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Registrar pago</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            {success ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <p className="font-semibold text-gray-900">Pago registrado</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-6 py-5 space-y-4">
                  {serverError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                      <AlertCircle size={14} /> {serverError}
                    </div>
                  )}
                  <div>
                    <label className="input-label">Negocio <span className="text-red-500">*</span></label>
                    <select className="input" value={form.negocio_id} onChange={e => autocompletarMonto(e.target.value)} required>
                      <option value="">Seleccioná un negocio</option>
                      {negocios.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Monto <span className="text-red-500">*</span></label>
                      <input className="input" type="number" min="0" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="15000" required />
                    </div>
                    <div>
                      <label className="input-label">Fecha</label>
                      <input className="input" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Estado</label>
                    <select className="input" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as 'pagado' | 'pendiente' | 'fallido' }))}>
                      <option value="pagado">Pagado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="fallido">Fallido</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Notas</label>
                    <input className="input" placeholder="Opcional..." value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary py-2 px-4 text-xs">Cancelar</button>
                  <button type="submit" disabled={submitting || !form.negocio_id || !form.monto} className="btn-primary py-2 px-5 text-xs">
                    {submitting ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" />Guardando...</span> : 'Registrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <select className="input py-2 text-xs w-auto" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="fallido">Fallido</option>
          </select>
          <select className="input py-2 text-xs w-auto" value={filtroNegocio} onChange={e => setFiltroNegocio(e.target.value)}>
            <option value="todos">Todos los negocios</option>
            {negocios.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
          </select>
          <button onClick={() => setModalOpen(true)} className="btn-primary py-2 px-3 text-xs ml-auto">
            <Plus size={13} /> Registrar pago
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Negocio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Método</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, i) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === filtrados.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-6 py-3 font-medium text-gray-900">{p.negocio?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.fecha).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3"><BadgePago estado={p.estado} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{p.metodo}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">${Number(p.monto).toLocaleString('es-AR')}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">No hay pagos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filtrados.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''} · Total: ${filtrados.filter(p => p.estado === 'pagado').reduce((a, p) => a + Number(p.monto), 0).toLocaleString('es-AR')}
          </div>
        )}
      </div>
    </>
  )
}
