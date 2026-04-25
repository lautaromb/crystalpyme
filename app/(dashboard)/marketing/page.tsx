import { createClient } from '@/lib/supabase/server'
import { Megaphone, Mail, Share2, BarChart2, Users, TrendingUp, Sparkles, MessageCircle, Smartphone, Globe } from 'lucide-react'
import { getAuthScope } from '@/lib/auth/scope'
import type { Campania, CampaniaCanal, Lead, LeadOrigen } from '@/types'

const CANAL_ICON: Record<CampaniaCanal, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  sms: Smartphone,
  redes: Share2,
  otro: Globe,
}

const CANAL_LABEL: Record<CampaniaCanal, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  redes: 'Redes',
  otro: 'Otro',
}

const ESTADO_STYLE: Record<string, string> = {
  activa: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
  borrador: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600',
  pausada: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  finalizada: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
}

const ESTADO_LABEL: Record<string, string> = {
  activa: 'Activa',
  borrador: 'Borrador',
  pausada: 'Pausada',
  finalizada: 'Finalizada',
}

export default async function MarketingPage() {
  const scope = await getAuthScope()
  const supabase = await createClient()
  const empty = scope.negocioIds.length === 0

  const [campResp, leadsResp] = await Promise.all([
    empty
      ? Promise.resolve({ data: [] })
      : supabase.from('campania').select('*').in('negocio_id', scope.negocioIds).order('created_at', { ascending: false }).limit(20),
    empty
      ? Promise.resolve({ data: [] })
      : supabase.from('lead').select('id, origen, estado').in('negocio_id', scope.negocioIds),
  ])

  const campanias = (campResp.data ?? []) as Campania[]
  const leads = (leadsResp.data ?? []) as Pick<Lead, 'id' | 'origen' | 'estado'>[]

  const alcanceTotal = campanias.reduce((a, c) => a + (c.alcance ?? 0), 0)
  const conversionesTotal = campanias.reduce((a, c) => a + (c.conversiones ?? 0), 0)
  const activas = campanias.filter(c => c.estado === 'activa').length
  const tasa = alcanceTotal > 0 ? (conversionesTotal / alcanceTotal) * 100 : 0

  const leadsPorOrigen = leads.reduce<Record<LeadOrigen, number>>((acc, l) => {
    acc[l.origen] = (acc[l.origen] ?? 0) + 1
    return acc
  }, { formulario: 0, pedido: 0, manual: 0, whatsapp: 0, referido: 0, otro: 0 })

  const canales = [
    { label: 'Formulario web', icon: Globe, valor: `${leadsPorOrigen.formulario} leads`, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'WhatsApp', icon: MessageCircle, valor: `${leadsPorOrigen.whatsapp} leads`, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: 'Referidos', icon: Users, valor: `${leadsPorOrigen.referido} leads`, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { label: 'Otros canales', icon: Share2, valor: `${leadsPorOrigen.manual + leadsPorOrigen.pedido + leadsPorOrigen.otro} leads`, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  ]

  const kpis = [
    { label: 'Alcance total', value: alcanceTotal.toLocaleString('es-AR'), icon: Users, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Conversiones', value: String(conversionesTotal), icon: TrendingUp, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Campañas activas', value: String(activas), icon: Megaphone, bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Tasa conversión', value: `${tasa.toFixed(1)}%`, icon: BarChart2, bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Campañas y estrategias de crecimiento</p>
        </div>
        <button className="btn-primary" disabled>
          <Megaphone size={16} /> Nueva campaña
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon size={18} className={k.color} />
            </div>
            <div className="font-bold text-xl text-gray-900 dark:text-white tabular-nums">{k.value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Campañas recientes</h2>
          </div>
          {campanias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Megaphone size={26} className="text-blue-400 dark:text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Sin campañas todavía</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Cuando crees una campaña aparecerá acá</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {campanias.map(c => {
                const Icon = CANAL_ICON[c.canal] ?? Megaphone
                const conv = c.alcance > 0 ? ((c.conversiones / c.alcance) * 100).toFixed(1) : null
                return (
                  <div key={c.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 shrink-0">
                          <Icon size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{c.nombre}</div>
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                            {CANAL_LABEL[c.canal]} · Alcance: {c.alcance.toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_STYLE[c.estado]}`}>
                          {ESTADO_LABEL[c.estado]}
                        </span>
                        {conv && (
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">{conv}% conv.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Origen de leads</h2>
          </div>
          <div className="p-4 space-y-3">
            {canales.map(c => (
              <div key={c.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div className={`w-8 h-8 rounded-lg ${c.color.split(' ').slice(0,2).join(' ')} flex items-center justify-center`}>
                  <c.icon size={15} className={c.color.split(' ').slice(2).join(' ')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 dark:text-slate-300">{c.label}</div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-500">{c.valor}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Próximamente</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400">
              Automatización de campañas con IA, segmentación avanzada y más.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
