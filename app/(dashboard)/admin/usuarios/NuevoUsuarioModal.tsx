'use client'
import { useState } from 'react'
import { UserPlus, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { crearUsuario } from './actions'

interface Tenant { id: string; nombre: string }

export default function NuevoUsuarioModal({ tenants }: { tenants: Tenant[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nombre: '', username: '', email: '', password: '', rol: 'suscriptor', tenant_id: tenants[0]?.id ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function reset() {
    setForm({ nombre: '', username: '', email: '', password: '', rol: 'suscriptor', tenant_id: tenants[0]?.id ?? '' })
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || !form.password || !form.tenant_id) return
    setLoading(true)
    setError(null)
    try {
      await crearUsuario({
        nombre: form.nombre.trim(),
        username: form.username.trim() || undefined,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        rol: form.rol,
        tenant_id: form.tenant_id,
      })
      setSuccess(true)
      setTimeout(() => { setOpen(false); reset() }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <UserPlus size={15} /> Nuevo usuario
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!loading) { setOpen(false); reset() } }} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserPlus size={15} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Nuevo usuario</h2>
                  <p className="text-xs text-slate-500">Completá los datos del acceso</p>
                </div>
              </div>
              <button onClick={() => { if (!loading) { setOpen(false); reset() } }} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <CheckCircle2 size={44} className="text-emerald-500" />
                <p className="font-semibold text-slate-900">Usuario creado con éxito</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Nombre completo *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className="input" placeholder="Juan García" required />
                  </div>
                  <div>
                    <label className="input-label">Username</label>
                    <input name="username" value={form.username} onChange={handleChange} className="input" placeholder="juangarcia" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="juan@email.com" required />
                </div>
                <div>
                  <label className="input-label">Contraseña temporal *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Mínimo 8 caracteres" minLength={8} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Rol</label>
                    <select name="rol" value={form.rol} onChange={handleChange} className="input">
                      <option value="suscriptor">Suscriptor</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Tenant</label>
                    <select name="tenant_id" value={form.tenant_id} onChange={handleChange} className="input">
                      {tenants.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle size={13} className="shrink-0" />{error}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setOpen(false); reset() }} disabled={loading} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Crear usuario'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
