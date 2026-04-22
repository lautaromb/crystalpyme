export type Role = 'superadmin' | 'admin' | 'vendedor' | 'cliente'
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'
export type TenantPlan = 'basic' | 'pro' | 'enterprise'
export type NegocioEstado = 'active' | 'inactive' | 'trial'

export interface Usuario {
  id: string
  tenant_id: string
  telegram_id?: string | null
  nombre: string
  username?: string | null
  rol: Role
  activo: boolean
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  nombre: string
  descripcion?: string | null
  plan: Plan
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Negocio {
  id: string
  nombre: string
  razonsocial?: string | null
  rubro?: string | null
  direccion?: string | null
  estado: NegocioEstado
  fechacreacion: string
  proximopago?: string | null
  preciomensual?: number | null
  plantipo: TenantPlan
  created_at?: string | null
}

export interface Articulo {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  precio: number
  stock?: number | null
  stockminimo?: number | null
  negocio_id: string
  categoria?: string | null
  fechacreacion: string
  tenant_id: string
  activo: boolean
  deleted_at?: string | null
  updated_at: string
}

export interface Cliente {
  id: string
  nombre: string
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  negocio_id: string
  notas?: string | null
  fecharegistro: string
  estado: 'active' | 'inactive'
  created_at?: string | null
}

export interface Venta {
  id: string
  fecha: string
  total: number
  estado: 'pendiente' | 'entregada' | 'cancelada'
  usuario_id: string
  cliente_id: string
  negocio_id: string
  notas?: string | null
  tenant_id: string
  entregada: boolean
  deleted_at?: string | null
  updated_at: string
}

export interface SessionUser {
  id: string
  email: string
  rol: Role
  nombre: string
  tenant_id: string
  activo: boolean
}
