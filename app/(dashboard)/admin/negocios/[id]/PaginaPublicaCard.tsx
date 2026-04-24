'use client'

import { useState } from 'react'
import { Globe, ExternalLink, Pencil, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'
import { configurarPaginaPublica } from './actions'
import type { Negocio } from '@/types'

interface Props {
  negocio: Negocio
  appUrl: string
}

export default function PaginaPublicaCard({ negocio, appUrl }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [slug, setSlug] = useState(negocio.slug ?? '')
  const [descripcion, setDescripcion] = useState(negocio.descripcion ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const tieneSlug = !!negocio.slug
  const urlPublica = `${appUrl}/p/${negocio.slug}`

  function abrirModal() {
    setSlug(negocio.slug ?? '')
    setDescripcion(negocio.descripcion ?? '')
    setError(null)
    setSuccess(false)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!slug.trim()) return
    setLoading(true)
    setError(null)
    try {
      await configurarPaginaPublica(negocio.id, slug.trim(), descripcion.trim())
      setSuccess(true)
      setTimeout(() => { setModalOpen(false); setSuccess(false) }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function sanitizeSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-{2,}/g, '-')
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-blue-500" />
            <h2 className="font-semibold text-slate-900">Página pública</h2>
          </div>
          <button
            onClick={abrirModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Pencil size={11} />
            {tieneSlug ? 'Editar página' : 'Crear página'}
          </button>
        </div>

        {tieneSlug ? (
          <div className="space-y-3">
            {/* URL pill */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
              <Globe size={13} className="text-slate-400 shrink-0" />
              <span className="text-slate-500 text-xs">{appUrl}/p/</span>
              <span className="text-slate-800 text-sm font-semibold">{negocio.slug}</span>
            </div>

            {/* Link externo */}
            <a
              href={urlPublica}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink size={12} /> Ver página pública
            </a>

            {/* Descripción preview */}
            {negocio.descripcion && (
              <p className="text-xs text-slate-500 italic border-t border-gray-100 pt-3 line-clamp-2">
                &ldquo;{negocio.descripcion}&rdquo;
              </p>
            )}
            {!negocio.descripcion && (
              <p className="text-xs text-amber-600 border-t border-gray-100 pt-3">
                Sin descripción — agregá una para que la página se vea mejor.
              </p>
            )}
          </div>
        ) : (
          /* Estado vacío */
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Globe size={18} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Sin página configurada</p>
            <p className="text-xs text-slate-400 mb-4 max-w-[200px] mx-auto">
              Creá la página pública para que este cliente pueda mostrarla a sus clientes
            </p>
            <button
              onClick={abrirModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
                         bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Globe size={12} /> Crear página ahora
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget && !loading) setModalOpen(false) }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Globe size={15} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    {tieneSlug ? 'Editar página pública' : 'Crear página pública'}
                  </h2>
                  <p className="text-xs text-slate-500">{negocio.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => { if (!loading) setModalOpen(false) }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <CheckCircle2 size={44} className="text-emerald-500" />
                <p className="font-semibold text-slate-900">
                  {tieneSlug ? 'Página actualizada' : '¡Página creada!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* URL */}
                <div>
                  <label className="input-label">URL de la página *</label>
                  <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-300 whitespace-nowrap select-none">
                      {appUrl}/p/
                    </span>
                    <input
                      value={slug}
                      onChange={e => setSlug(sanitizeSlug(e.target.value))}
                      className="flex-1 px-3 py-2.5 text-sm bg-white text-slate-900 outline-none"
                      placeholder="mi-negocio"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Solo letras minúsculas, números y guiones. Este es el link que le compartís al cliente.
                  </p>
                </div>

                {/* Preview URL */}
                {slug && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Vista previa del link</p>
                    <p className="text-sm text-blue-800 font-semibold break-all">{appUrl}/p/{slug}</p>
                  </div>
                )}

                {/* Descripción */}
                <div>
                  <label className="input-label">Descripción del negocio</label>
                  <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    className="input resize-none"
                    rows={3}
                    placeholder="Breve descripción que verán los visitantes de la página…"
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Aparece en la página pública. El cliente puede editarla después.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle size={13} className="shrink-0" /> {error}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={loading}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !slug.trim()}
                    className="btn-primary flex-1"
                  >
                    {loading
                      ? <Loader2 size={14} className="animate-spin" />
                      : tieneSlug ? 'Guardar cambios' : 'Crear página'}
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
