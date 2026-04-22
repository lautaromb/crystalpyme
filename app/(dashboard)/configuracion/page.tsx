'use client'
import { Sun, Moon, Monitor, User, Bell, Shield, ChevronRight } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

function ThemeOption({ value, current, onChange, icon: Icon, label, desc }: {
  value: 'light' | 'dark'
  current: string
  onChange: (v: 'light' | 'dark') => void
  icon: React.ElementType
  label: string
  desc: string
}) {
  const active = current === value
  return (
    <button
      onClick={() => onChange(value)}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-left
        ${active
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
        }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        ${active ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-slate-700'}`}>
        <Icon size={20} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'} />
      </div>
      <div>
        <div className={`text-sm font-semibold ${active ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>{label}</div>
        <div className="text-xs text-gray-400 dark:text-slate-500">{desc}</div>
      </div>
      {active && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium">
          Activo
        </span>
      )}
    </button>
  )
}

const MENU_SECTIONS = [
  {
    title: 'Cuenta',
    items: [
      { label: 'Información del perfil', desc: 'Nombre, email y datos personales', icon: User },
      { label: 'Seguridad', desc: 'Contraseña y autenticación', icon: Shield },
      { label: 'Notificaciones', desc: 'Alertas y avisos del sistema', icon: Bell },
    ]
  }
]

export default function ConfiguracionPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Preferencias y opciones de tu cuenta</p>
      </div>

      {/* Apariencia */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-gray-500 dark:text-slate-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Apariencia</h2>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Elegí cómo querés ver la interfaz</p>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            <ThemeOption
              value="light"
              current={theme}
              onChange={(v) => { if (v !== theme) toggleTheme() }}
              icon={Sun}
              label="Claro"
              desc="Interfaz clara"
            />
            <ThemeOption
              value="dark"
              current={theme}
              onChange={(v) => { if (v !== theme) toggleTheme() }}
              icon={Moon}
              label="Oscuro"
              desc="Interfaz oscura"
            />
          </div>

          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 flex items-center justify-center">
              {theme === 'light' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-blue-400" />}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700 dark:text-slate-300">
                Modo {theme === 'light' ? 'claro' : 'oscuro'} activo
              </div>
              <div className="text-[11px] text-gray-400 dark:text-slate-500">
                Hacé clic en el ícono {theme === 'light' ? '🌙' : '☀️'} de la barra superior para cambiarlo rápido
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other settings */}
      {MENU_SECTIONS.map(section => (
        <div key={section.title} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{section.title}</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {section.items.map(item => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <item.icon size={16} className="text-gray-500 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{item.label}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500">{item.desc}</div>
                </div>
                <ChevronRight size={15} className="text-gray-300 dark:text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* App info */}
      <div className="text-center py-2">
        <p className="text-xs text-gray-300 dark:text-slate-600">
          CrystalPyme · v0.1.0 · Gestión inteligente para tu negocio
        </p>
      </div>
    </div>
  )
}
