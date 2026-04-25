export type Role = 'superadmin' | 'admin' | 'vendedor' | 'cliente'
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'
export type TenantPlan = string
export type NegocioEstado = 'active' | 'inactive' | 'trial' | 'suspendido'
export type PagoEstado = 'pagado' | 'pendiente' | 'fallido'

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
  tenant_id?: string | null
  nombre: string
  slug?: string | null
  dominio_custom?: string | null
  descripcion?: string | null
  razonsocial?: string | null
  rubro?: string | null
  direccion?: string | null
  email?: string | null
  estado: NegocioEstado
  fechacreacion: string
  proximopago?: string | null
  preciomensual?: number | null
  plantipo: TenantPlan
  ultima_actividad?: string | null
  pagina_config?: PaginaConfig | null
  created_at?: string | null
  updated_at?: string | null
}

export interface PlanSaaS {
  id: string
  nombre: string
  precio: number
  intervalo: 'mensual' | 'anual'
  descripcion?: string | null
  limite_productos?: number | null
  limite_usuarios?: number | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Pago {
  id: string
  negocio_id: string
  monto: number
  fecha: string
  estado: PagoEstado
  notas?: string | null
  metodo: string
  created_at: string
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
  imagen_url?: string | null
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

export interface DetalleVenta {
  id: string
  venta_id: string
  articulo_id?: string | null
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

export type CampaniaCanal = 'email' | 'whatsapp' | 'sms' | 'redes' | 'otro'
export type CampaniaEstado = 'borrador' | 'activa' | 'pausada' | 'finalizada'

export interface Campania {
  id: string
  negocio_id: string
  nombre: string
  canal: CampaniaCanal
  estado: CampaniaEstado
  alcance: number
  conversiones: number
  notas?: string | null
  fecha_inicio?: string | null
  fecha_fin?: string | null
  created_at: string
  updated_at: string
}

export type TemplateId = 'vitrina' | 'barrio' | 'impacto' | 'editorial' | 'retro' | 'luxe'

export type SeccionTipo = 'descripcion' | 'productos' | 'contacto' | 'formulario'
export interface SeccionItem {
  id: SeccionTipo
  visible: boolean
}

export type FormularioCampoTipo = 'texto' | 'email' | 'telefono' | 'textarea' | 'select' | 'checkbox'
export interface FormularioCampo {
  id: string
  tipo: FormularioCampoTipo
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

export interface Formulario {
  id: string
  negocio_id: string
  nombre: string
  descripcion?: string | null
  campos: FormularioCampo[]
  mensaje_exito: string
  activo: boolean
  created_at: string
  updated_at: string
}

export type LeadEstado  = 'nuevo' | 'contactado' | 'calificado' | 'ganado' | 'perdido'
export type LeadOrigen  = 'formulario' | 'pedido' | 'manual' | 'whatsapp' | 'referido' | 'otro'

export interface Lead {
  id: string
  negocio_id: string
  nombre: string
  email?: string | null
  telefono?: string | null
  mensaje?: string | null
  estado: LeadEstado
  origen: LeadOrigen
  formulario_id?: string | null
  pedido_id?: string | null
  cliente_id?: string | null
  datos_extra?: Record<string, string | number | boolean> | null
  notas?: string | null
  valor_estimado?: number | null
  created_at: string
  updated_at: string
}

export interface PaginaConfig {
  template: TemplateId
  colores: {
    primario: string
    fondo: string
    texto: string
  }
  secciones: SeccionItem[]
  hero: {
    titulo: string
    subtitulo: string
    ctaTexto: string
    imagenUrl?: string | null
  }
  logoUrl?: string | null
  descripcion?: string
  formularioId?: string | null
  seo?: {
    titulo?: string
    descripcion?: string
    ogImage?: string | null
  }
  shop?: {
    habilitado: boolean
    mensajeExito?: string
  }
  estilo?: {
    productosVista?: 'cuadricula' | 'lista'
    heroEstilo?: 'full' | 'split' | 'minimal'
    accentStyle?: 'solid' | 'outline' | 'ghost'
  }
}

export interface Pedido {
  id: string
  negocio_id: string
  cliente_id?: string | null
  email: string
  nombre: string
  telefono?: string | null
  direccion?: string | null
  notas?: string | null
  total: number
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'
  metodo_pago?: string | null
  created_at: string
  updated_at: string
}

export interface PedidoItem {
  id: string
  pedido_id: string
  articulo_id?: string | null
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

export interface SessionUser {
  id: string
  email: string
  rol: Role
  nombre: string
  tenant_id: string
  activo: boolean
}
