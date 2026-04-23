'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2, Building2, User, Eye, EyeOff } from 'lucide-react'
import { crearCliente } from './actions'

type Props = {
  isOpen: boolean
  onClose: () => void
}

type FormData = {
  // Negocio
  nombre: string
  razonsocial: string
  rubro: string
  direccion: string
  plantipo: 'basic' | 'pro' | 'enterprise'
  estado: 'active' | 'trial' | 'inactive'
  preciomensual: string
  proximopago: string
  // Admin
  adminNombre: string
  adminEmail: string
  adminPassword: string
  adminPasswordConfirm: string
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
  adminNombre: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(data: FormData) {
  const errors: Partial<Record<keyof FormData, string>> = {}

  // Negocio
  if (!data.nombre.trim()) errors.nombre = 'El nombre es obligatorio'
  else if (data.nombre.trim().length < 2) errors.nombre = 'Mínimo 2 caracteres'
  else if (data.nombre.trim().length > 100) errors.nombre = 'Máximo 100 caracteres'

  if (data.preciomensual !== '') {
    const precio = Number(data.preciomensual)
    if (isNaN(precio) || precio < 0) errors.preciomensual = 'Importe inválido'
    else if (precio > 10_000_000) errors.preciomensual = 'El importe parece demasiado alto'
  }

  if (data.proximopago !== '') {
    if (isNaN(new Date(data.proximopago).getTime())) errors.proximopago = 'Fecha inválida'
  }

  // Admin
  if (!data.adminNombre.trim()) errors.adminNombre = 'El nombre es obligatorio'
  else if (data.adminNombre.trim().length < 2) errors.adminNombre = 'Mínimo 2 caracteres'

  if (!data.adminEmail.trim()) errors.adminEmail = 'El email es obligatorio'
  else if (!EMAIL_RE.test(data.adminEmail)) errors.adminEmail = 'Email inválido'

  if (!data.adminPassword) errors.adminPassword = 'La contraseña es obligatoria'
  else if (data.adminPassword.length < 6) errors.adminPassword = 'Mínimo 6 caracteres'

  if (!data.adminPasswordConfirm) errors.adminPasswordConfirm = 'Confirmá la contraseña'
  else if (data.adminPassword !== data.adminPasswordConfirm) errors.adminPasswordConfirm = 'Las contraseñas no coinciden'

  return errors
}

function Field({
  label, required, error, children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="input-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

export default function NuevoClienteModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [touched, setTouched] = useState<Touched>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const errors = validate(form)
  const hasErrors = Object.keys(errors).length > 0
  const isDirty = JSON.stringify(form) !== JSON.stringify(INITIAL)

  useEffect(() => {
    if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 50)
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [submitting, isDirty])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => { setSuccess(false); resetAndClose() }, 2000)
      return () => clearTimeout(t)
    }
  }, [success])

  function resetAndClose() {
    setForm(INITIAL)
    setTouched({})
    setServerError(null)
    setSubmitting(false)
    setShowPassword(false)
    setShowConfirm(false)
    onClose()
  }

  function handleClose() {
    if (submitting) return
    if (isDirty && !confirm('¿Descartás los cambios?')) return
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

  function touchAll() {
    const all: Touched = {}
    ;(Object.keys(INITIAL) as (keyof FormData)[]).forEach(k => (all[k] = true))
    setTouched(all)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    touchAll()
    if (hasErrors) return

    setSubmitting(true)
    setServerError(null)

    try {
      await crearCliente({
        nombre: form.nombre.trim(),
        razonsocial: form.razonsocial.trim() || undefined,
        rubro: form.rubro.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        plantipo: form.plantipo,
        estado: form.estado,
        preciomensual: form.preciomensual !== '' ? Number(form.preciomensual) : undefined,
        proximopago: form.proximopago || undefined,
        adminNombre: form.adminNombre.trim(),
        adminEmail: form.adminEmail.trim().toLowerCase(),
        adminPassword: form.adminPassword,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado'
      if (msg.includes('ya registrado') || msg.includes('already registered')) {
        setServerError('El email ya está registrado en el sistema')
      } else if (msg.includes('duplicate') || msg.includes('unique')) {
        setServerError('Ya existe un negocio con ese nombre')
      } else {
        setServerError(msg)
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Nuevo cliente</h2>
              <p className="text-xs text-gray-400">Negocio + usuario administrador</p>
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

        {/* Success */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">¡Cliente creado!</h3>
            <p className="text-sm text-gray-500">{form.nombre}</p>
            <p className="text-xs text-gray-400 mt-1">Admin: {form.adminEmail}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5">

              {serverError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={15} className="shrink-0" />
                  {serverError}
                </div>
              )}

              {/* ── Sección: Negocio ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos del negocio</span>
                </div>
                <div className="space-y-3">
                  <Field label="Nombre" required error={touched.nombre ? errors.nombre : undefined}>
                    <input
                      ref={firstInputRef}
                      className={`input ${touched.nombre && errors.nombre ? 'border-red-400' : ''}`}
                      placeholder="Ej: Ferretería San Martín"
                      value={form.nombre}
                      onChange={set('nombre')}
                      onBlur={touch('nombre')}
                      disabled={submitting}
                      maxLength={100}
                    />
                  </Field>

                  <Field label="Razón social" error={undefined}>
                    <input
                      className="input"
                      placeholder="Ej: San Martín S.R.L."
                      value={form.razonsocial}
                      onChange={set('razonsocial')}
                      disabled={submitting}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Rubro" error={undefined}>
                      <input
                        className="input"
                        placeholder="Ej: Ferretería"
                        value={form.rubro}
                        onChange={set('rubro')}
                        disabled={submitting}
                      />
                    </Field>
                    <Field label="Dirección" error={undefined}>
                      <input
                        className="input"
                        placeholder="Ej: Av. Corrientes 123"
                        value={form.direccion}
                        onChange={set('direccion')}
                        disabled={submitting}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Plan" required error={undefined}>
                      <select className="input" value={form.plantipo} onChange={set('plantipo')} disabled={submitting}>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </Field>
                    <Field label="Estado" required error={undefined}>
                      <select className="input" value={form.estado} onChange={set('estado')} disabled={submitting}>
                        <option value="trial">Trial</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Precio mensual ($)" error={touched.preciomensual ? errors.preciomensual : undefined}>
                      <input
                        className={`input ${touched.preciomensual && errors.preciomensual ? 'border-red-400' : ''}`}
                        type="number"
                        min="0"
                        step="100"
                        placeholder="Ej: 15000"
                        value={form.preciomensual}
                        onChange={set('preciomensual')}
                        onBlur={touch('preciomensual')}
                        disabled={submitting}
                      />
                    </Field>
                    <Field label="Próximo pago" error={touched.proximopago ? errors.proximopago : undefined}>
                      <input
                        className={`input ${touched.proximopago && errors.proximopago ? 'border-red-400' : ''}`}
                        type="date"
                        value={form.proximopago}
                        onChange={set('proximopago')}
                        onBlur={touch('proximopago')}
                        disabled={submitting}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="divider" />

              {/* ── Sección: Usuario admin ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario administrador</span>
                </div>
                <div className="space-y-3">
                  <Field label="Nombre completo" required error={touched.adminNombre ? errors.adminNombre : undefined}>
                    <input
                      className={`input ${touched.adminNombre && errors.adminNombre ? 'border-red-400' : ''}`}
                      placeholder="Ej: Juan García"
                      value={form.adminNombre}
                      onChange={set('adminNombre')}
                      onBlur={touch('adminNombre')}
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Email" required error={touched.adminEmail ? errors.adminEmail : undefined}>
                    <input
                      className={`input ${touched.adminEmail && errors.adminEmail ? 'border-red-400' : ''}`}
                      type="email"
                      placeholder="admin@negocio.com"
                      value={form.adminEmail}
                      onChange={set('adminEmail')}
                      onBlur={touch('adminEmail')}
                      disabled={submitting}
                      autoComplete="off"
                    />
                  </Field>

                  <Field label="Contraseña" required error={touched.adminPassword ? errors.adminPassword : undefined}>
                    <div className="relative">
                      <input
                        className={`input pr-10 ${touched.adminPassword && errors.adminPassword ? 'border-red-400' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={form.adminPassword}
                        onChange={set('adminPassword')}
                        onBlur={touch('adminPassword')}
                        disabled={submitting}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmar contraseña" required error={touched.adminPasswordConfirm ? errors.adminPasswordConfirm : undefined}>
                    <div className="relative">
                      <input
                        className={`input pr-10 ${touched.adminPasswordConfirm && errors.adminPasswordConfirm ? 'border-red-400' : ''}`}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repetí la contraseña"
                        value={form.adminPasswordConfirm}
                        onChange={set('adminPasswordConfirm')}
                        onBlur={touch('adminPasswordConfirm')}
                        disabled={submitting}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl gap-3 sticky bottom-0">
              <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Obligatorios</p>
              <div className="flex gap-2">
                <button type="button" onClick={handleClose} disabled={submitting} className="btn-secondary py-2 px-4 text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn-primary py-2 px-5 text-xs">
                  {submitting
                    ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Creando...</span>
                    : 'Crear cliente'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
