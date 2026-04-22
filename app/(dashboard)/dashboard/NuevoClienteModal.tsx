'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2, Building2 } from 'lucide-react'
import { crearNegocio } from './actions'

type Props = {
  isOpen: boolean
  onClose: () => void
}

type FormData = {
  nombre: string
  razonsocial: string
  rubro: string
  direccion: string
  plantipo: 'basic' | 'pro' | 'enterprise'
  estado: 'active' | 'trial' | 'inactive'
  preciomensual: string
  proximopago: string
}

type Touched = Partial<Record<keyof FormData, boolean>>

const INITIAL: FormData = {
  nombre: '',
  razonsocial: '',
  rubro: '',
  direccion: '',
  plantipo: 'basic',
  estado: 'trial',
  preciomensual: '',
  proximopago: '',
}

function validate(data: FormData) {
  const errors: Partial<Record<keyof FormData, string>> = {}

  if (!data.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio'
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = 'Mínimo 2 caracteres'
  } else if (data.nombre.trim().length > 100) {
    errors.nombre = 'Máximo 100 caracteres'
  }

  if (data.preciomensual !== '') {
    const precio = Number(data.preciomensual)
    if (isNaN(precio) || precio < 0) {
      errors.preciomensual = 'Ingresá un importe válido'
    } else if (precio > 10_000_000) {
      errors.preciomensual = 'El importe parece demasiado alto'
    }
  }

  if (data.proximopago !== '') {
    const fecha = new Date(data.proximopago)
    if (isNaN(fecha.getTime())) {
      errors.proximopago = 'Fecha inválida'
    }
  }

  return errors
}

export default function NuevoClienteModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [touched, setTouched] = useState<Touched>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const errors = validate(form)
  const hasErrors = Object.keys(errors).length > 0
  const isDirty = JSON.stringify(form) !== JSON.stringify(INITIAL)

  // Focus primer campo al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [submitting, isDirty])

  // Auto-cerrar tras éxito
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        setSuccess(false)
        resetAndClose()
      }, 1800)
      return () => clearTimeout(t)
    }
  }, [success])

  function resetAndClose() {
    setForm(INITIAL)
    setTouched({})
    setServerError(null)
    setSubmitting(false)
    onClose()
  }

  function handleClose() {
    if (submitting) return
    if (isDirty) {
      if (!confirm('¿Descartás los cambios?')) return
    }
    resetAndClose()
  }

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setServerError(null)
    }
  }

  function touch(field: keyof FormData) {
    return () => setTouched(prev => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ nombre: true, preciomensual: true, proximopago: true })

    if (hasErrors) return

    setSubmitting(true)
    setServerError(null)

    try {
      await crearNegocio({
        nombre: form.nombre.trim(),
        razonsocial: form.razonsocial.trim() || undefined,
        rubro: form.rubro.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        plantipo: form.plantipo,
        estado: form.estado,
        preciomensual: form.preciomensual !== '' ? Number(form.preciomensual) : undefined,
        proximopago: form.proximopago || undefined,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado'
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
        setServerError('Ya existe un negocio con ese nombre')
      } else {
        setServerError('No se pudo guardar. Intentá de nuevo.')
      }
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Nuevo cliente</h2>
              <p className="text-xs text-gray-400">Completá los datos del negocio</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">¡Cliente creado!</h3>
            <p className="text-sm text-gray-400">{form.nombre} fue agregado correctamente</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4">
              {/* Error de servidor */}
              {serverError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={15} className="shrink-0" />
                  {serverError}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="input-label">
                  Nombre del negocio <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  className={`input ${touched.nombre && errors.nombre ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                  placeholder="Ej: Ferretería San Martín"
                  value={form.nombre}
                  onChange={set('nombre')}
                  onBlur={touch('nombre')}
                  disabled={submitting}
                  maxLength={100}
                />
                {touched.nombre && errors.nombre && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.nombre}
                  </p>
                )}
              </div>

              {/* Razón social */}
              <div>
                <label className="input-label">Razón social</label>
                <input
                  className="input"
                  placeholder="Ej: San Martín S.R.L."
                  value={form.razonsocial}
                  onChange={set('razonsocial')}
                  disabled={submitting}
                />
              </div>

              {/* Rubro + Dirección */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Rubro</label>
                  <input
                    className="input"
                    placeholder="Ej: Ferretería"
                    value={form.rubro}
                    onChange={set('rubro')}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="input-label">Dirección</label>
                  <input
                    className="input"
                    placeholder="Ej: Av. Corrientes 123"
                    value={form.direccion}
                    onChange={set('direccion')}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Plan + Estado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">
                    Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input"
                    value={form.plantipo}
                    onChange={set('plantipo')}
                    disabled={submitting}
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input"
                    value={form.estado}
                    onChange={set('estado')}
                    disabled={submitting}
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Precio mensual + Próximo pago */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Precio mensual ($)</label>
                  <input
                    className={`input ${touched.preciomensual && errors.preciomensual ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Ej: 15000"
                    value={form.preciomensual}
                    onChange={set('preciomensual')}
                    onBlur={touch('preciomensual')}
                    disabled={submitting}
                  />
                  {touched.preciomensual && errors.preciomensual && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.preciomensual}
                    </p>
                  )}
                </div>
                <div>
                  <label className="input-label">Próximo pago</label>
                  <input
                    className={`input ${touched.proximopago && errors.proximopago ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                    type="date"
                    value={form.proximopago}
                    onChange={set('proximopago')}
                    onBlur={touch('proximopago')}
                    disabled={submitting}
                  />
                  {touched.proximopago && errors.proximopago && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.proximopago}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl gap-3">
              <p className="text-xs text-gray-400">
                <span className="text-red-500">*</span> Campos obligatorios
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || (Object.keys(touched).length > 0 && hasErrors)}
                  className="btn-primary py-2 px-5 text-xs"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin" /> Guardando...
                    </span>
                  ) : 'Crear cliente'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
