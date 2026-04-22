'use client'
import { useState } from 'react'
import { UserPlus, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Tenant { id: string; nombre: string }

export default function NuevoUsuarioModal({ tenants }: { tenants: Tenant[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nombre: '', username: '', email: '', password: '', rol: 'admin', tenant_id: tenants[0]?.id ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    const userId = signUpData.user?.id
    if (userId) {
      const { error: insertError } = await supabase.from('usuario').insert({
        id: userId, nombre: form.nombre, username: form.username || null,
        rol: form.rol, tenant_id: form.tenant_id, activo: true,
      })
      if (insertError) { setError(insertError.message); setLoading(false); return }
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      setOpen(false); setSuccess(false)
      setForm({ nombre: '', username: '', email: '', password: '', rol: 'admin', tenant_id: tenants[0]?.id ?? '' })
      window.location.reload()
    }, 1500)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <UserPlus size={15} /> Nuevo usuario
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md card shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg text-slate-100">Nuevo usuario</h2>
                <p className="text-xs text-slate-500 mt-0.5">Completá los datos del nuevo acceso</p>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle2 size={40} className="text-emerald-400" />
                <p className="text-slate-300 font-medium">Usuario creado con éxito</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Nombre completo</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className="input" placeholder="Juan García" required />
                  </div>
                  <div>
                    <label className="input-label">Username</label>
                    <input name="username" value={form.username} onChange={handleChange} className="input" placeholder="juangarcia" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="juan@email.com" required />
                </div>
                <div>
                  <label className="input-label">Contraseña temporal</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Mínimo 8 caracteres" minLength={8} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Rol</label>
                    <select name="rol" value={form.rol} onChange={handleChange} className="input">
                      <option value="admin">Admin</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="cliente">Cliente</option>
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
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle size={13} />{error}
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Crear usuario'}
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
