<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

# CrystalPyme — Contexto del proyecto

## ¿Qué es esto?
SaaS multi-tenant de gestión para PyMEs argentinas. Los dueños de negocios pagan una suscripción mensual y obtienen un panel para gestionar ventas, productos, clientes y marketing. A futuro, cada negocio tendrá su propio subdominio con ecommerce público.

## Stack
- **Next.js 16** con App Router (no Pages Router)
- **Supabase** para auth, base de datos y storage
- **Tailwind CSS v4** para estilos
- **TypeScript** estricto
- **Lucide React** para íconos

## Estructura de carpetas
```
app/
  (auth)/         → Rutas públicas: login
  (dashboard)/    → Rutas protegidas: panel de gestión
    dashboard/    → Métricas principales
    admin/        → Solo superadmin (usuarios, negocios)
components/
  layout/         → Sidebar, TopBar
lib/
  supabase/
    client.ts     → Cliente para componentes 'use client'
    server.ts     → Cliente para Server Components (async)
middleware.ts     → Protección de rutas por auth
types/index.ts    → Todos los tipos TypeScript del proyecto
```

## Base de datos (Supabase)
Las tablas principales son:
- `tenant` — cada negocio/cliente que paga suscripción
- `tenant_config` — configuración por tenant (token bot, moneda, etc)
- `usuario` — usuarios del sistema con roles
- `negocio` — datos del negocio
- `articulo` — productos/artículos
- `cliente` — clientes del negocio
- `venta` + `detalleventa` — ventas
- `auditoria` — log de acciones
- `sesion` — sesiones del bot de Telegram
- `faq` — preguntas frecuentes por tenant

## Roles de usuario
```
superadmin  → control total, ve todos los tenants
admin       → gestiona su propio negocio
vendedor    → acceso a ventas y productos
cliente     → solo compras (futuro)
```

## Reglas importantes al escribir código

### Supabase server vs client
- En Server Components usar: `import { createClient } from '@/lib/supabase/server'` y hacer `await createClient()`
- En Client Components ('use client') usar: `import { createClient } from '@/lib/supabase/client'` sin await

### Multi-tenant
- Siempre filtrar por `tenant_id` en las queries para no mezclar datos entre negocios
- El `tenant_id` del usuario actual se obtiene de la tabla `public.usuario`

### Estilos
- Usar las clases utilitarias definidas en `globals.css`: `btn-primary`, `btn-secondary`, `btn-ghost`, `input`, `input-label`, `card`, `card-hover`, `badge`, `badge-green`, `badge-blue`, `badge-yellow`, `badge-red`, `badge-gray`, `divider`
- Colores principales: `sky-400/500` (brand), fondo `#0f172a`, superficie `#1e293b`
- NO usar clases de Tailwind que no existan en v4 con el nuevo sistema de imports

### Convenciones de archivos
- Páginas server: `page.tsx` sin 'use client'
- Componentes con estado o eventos: agregar 'use client' arriba
- Colocar subcomponentes de una página en el mismo directorio (ej: `UsuariosTable.tsx` junto a `page.tsx`)

### Protección de rutas por rol
- Verificar rol en el server component de cada página restringida
- Si el rol no tiene acceso → `redirect('/dashboard')`

## Variables de entorno necesarias
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

## Comandos útiles
```bash
npm run dev      # desarrollo local en localhost:3000
npm run build    # build de producción
npm run lint     # linter
```

## Lo que viene (no implementado aún)
- ABM Productos con gestión de stock
- ABM Clientes con historial de compras
- Módulo de Ventas completo
- Integración MercadoPago (QR y links de pago)
- Subdominios por negocio para ecommerce público
- Bot de Telegram funcional
- Panel de marketing con análisis de ventas
- Agenda/turnos

<!-- END:nextjs-agent-rules -->
