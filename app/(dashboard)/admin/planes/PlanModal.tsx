'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2, ListChecks } from 'lucide-react'
import { crearPlan, editarPlan } from './actions'
import type { PlanSaaS } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  plan?: PlanSaaS | null
}

type FormData = {
  nombre: string
  precio: string
  intervalo: 'mensual' | 'anual'
  descripcion: string
  limite_productos: string
  limite_usuarios: string
}

const toForm = (p?: PlanSaaS | null): FormData => ({
  nombre: p?.nombre ?? '',
  precio: p?.precio?.toString() ?? '',
  intervalo: p?.intervalo ?? 'mensual',
  descripcion: p?.descripcion ?? '',
  limite_productos: p?.limite_productos?.toString() ?? '',
  limite_usuarios: p?.limite_usuarios?.toString() ?? '',
})

function validate(f: FormData) {
  const e: Partial<Record<keyof FormData, string>> = {}
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  if (f.precio === '') e.precio = 'El precio es obligatorio'
  else if (isNaN(Number(f.precio)) || Number(f.precio) < 0) e.precio = 'Precio inválido'
  if (f.limite_productos !== '' && (isNaN(Number(f.limite_productos)) || Number(f.limite_productos) < 0))
    e.limite_productos = 'Valor inválido'
  if (f.limite_usuarios !== '' && (isNaN(Number(f.limite_usuarios)) || Number(f.limite_usuarios) < 0))
    e.limite_usuarios = 'Valor inválido'
  return e
}

export default function PlanModal({ isOpen, onClose, plan }: Props) {
  const [form, setForm] = useState<FormData>(toForm(plan))
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const firstRef = useRef<HTMLInputElement>(null)
  const isEdit = !!plan

  useEffect(() => { setForm(toForm(plan)); setTouched({}); setServerError(null) }, [plan, isOpen])
  useEffect(() => { if (isOpen) setTimeout(() => firstRef.current?.focus(), 50) }, [isOpen])
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [submitting])
  useEffect(() => {
    if (success) { const t = setTimeout(() => { setSuccess(false); onClose() }, 1500); return () => clearTimeout(t) }
  }, [success])

  const errors = validate(form)
  const hasErrors = Object.keys(errors).length > 0

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(p => ({ ...p, [field]: e.target.value }))
      setServerError(null)
    }
  }
  function touch(f: keyof FormData) { return () => setTouched(p => ({ ...p, [f]: true })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(form).map(k => [k, true]))
    setTouched(allTouched)
    if (hasErrors) return
    setSubmitting(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        intervalo: form.intervalo,
        descripcion: form.descripcion.trim() || undefined,
        limite_productos: form.limite_productos !== '' ? Number(form.limite_productos) : undefined,
        limite_usuarios: form.limite_usuarios !== '' ? Number(form.limite_usuarios) : undefined,
      }
      if (isEdit) await editarPlan(plan!.id, payload)
      else await crearPlan(payload)
      setSuccess(true)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error inesperado')
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget && !submitting) onClose() }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <ListChecks size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">{isEdit ? 'Editar plan' : 'Nuevo plan'}</h2>
              <p className="text-xs text-gray-400">Definí precio y límites</p>
            </div>
          </div>
          <button onClick={() => !submitting && onClose()} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-40" disabled={submitting}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="font-semibold text-gray-900">{isEdit ? 'Plan actualizado' : 'Plan creado'}</p>
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
                <label className="input-label">Nombre <span className="text-red-500">*</span></label>
                <input ref={firstRef} className={`input ${touched.nombre && errors.nombre ? 'border-red-400' : ''}`}
                  placeholder="Ej: Pro" value={form.nombre} onChange={set('nombre')} onBlur={touch('nombre')} disabled={submitting} />
                {touched.nombre && errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Precio <span className="text-red-500">*</span></label>
                  <input className={`input ${touched.precio && errors.precio ? 'border-red-400' : ''}`}
                    type="number" min="0" step="100" placeholder="15000"
                    value={form.precio} onChange={set('precio')} onBlur={touch('precio')} disabled={submitting} />
                  {touched.precio && errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio}</p>}
                </div>
                <div>
                  <label className="input-label">Intervalo</label>
                  <select className="input" value={form.intervalo} onChange={set('intervalo')} disabled={submitting}>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Descripción</label>
                <textarea className="input resize-none" rows={2} placeholder="Descripción breve del plan..."
                  value={form.descripcion} onChange={set('descripcion')} disabled={submitting} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Límite productos</label>
                  <input className={`input ${touched.limite_productos && errors.limite_productos ? 'border-red-400' : ''}`}
                    type="number" min="0" placeholder="Sin límite"
                    value={form.limite_productos} onChange={set('limite_productos')} onBlur={touch('limite_productos')} disabled={submitting} />
                  {touched.limite_productos && errors.limite_productos && <p className="text-xs text-red-500 mt-1">{errors.limite_productos}</p>}
                </div>
                <div>
                  <label className="input-label">Límite usuarios</label>
                  <input className={`input ${touched.limite_usuarios && errors.limite_usuarios ? 'border-red-400' : ''}`}
                    type="number" min="0" placeholder="Sin límite"
                    value={form.limite_usuarios} onChange={set('limite_usuarios')} onBlur={touch('limite_usuarios')} disabled={submitting} />
                  {touched.limite_usuarios && errors.limite_usuarios && <p className="text-xs text-red-500 mt-1">{errors.limite_usuarios}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => !submitting && onClose()} disabled={submitting} className="btn-secondary py-2 px-4 text-xs">Cancelar</button>
              <button type="submit" disabled={submitting} className="btn-primary py-2 px-5 text-xs">
                {submitting ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" />Guardando...</span> : isEdit ? 'Guardar cambios' : 'Crear plan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
