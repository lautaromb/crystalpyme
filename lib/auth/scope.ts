import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Role } from '@/types'

export interface AuthScope {
  userId: string
  rol: Role
  tenantId: string
  isSuper: boolean
  negocios: { id: string; nombre: string }[]
  negocioIds: string[]
}

/**
 * Resuelve el alcance de datos del usuario actual.
 * - superadmin → todos los negocios
 * - resto → negocios de su tenant
 *
 * Usar en cada Server Component que toque datos multi-tenant.
 * Si no hay sesión o el usuario está deshabilitado redirige a /login o /dashboard.
 */
export async function getAuthScope(): Promise<AuthScope> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: yo } = await supabase
    .from('usuario')
    .select('id, rol, tenant_id, activo')
    .eq('id', user.id)
    .single()

  if (!yo || !yo.activo) redirect('/login')

  const isSuper = yo.rol === 'superadmin'

  let q = supabase.from('negocio').select('id, nombre').order('nombre')
  if (!isSuper) q = q.eq('tenant_id', yo.tenant_id)
  const { data: negocios } = await q

  const list = (negocios ?? []) as { id: string; nombre: string }[]

  return {
    userId: user.id,
    rol: yo.rol as Role,
    tenantId: yo.tenant_id,
    isSuper,
    negocios: list,
    negocioIds: list.map(n => n.id),
  }
}

/** Verifica que un negocioId esté dentro del scope del usuario. Lanza si no. */
export function assertNegocioAllowed(scope: AuthScope, negocioId: string) {
  if (!scope.negocioIds.includes(negocioId)) {
    throw new Error('No tenés permisos sobre este negocio')
  }
}

/** Útil para restringir páginas por rol. */
export function requireRole(scope: AuthScope, roles: Role[]) {
  if (!roles.includes(scope.rol)) redirect('/dashboard')
}
