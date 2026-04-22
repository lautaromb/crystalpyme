'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card border-slate-700/80">
      <div className="mb-6">
        <h1 className="font-bold text-2xl text-slate-100 mb-1">Bienvenido de vuelta</h1>
        <p className="text-sm text-slate-400">Ingresá a tu panel de gestión</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="input-label" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                 placeholder="tu@email.com" className="input" required autoComplete="email" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="input-label" htmlFor="password">Contraseña</label>
          </div>
          <div className="relative">
            <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                   onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                   className="input pr-10" required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Ingresando...</>
          ) : (
            <><LogIn size={16} />Ingresar</>
          )}
        </button>
      </form>
      <div className="divider" />
      <p className="text-center text-sm text-slate-500">
        ¿No tenés cuenta?{' '}
        <Link href="#" className="text-sky-400 hover:text-sky-300 font-medium">Contactá a CrystalPyme</Link>
      </p>
    </div>
  )
}
