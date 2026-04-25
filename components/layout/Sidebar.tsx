'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, Users, Megaphone,
  Settings, LogOut, Building2, UserCog, UsersRound,
  CreditCard, ListChecks, FileText, Target,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Usuario } from '@/types'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',          icon: LayoutDashboard, roles: ['superadmin','suscriptor','empleado'] },
  { label: 'Negocios',    href: '/admin/negocios',     icon: Building2,       roles: ['superadmin'] },
  { label: 'Planes',      href: '/admin/planes',       icon: ListChecks,      roles: ['superadmin'] },
  { label: 'Facturación', href: '/admin/facturacion',  icon: CreditCard,      roles: ['superadmin'] },
  { label: 'Ventas',      href: '/ventas',             icon: ShoppingCart,    roles: ['superadmin','suscriptor','empleado'] },
  { label: 'Productos',   href: '/productos',          icon: Package,         roles: ['superadmin','suscriptor','empleado'] },
  { label: 'Clientes',    href: '/clientes',           icon: Users,           roles: ['superadmin','suscriptor','empleado'] },
  { label: 'CRM',         href: '/admin/crm',          icon: Target,          roles: ['superadmin','suscriptor'] },
  { label: 'Formularios', href: '/admin/formularios',  icon: FileText,        roles: ['superadmin','suscriptor'] },
  { label: 'Marketing',   href: '/marketing',          icon: Megaphone,       roles: ['superadmin','suscriptor','empleado'] },
  { label: 'Mi equipo',   href: '/equipo',             icon: UsersRound,      roles: ['suscriptor','empleado'] },
]

const ADMIN_ITEMS = [
  { label: 'Usuarios',      href: '/admin/usuarios',     icon: UserCog,  roles: ['superadmin'] },
  { label: 'Configuración', href: '/configuracion',      icon: Settings, roles: ['superadmin','suscriptor'] },
]

const ROL_LABEL: Record<string, string> = {
  superadmin: 'Super Admin',
  suscriptor: 'Suscriptor',
  empleado:   'Empleado',
}
const ROL_COLOR: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700',
  suscriptor: 'bg-blue-100 text-blue-700',
  empleado:   'bg-emerald-100 text-emerald-700',
}

export default function Sidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const nav = NAV_ITEMS.filter(i => i.roles.includes(usuario.rol))
  const admin = ADMIN_ITEMS.filter(i => i.roles.includes(usuario.rol))

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <span className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
              Crystal<span className="text-blue-600">Pyme</span>
            </span>
            <div className="text-[10px] text-gray-400 dark:text-slate-500 leading-none mt-0.5">Gestión empresarial</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {nav.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                <item.icon
                  size={17}
                  className={`shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}
                />
                <span className="flex-1">{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </Link>
            )
          })}
        </div>

        {admin.length > 0 && (
          <div className="mt-6">
            <div className="px-3 mb-2">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                Sistema
              </span>
            </div>
            <div className="space-y-0.5">
              {admin.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <item.icon
                      size={17}
                      className={`shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-xs">{usuario.nombre.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">{usuario.nombre}</div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROL_COLOR[usuario.rol]}`}>
              {ROL_LABEL[usuario.rol]}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 dark:text-slate-400
                     hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                     transition-all duration-150"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
