'use client'
import { Bell, Search, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import type { Usuario } from '@/types'

const ROL_COLOR: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  vendedor: 'bg-emerald-100 text-emerald-700',
  cliente: 'bg-gray-100 text-gray-600',
}

export default function TopBar({ usuario }: { usuario: Usuario }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 border border-transparent
                       dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500
                       focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30
                       transition-colors duration-200 h-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-slate-400
                     hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 ml-1 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-xs">{usuario.nombre.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-gray-700 dark:text-slate-200 leading-tight">{usuario.nombre}</div>
            <div className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROL_COLOR[usuario.rol]}`}>
              {usuario.rol}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
