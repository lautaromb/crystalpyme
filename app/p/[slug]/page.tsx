import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Mail, Package } from 'lucide-react'

export default async function PaginaPublicaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: negocio } = await supabase
    .from('negocio')
    .select('id, nombre, rubro, descripcion, email, direccion, estado, plantipo')
    .eq('slug', slug)
    .single()

  if (!negocio || negocio.estado === 'suspendido' || negocio.estado === 'inactive') {
    notFound()
  }

  const iniciales = negocio.nombre
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header decorativo */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400" />

      <main className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-3xl tracking-tight">{iniciales}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{negocio.nombre}</h1>
            {negocio.rubro && (
              <p className="text-slate-500 mt-1 text-lg">{negocio.rubro}</p>
            )}
          </div>
          {negocio.estado === 'trial' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Negocio en período de prueba
            </span>
          )}
        </div>

        {/* Descripción */}
        {negocio.descripcion ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-slate-700 leading-relaxed text-center">{negocio.descripcion}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-slate-400 italic text-sm">Este negocio todavía no agregó una descripción.</p>
          </div>
        )}

        {/* Contacto */}
        {(negocio.email || negocio.direccion) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Contacto</h2>
            {negocio.email && (
              <a
                href={`mailto:${negocio.email}`}
                className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Mail size={14} className="text-blue-600" />
                </div>
                <span className="text-sm">{negocio.email}</span>
              </a>
            )}
            {negocio.direccion && (
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-slate-500" />
                </div>
                <span className="text-sm">{negocio.direccion}</span>
              </div>
            )}
          </div>
        )}

        {/* Productos — placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
            <Package size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium text-sm">Catálogo de productos</p>
          <p className="text-slate-400 text-xs mt-1">Próximamente disponible</p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pt-4">
          Página creada con{' '}
          <span className="font-semibold text-blue-500">CrystalPyme</span>
        </p>
      </main>
    </div>
  )
}
