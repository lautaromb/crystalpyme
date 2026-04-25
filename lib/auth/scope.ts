import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Role, SubRol } from '@/types'

export interface AuthScope {
  userId: string
  rol: Role
  subRol: SubRol | null
  tenantId: string
  /** superadmin ve todo */
  isSuper: boolean
  /** suscriptor ve sus negocios, empleados ven solo el suyo */
  isSuscriptor: boolean
  isOwner: boolean
  negocios: { id: string; nombre: string }[]
  negocioIds: string[]
  /** solo para empleados: el negocio al que pertenecen */
  negocioId: string | null
}

export async function getAuthScope(): Promise<AuthScope> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: yo } = await supabase
    .from('usuario')
    .select('id, rol, sub_rol, tenant_id, negocio_id, activo')
    .eq('id', user.id)
    .single()

  if (!yo || !yo.activo) redirect('/login')

  const rol = yo.rol as Role
  const subRol = (yo.sub_rol ?? null) as SubRol | null
  const isSuper = rol === 'superadmin'
  const isSuscriptor = rol === 'suscriptor'
  const isOwner = rol === 'empleado' && subRol === 'owner'

  let negocios: { id: string; nombre: string }[] = []

  if (isSuper) {
    const { data } = await supabase.from('negocio').select('id, nombre').order('nombre')
    negocios = (data ?? []) as { id: string; nombre: string }[]
  } else if (isSuscriptor) {
    const { data } = await supabase.from('negocio').select('id, nombre').eq('tenant_id', yo.tenant_id).order('nombre')
    negocios = (data ?? []) as { id: string; nombre: string }[]
  } else if (yo.negocio_id) {
    const { data } = await supabase.from('negocio').select('id, nombre').eq('id', yo.negocio_id).single()
    negocios = data ? [data as { id: string; nombre: string }] : []
  }

  return {
    userId: user.id,
    rol,
    subRol,
    tenantId: yo.tenant_id,
    isSuper,
    isSuscriptor,
    isOwner,
    negocios,
    negocioIds: negocios.map(n => n.id),
    negocioId: yo.negocio_id ?? null,
  }
}

export function assertNegocioAllowed(scope: AuthScope, negocioId: string) {
  if (!scope.negocioIds.includes(negocioId)) {
    throw new Error('No tenés permisos sobre este negocio')
  }
}

export function requireRole(scope: AuthScope, roles: Role[]) {
  if (!roles.includes(scope.rol)) redirect('/dashboard')
}

export function requireSubRol(scope: AuthScope, subRoles: SubRol[]) {
  if (!scope.subRol || !subRoles.includes(scope.subRol)) redirect('/dashboard')
}
