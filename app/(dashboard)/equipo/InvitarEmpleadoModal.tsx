'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2, UserPlus, Mail } from 'lucide-react'
import { invitarEmpleado } from './actions'

type Props = {
  isOpen: boolean
  onClose: () => void
  tenantId: string
}

type FormData = { nombre: string; email: string }
type Touched = Partial<Record<keyof FormData, boolean>>

const INITIAL: FormData = { nombre: '', email: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(data: FormData) {
  const errors: Partial<Record<keyof FormData, string>> = {}
  if (!data.nombre.trim()) errors.nombre = 'El nombre es obligatorio'
  else if (data.nombre.trim().length < 2) errors.nombre = 'Mínimo 2 caracteres'
  if (!data.email.trim()) errors.email = 'El email es obligatorio'
  else if (!EMAIL_RE.test(data.email)) errors.email = 'Email inválido'
  return errors
}

export default function InvitarEmpleadoModal({ isOpen, onClose, tenantId }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [touched, setTouched] = useState<Touched>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const errors = validate(form)
  const hasErrors = Object.keys(errors).length > 0
  const isDirty = form.nombre !== '' || form.email !== ''

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
    onClose()
  }

  function handleClose() {
    if (submitting) return
    if (isDirty && !confirm('¿Descartás los cambios?')) return
    resetAndClose()
  }

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setServerError(null)
    }
  }

  function touch(field: keyof FormData) {
    return () => setTouched(prev => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ nombre: true, email: true })
    if (hasErrors) return

    setSubmitting(true)
    setServerError(null)

    try {
      await invitarEmpleado({
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        tenantId,
      })
      setSuccess(true)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error inesperado')
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

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserPlus size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Invitar empleado</h2>
              <p className="text-xs text-gray-400">Le llegará un email para crear su contraseña</p>
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

        {success ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">¡Invitación enviada!</h3>
            <p className="text-sm text-gray-500">{form.nombre}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
              <Mail size={11} /> {form.email}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4">
              {serverError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={15} className="shrink-0" /> {serverError}
                </div>
              )}

              <div>
                <label className="input-label">Nombre completo <span className="text-red-500">*</span></label>
                <input
                  ref={firstInputRef}
                  className={`input ${touched.nombre && errors.nombre ? 'border-red-400' : ''}`}
                  placeholder="Ej: María González"
                  value={form.nombre}
                  onChange={set('nombre')}
                  onBlur={touch('nombre')}
                  disabled={submitting}
                />
                {touched.nombre && errors.nombre && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label className="input-label">Email <span className="text-red-500">*</span></label>
                <input
                  className={`input ${touched.email && errors.email ? 'border-red-400' : ''}`}
                  type="email"
                  placeholder="empleado@negocio.com"
                  value={form.email}
                  onChange={set('email')}
                  onBlur={touch('email')}
                  disabled={submitting}
                  autoComplete="off"
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.email}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2">
                <Mail size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  El empleado recibirá un email con un link para crear su contraseña y acceder al sistema como <strong>Vendedor</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl gap-3">
              <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Obligatorios</p>
              <div className="flex gap-2">
                <button type="button" onClick={handleClose} disabled={submitting} className="btn-secondary py-2 px-4 text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn-primary py-2 px-5 text-xs">
                  {submitting
                    ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Enviando...</span>
                    : 'Enviar invitación'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
