'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, AlertCircle, CheckCircle2, Pencil } from 'lucide-react'
import { editarNegocio } from './actions'
import type { Negocio, TenantPlan, NegocioEstado, PlanSaaS } from '@/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  negocio: Negocio
  planes: PlanSaaS[]
}

interface FormState {
  nombre: string
  slug: string
  descripcion: string
  razonsocial: string
  rubro: string
  email: string
  direccion: string
  plantipo: TenantPlan
  estado: NegocioEstado
  preciomensual: string
  proximopago: string
}

interface FormErrors {
  nombre?: string
}

function toForm(n: Negocio): FormState {
  return {
    nombre: n.nombre,
    slug: n.slug ?? '',
    descripcion: n.descripcion ?? '',
    razonsocial: n.razonsocial ?? '',
    rubro: n.rubro ?? '',
    email: n.email ?? '',
    direccion: n.direccion ?? '',
    plantipo: n.plantipo,
    estado: n.estado,
    preciomensual: n.preciomensual != null ? String(n.preciomensual) : '',
    proximopago: n.proximopago ? n.proximopago.slice(0, 10) : '',
  }
}

export default function EditNegocioModal({ isOpen, onClose, negocio, planes }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(negocio))
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Sync form when negocio changes
  useEffect(() => {
    setForm(toForm(negocio))
    setErrors({})
    setServerError(null)
    setSuccess(false)
  }, [negocio])

  // ESC to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose()
    },
    [loading, onClose]
  )
  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function validateField(name: string, value: string): string | undefined {
    if (name === 'nombre' && !value.trim()) return 'El nombre es obligatorio'
    return undefined
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    const err = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: err }))
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError(null)

    try {
      await editarNegocio(negocio.id, {
        nombre: form.nombre.trim(),
        slug: form.slug.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        razonsocial: form.razonsocial.trim() || undefined,
        rubro: form.rubro.trim() || undefined,
        email: form.email.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        plantipo: form.plantipo,
        estado: form.estado,
        preciomensual: form.preciomensual ? Number(form.preciomensual) : undefined,
        proximopago: form.proximopago || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { if (!loading) onClose() }}
      />
      <div className="relative w-full max-w-lg card shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Pencil size={15} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">Editar negocio</h2>
              <p className="text-xs text-slate-500 mt-0.5">{negocio.nombre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { if (!loading) onClose() }}
            className="btn-ghost p-1.5"
          >
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <CheckCircle2 size={44} className="text-emerald-500" />
            <p className="text-slate-700 font-semibold">Cambios guardados</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nombre */}
            <div>
              <label className="input-label">Nombre *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
                placeholder="Nombre del negocio"
                required
              />
              {errors.nombre && (
                <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="input-label">Descripción pública</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className="input resize-none"
                rows={2}
                placeholder="Breve descripción del negocio para su página pública…"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="input-label">URL pública</label>
              <div className="flex items-center gap-0 rounded-lg border border-gray-300 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-300 whitespace-nowrap">
                  /p/
                </span>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2.5 text-sm bg-white text-gray-900 outline-none"
                  placeholder="mi-negocio"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Solo letras minúsculas, números y guiones</p>
            </div>

            {/* Razón social + Rubro */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Razón social</label>
                <input
                  name="razonsocial"
                  value={form.razonsocial}
                  onChange={handleChange}
                  className="input"
                  placeholder="S.R.L., S.A., etc."
                />
              </div>
              <div>
                <label className="input-label">Rubro</label>
                <input
                  name="rubro"
                  value={form.rubro}
                  onChange={handleChange}
                  className="input"
                  placeholder="Indumentaria, Gastronomía…"
                />
              </div>
            </div>

            {/* Email + Dirección */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="correo@negocio.com"
                />
              </div>
              <div>
                <label className="input-label">Dirección</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className="input"
                  placeholder="Av. Corrientes 123"
                />
              </div>
            </div>

            {/* Plan + Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Plan</label>
                <select name="plantipo" value={form.plantipo} onChange={handleChange} className="input">
                  {planes.map(p => (
                    <option key={p.id} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange} className="input">
                  <option value="active">Activo</option>
                  <option value="trial">Trial</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>

            {/* Precio mensual + Próximo pago */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Precio mensual ($)</label>
                <input
                  name="preciomensual"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preciomensual}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="input-label">Próximo pago</label>
                <input
                  name="proximopago"
                  type="date"
                  value={form.proximopago}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle size={13} className="shrink-0" />
                {serverError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { if (!loading) onClose() }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
