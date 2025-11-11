# Copilot Instructions

## Proyecto: Sistema de Gestión Administrativa Empresarial

### Objetivo
Este proyecto tiene como finalidad desarrollar una aplicación web completa para la gestión administrativa de una empresa. El sistema deberá incluir interfaces modernas, un backend robusto y una integración eficiente con base de datos.

---

### 🧱 Estructura del Proyecto
- **Frontend:** React + TailwindCSS
  - Crear componentes funcionales reutilizables.
  - Mantener una arquitectura de carpetas ordenada por vistas, componentes y servicios.
  - Implementar rutas usando React Router.
  - Usar Tailwind para todo el estilo visual, evitando CSS personalizado salvo casos específicos.

- **Backend:** Node.js + Express
  - Organizar endpoints por módulo (ej. usuarios, facturación, inventario).
  - Implementar middleware para autenticación, validación y manejo de errores.
  - Utilizar controladores claros y bien documentados.

- **Base de datos:** MariaDB
  - Datos de conexión:
    - Host: localhost
    - User: root
    - Password: klandemo
  - Mantener un archivo `.env` para variables sensibles.
  - Implementar ORM (Sequelize) o query builder para la comunicación con la base de datos.

- **Servidor MCP:** Model Context Protocol Server
  - Ubicación: `/backend/mcp-server`
  - Puerto: 4000
  - Permite a GitHub Copilot interactuar directamente con la base de datos
  - Endpoints: `/health`, `/tables`, `/query`, `/table/:name`
  - Estado actual: ✅ Operativo y configurado

- **Servidor MCP GitHub:** Model Context Protocol Server para GitHub
  - Ubicación: `/backend/mcp-github`
  - Puerto: 4001
  - Permite a GitHub Copilot gestionar el repositorio GitHub
  - Endpoints: `/repo`, `/branches`, `/commits`, `/issues`, `/pulls`, `/issue`, `/file`
  - Requiere: Token personal de GitHub configurado en `.env`
  - Estado actual: ✅ Operativo y configurado

---

### 🎨 Estilo Visual / Identidad Corporativa

A continuación se definen los colores y tipografías corporativas que se emplearán en la aplicación para garantizar coherencia y alineación con la identidad de la Guardia Civil, en caso de que el sistema esté destinado a uso o asociación con dicha institución.

- **Colores corporativos**

- Pantone 341 C → “Verde Guardia Civil” (color principal) 

- Pantone 485 C → color secundario (rojo) en algunos usos del emblema. 

- Pantone Process Cyan → otro color usado en determinados soportes. 

- Pantone 116 C → color amarillo vive (sobre soporte con brillo) dentro de la marca. 

- Pantone 109 U → variante para soportes sin brillo. 

- Recomendación para uso en la aplicación:

- Color principal de interfaz (--color-primary): #004E2E (aproximación al Pantone 341C)

- Color de acento / botones (--color-accent): #C8102E (aproximación al Pantone 485C)

- Color de fondo claro / neutro: #F7F9FA

- Color de texto oscuro: #1A1A1A

- Color de alerta / aviso: #FFC700 (aproximación al Pantone 116C)

- **Tipografías**

- Fuente principal (títulos / encabezados): Montserrat, Poppins, Inter (sans-serif)

- Fuente secundaria (texto de párrafo): Roboto, Open Sans, Lato

- **Recomendación de configuración en TailwindCSS**

- **tailwind.config.js**
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#004E2E',
        accent: '#C8102E',
        background: '#F7F9FA',
        text: '#1A1A1A',
        alert: '#FFC700'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif']
      }
    }
  }
};

- **Aplicación práctica**

- Botones primarios deberán usar bg-primary + text-white.

- En hover, podría usarse un tono más claro de primary o un ligero sombreado.

- Encabezados (h1, h2, etc) usar fuente heading.

- Texto normal usar fuente sans.

- Evitar el uso de muchos colores distintos: mantener paleta reducida para claridad y coherencia institucional.

- Usar los colores secundarios/acento solo para destacar elementos (alertas, enlaces especiales, íconos importantes).

### ⚙️ Instrucciones de ejecución
- Antes de inicializar el servidor de desarrollo, **Copilot debe verificar si algún proceso activo está utilizando el mismo puerto**.
  - Si detecta un proceso activo, deberá cerrarlo antes de relanzar el nuevo servidor.
- El lanzamiento de servidores se debe realizar **usando rutas absolutas**:
  - Ejemplo:
    - Frontend: `npm start --prefix /ruta/absoluta/frontend`
    - Backend: `npm start --prefix /ruta/absoluta/backend`
    - Servidor MCP MariaDB: `cd /home/siga/Proyectos/SIGA/backend/mcp-server && npm run start-safe`
    - Servidor MCP GitHub: `cd /home/siga/Proyectos/SIGA/backend/mcp-github && npm run start-safe`
- Evitar el uso de rutas relativas o terminales en directorios incorrectos.
- Los servidores MCP deben estar corriendo para que GitHub Copilot pueda acceder a la base de datos y al repositorio.

---

### 📘 Documentación continua
- Copilot debe crear y mantener actualizado el archivo `README.md`:
  - Incluir descripción del proyecto, tecnologías, instrucciones de instalación y ejecución.
  - Añadir nuevas funcionalidades, cambios y rutas API conforme se desarrollen.
  - Registrar cada modificación en una sección "Historial de Actualizaciones".
- Copilot también debe **actualizar este archivo de instrucciones** conforme se añadan nuevos requerimientos o herramientas.
  - Ejemplo: si se agrega autenticación con JWT, debe documentarse tanto aquí como en el README.
- Los servidores MCP están completamente documentados:
  - MCP MariaDB: `/backend/mcp-server/README.md`
  - MCP GitHub: `/backend/mcp-github/README.md`

---

### 🧩 Buenas prácticas
- Cada nueva función o API debe incluir comentarios descriptivos.
- Validar los datos antes de insertarlos en la base.
- Mantener el código modular y escalable.
- Seguir las convenciones de JavaScript (ES6+).
- Asegurar compatibilidad entre entornos de desarrollo y producción.

---

### 🚀 Misión de Copilot
1. Asistir en la creación y mejora del código según las tecnologías mencionadas.  
2. Mantener el entorno de desarrollo limpio y ordenado.  
3. Actualizar automáticamente la documentación (`README.md` y este archivo).  
4. Garantizar que los procesos se ejecuten de forma segura y eficiente.
5. Utilizar el servidor MCP MariaDB para consultar la base de datos cuando sea necesario.
6. Utilizar el servidor MCP GitHub para gestionar el repositorio cuando sea necesario.
7. Sugerir código basado en el esquema real de la base de datos y el estado del repositorio.

---

## 🔌 Servidores MCP Configurados

### MCP MariaDB
**Estado:** ✅ Operativo  
**URL:** http://localhost:4000  
**Base de datos:** siga_db (MariaDB 11.8.3)

**Capacidades:**
- Consultar estructura de tablas
- Ejecutar queries SQL con parámetros
- Listar todas las tablas de la base de datos
- Health check y monitoreo

**Documentación:** Ver `/backend/mcp-server/CONFIGURACION-EXITOSA.md` para detalles completos.

### MCP GitHub
**Estado:** ✅ Operativo  
**URL:** http://localhost:4001  
**Repositorio:** PrincipeFelipe/SIGA

**Capacidades:**
- Consultar información del repositorio
- Listar ramas, commits, issues y pull requests
- Crear issues y ramas
- Gestionar archivos del repositorio
- Automatizar tareas de desarrollo

**Documentación:** Ver `/backend/mcp-github/README.md` para detalles completos.

---

## ✅ Estado Actual del Backend (22 de octubre de 2025)

### Implementación Completada al 100%

**Controladores y Rutas Implementados:**
1. ✅ **Auth** (`auth.controller.js` + `auth.routes.js`)
   - Login, Logout, Me, Change Password
   
2. ✅ **Usuarios** (`usuarios.controller.js` + `usuarios.routes.js`)
   - CRUD completo con filtrado jerárquico
   - Reset de contraseñas
   - 6 endpoints totales
   
3. ✅ **Unidades** (`unidades.controller.js` + `unidades.routes.js`)
   - Árbol jerárquico, lista plana, descendientes con CTE
   - CRUD completo
   - 7 endpoints totales
   
4. ✅ **Roles** (`roles.controller.js` + `roles.routes.js`)
   - CRUD completo
   - Asignación de permisos
   - 7 endpoints totales
   
5. ✅ **Permisos** (`permisos.controller.js` + `permisos.routes.js`)
   - CRUD completo
   - Listado por recurso
   - 6 endpoints totales
   
6. ✅ **Usuario_Roles_Alcance** (`roles-alcance.controller.js` + `roles-alcance.routes.js`)
   - Asignación/revocación de roles con alcance
   - Actualización masiva
   - 4 endpoints totales
   
7. ✅ **Notificaciones** (`notificaciones.controller.js` + `notificaciones.routes.js`)
   - Listar, marcar como leída, contador de no leídas
   - 6 endpoints totales
   
8. ✅ **Logs** (`logs.controller.js` + `logs.routes.js`)
   - Auditoría completa con filtros avanzados
   - Estadísticas de uso
   - 4 endpoints totales
   
9. ✅ **Menú** (`menu.controller.js` + `menu.routes.js`)
   - Menú dinámico según permisos
   - 1 endpoint

**Total: 40+ endpoints REST completamente funcionales**

### Middleware de Seguridad
- ✅ `authenticate` - Verificación JWT con cookies HttpOnly
- ✅ `authorize` - Autorización jerárquica con CTEs recursivos
- ✅ `requirePermission` - Permisos simples sin validación de recurso
- ✅ `auditLog` - Registro automático de operaciones CUD

### Características de Seguridad
- JWT con expiración de 24 horas
- Cookies HttpOnly para prevenir XSS
- Bcrypt con 10 rounds para passwords
- Rate limiting: 5 intentos login / 15 minutos
- Rate limiting global: 100 requests / 15 minutos
- Helmet para headers de seguridad
- CORS configurado
- Validación de entrada
- Prevención de auto-eliminación
- Prevención de eliminación con dependencias

### Base de Datos
- 9 tablas relacionales
- 1 función SQL (es_unidad_descendiente con CTE recursivo)
- 2 vistas (v_usuarios_roles_alcances, v_permisos_usuario)
- 30 unidades organizacionales en 4 niveles
- 8 usuarios de prueba
- 4 roles predefinidos
- 26 permisos atómicos

### Scripts Disponibles
- `backend/test-api.sh` - Script completo de pruebas de todos los endpoints
- `backend/scripts/generate-password-hashes.js` - Generar hashes bcrypt
- `backend/mcp-server/start-mcp.js` - Iniciar servidor MCP MariaDB
- `backend/mcp-github/start-mcp.js` - Iniciar servidor MCP GitHub

### Documentación Generada
- ✅ `backend/IMPLEMENTACION-COMPLETADA.md` - Resumen completo del backend
- ✅ `README.md` - Documentación principal actualizada
- ✅ Este archivo (copilot-instructions.md) actualizado

### Frontend Implementado (23 de octubre de 2025)

**Configuración Base:**
- ✅ React 19.2.0 con Create React App
- ✅ TailwindCSS 3.4.1 con identidad corporativa
- ✅ React Router DOM 7.9.4
- ✅ Axios 1.12.2 con interceptores
- ✅ AuthContext para estado global

**Componentes Comunes Creados:**
- ✅ Button (6 variantes con loading state)
- ✅ Input (con validación y errores)
- ✅ Card (contenedor con header/footer)
- ✅ Modal (diálogos con overlay)
- ✅ Badge (7 variantes de estado)
- ✅ Loading (spinner con fullScreen)
- ✅ TableActions (acciones con permisos)

**Layout:**
- ✅ Sidebar (navegación con iconos + menú dinámico)
- ✅ Header (pendiente completar)
- ✅ Layout (wrapper principal)

**Autenticación:**
- ✅ LoginPage (formulario completo)
- ✅ ChangePasswordPage (con modo forzado)
- ✅ ProtectedRoute (HOC para rutas)
- ✅ AuthContext (login, logout, checkAuth, menú dinámico)

**Servicios:**
- ✅ api.js (Axios con interceptores 401/403/404/429/500)
- ✅ authService.js (login, logout, me, changePassword)
- ✅ menuService.js (obtenerMenu dinámico)
- ✅ usuarioRolesService.js (gestión de roles con alcance)

**Páginas CRUD:**
- ✅ DashboardPage (estadísticas básicas)
- ✅ UsersListPage (listado con filtros y permisos granulares)
- ✅ UserFormModal (crear/editar + modo readOnly)
- ✅ UserRolesModal (asignar roles con alcance)

**Hooks Personalizados:**
- ✅ usePermissions (verificación granular de permisos)
  - hasPermission(), hasAnyPermission(), hasAllPermissions()
  - Permisos específicos: can.viewUsers, can.editUsers, can.viewUserDetail, etc.

**Características Avanzadas:**
- ✅ Permisos granulares (botones específicos por permiso)
- ✅ Modal de solo lectura (banner + campos disabled)
- ✅ Combobox personalizado con búsqueda integrada
- ✅ Filtrado jerárquico de usuarios según alcance
- ✅ Menú dinámico según permisos del usuario
- ✅ Click-outside detection para dropdowns
- ✅ Auto-enfoque en campos de búsqueda

**Estilos:**
- ✅ Colores corporativos (#004E2E primary, #C8102E accent)
- ✅ Fuentes: Inter (body), Montserrat (headings)
- ✅ Animaciones: fadeIn, slideIn
- ✅ Utilidades: btn-*, input-field, card, badge-*

**Scripts de Testing:**
- ✅ test-api.sh (prueba todos los endpoints)
- ✅ test-user-permissions.sh (verifica permisos R84101K)
- ✅ test-filtrado-jerarquico.sh (prueba alcance jerárquico)
- ✅ test-menu.sh (prueba menú dinámico)
- ✅ test-combobox-unidad.sh (documentación visual combobox)
- ✅ demo-menu-dinamico.sh (demo interactiva)

**Scripts de Gestión:**
- ✅ start-all.sh (inicia backend + frontend)
- ✅ stop-all.sh (detiene todos los servicios)

**Estado:** Frontend funcional, corriendo en http://localhost:3000

---

### Documentación Completa Generada (4 de noviembre de 2025)

**Guías de Usuario:**
- ✅ GUIA-MENU-DINAMICO.md - Cómo usar el menú dinámico
- ✅ SCRIPTS-INICIO.md - Uso de start-all.sh y stop-all.sh
- ✅ CREDENCIALES-PRUEBA.md - Usuarios de prueba del sistema

**Documentación Técnica:**
- ✅ MENU-DINAMICO-IMPLEMENTADO.md - Implementación completa del menú
- ✅ RESUMEN-MENU-DINAMICO.md - Resumen ejecutivo del menú
- ✅ CORRECCIONES-PERMISOS-GRANULARES.md - Permisos granulares en UI
- ✅ MODAL-SOLO-LECTURA.md - Modal readOnly con banner
- ✅ MODULO-UNIDADES-COMPLETO.md - Documentación del módulo unidades

**Debugging y Troubleshooting:**
- ✅ DEBUG-MENU-FRONTEND.sh - Instrucciones de debugging
- ✅ TROUBLESHOOTING-MENU.md - Solución de problemas del menú
- ✅ verify-permissions.sh - Verificar permisos del backend

**Pruebas y Checklists:**
- ✅ CHECKLIST-PRUEBAS-FRONTEND.md - Lista de pruebas del frontend
- ✅ PRUEBAS-COMPLETAS-24-OCT-2025.md - Resultados de pruebas
- ✅ ITERACION-COMPLETADA-24-OCT-2025.md - Resumen de iteración

---

### Estado Actual (4 de noviembre de 2025)

**✅ SISTEMA COMPLETAMENTE FUNCIONAL**

**Backend (Puerto 5000):**
- 40+ endpoints REST operativos
- 9 tablas relacionales + 1 función SQL + 2 vistas
- Autenticación JWT con cookies HttpOnly
- Middleware de autorización jerárquica
- Audit logging automático
- Rate limiting configurado

**Frontend (Puerto 3000):**
- Sistema de login y autenticación completo
- Dashboard con estadísticas
- Módulo de usuarios con CRUD completo
- Sistema de permisos granulares
- Menú dinámico basado en permisos
- Modal de solo lectura para usuarios sin permisos
- Combobox personalizado con búsqueda integrada
- Componentes reutilizables (Button, Card, Modal, Badge, etc.)

**Servidores MCP:**
- MCP MariaDB (puerto 4000) - Acceso a base de datos
- MCP GitHub (puerto 4001) - Gestión del repositorio

**Scripts Disponibles:**
- `./start-all.sh` - Inicia todo el sistema
- `./stop-all.sh` - Detiene todo el sistema
- `./backend/test-*.sh` - Scripts de prueba automatizados

**Características de Seguridad:**
- JWT con expiración de 24 horas
- Cookies HttpOnly para prevenir XSS
- Bcrypt con 10 rounds para passwords
- Rate limiting: 5 intentos login / 15 minutos
- CORS configurado correctamente
- Validación de entrada en todos los endpoints
- Permisos granulares verificados en backend y frontend

**Usuarios de Prueba:**
```
admin / Admin123!           → Acceso total (32 permisos)
jefe.zona.norte / Password123! → Gestor de zona
coord.huesca / Coord123!    → Coordinador
R84101K / klandemo          → Usuario básico (6 permisos)
```

**Documentación:**
- 20+ archivos de documentación
- Scripts de prueba con ejemplos
- Guías de troubleshooting
- Documentación técnica completa

**Módulos Implementados:**
1. ✅ **Usuarios** - CRUD con filtrado jerárquico
2. ✅ **Unidades** - Árbol organizacional
3. ✅ **Roles y Permisos** - Sistema RBAC completo
4. ✅ **Tareas** - Gestión de tareas con filtrado jerárquico ⭐
   - Dashboard con estadísticas duales (personal + jerárquicas)
   - Campo es_241 con cálculo automático de 90 días
   - Triggers de base de datos
   - Filtrado por alcance organizacional

**Últimas Implementaciones (10 de noviembre de 2025):**

- ✅ **Sistema de Alertas Automáticas** - ⭐ Completado al 100% en backend:
  - **Triggers en Base de Datos:**
    - `after_tarea_insert`: Notifica al usuario cuando se le asigna una tarea
    - `after_tarea_update`: Notifica en reasignación (a ambos usuarios) y completación (al creador)
  - **Events Programados (MariaDB):**
    - `check_tareas_proximas_vencer`: Ejecuta diariamente a las 8:00 AM, alerta tareas que vencen en 0-3 días
    - `check_tareas_vencidas`: Ejecuta diariamente a las 9:00 AM, alerta tareas vencidas no completadas
  - **Tipos de Notificaciones:**
    - `info`: Información general, reasignaciones
    - `warning`: Tareas próximas a vencer (2-3 días), prioridad media/alta
    - `error`: Tareas vencidas, prioridad urgente, tareas que vencen hoy/mañana
    - `success`: Tareas completadas
  - **Endpoints API:** Sistema completo de notificaciones (listar, marcar leída, contador, eliminar)
  - **Pruebas Realizadas:**
    - ✅ Trigger asignación: Notificaciones ID 4, 7 generadas automáticamente
    - ✅ Mapeo de prioridad: Urgente → error, Alta → warning
    - ✅ Alertas próximas a vencer: 2 tareas detectadas, 2 notificaciones generadas
    - ✅ Alerta de tarea vencida: Notificación ID 8 generada
  - **Estado:** Sistema 100% completado (backend + frontend)
  - **Frontend:** NotificationBell (header), NotificationItem, NotificationListPage con Layout completo
  - **Documentación:** 
    - `SISTEMA-ALERTAS-COMPLETADO.md` (resumen backend con 350+ líneas SQL)
    - `FRONTEND-NOTIFICACIONES-COMPLETADO.md` (implementación frontend)
    - `MODULO-NOTIFICACIONES-LAYOUT-COMPLETADO.md` (integración con Layout)
    - `TROUBLESHOOTING-NOTIFICACIONES-R84.md` (resolución de problemas)

- ✅ **Permisos Globales** (7 de noviembre de 2025):
  - Admin ahora tiene permiso `users:view_all` para ver todos los usuarios sin filtrado jerárquico
  - Admin tiene permiso `units:view_all` para ver todas las unidades del sistema
  - Modificado `usuarios.controller.js` para verificar permisos antes de aplicar filtrado
  - Dashboard principal muestra estadísticas correctas según alcance del usuario
  - Admin ve 10/10 usuarios (incluyendo R84101K en Ceuta y jefe.zona.norte en Andalucía)
  - Verificación con script: `backend/test-user-permissions.sh`

- ✅ **Estadísticas Jerárquicas** (7 de noviembre de 2025):
  - Sección "Mis Tareas" (estadísticas personales)
  - Sección "Tareas de mi Ámbito" (estadísticas filtradas jerárquicamente)
  - Badge "Incluye unidades dependientes"
  - Filtrado automático según permisos (tasks:view_all, tasks:view, tasks:view_own)
  - Verificación con script: `backend/test-estadisticas-jerarquicas.sh`
  - Documentación completa: `ESTADISTICAS-JERARQUICAS-COMPLETADO.md`

---

### Frontend Implementado (23 de octubre de 2025) [LEGACY]

**Configuración Base:**
- ✅ React 19.2.0 con Create React App
- ✅ TailwindCSS 3.4.1 con identidad corporativa
- ✅ React Router DOM 7.9.4
- ✅ Axios 1.12.2 con interceptores
- ✅ AuthContext para estado global

**Componentes Comunes Creados:**
- ✅ Button (6 variantes con loading state)
- ✅ Input (con validación y errores)
- ✅ Card (contenedor con header/footer)
- ✅ Modal (diálogos con overlay)
- ✅ Badge (7 variantes de estado)
- ✅ Loading (spinner con fullScreen)

**Layout:**
- ✅ Sidebar (navegación con iconos)
- ✅ Header (pendiente implementar)
- ✅ Layout (wrapper principal)

**Autenticación:**
- ✅ LoginPage (formulario completo)
- ✅ ChangePasswordPage (con modo forzado)
- ✅ ProtectedRoute (HOC para rutas)
- ✅ AuthContext (login, logout, checkAuth)

**Servicios:**
- ✅ api.js (Axios con interceptores 401/403/404/429/500)
- ✅ authService.js (login, logout, me, changePassword)

**Páginas:**
- ✅ DashboardPage (estadísticas básicas)

**Estilos:**
- ✅ Colores corporativos (#004E2E primary, #C8102E accent)
- ✅ Fuentes: Inter (body), Montserrat (headings)
- ✅ Animaciones: fadeIn, slideIn
- ✅ Utilidades: btn-*, input-field, card, badge-*

**Estado:** Frontend funcional, corriendo en http://localhost:3000

**Próximos Pasos Sugeridos**
1. ~~**Frontend React**~~ ✅ **COMPLETADO** - Base funcional con login y dashboard
2. ~~**Sistema de permisos granulares**~~ ✅ **COMPLETADO** - Hook usePermissions, filtrado jerárquico
3. ~~**Modal de solo lectura**~~ ✅ **COMPLETADO** - UserFormModal con modo readOnly
4. ~~**Combobox personalizado**~~ ✅ **COMPLETADO** - Selector de unidades con búsqueda integrada
5. ~~**Menú dinámico**~~ ✅ **COMPLETADO** - Sidebar basado en permisos del usuario
6. ~~**Sistema de notificaciones**~~ ✅ **COMPLETADO** - NotificationBell, NotificationItem, NotificationListPage
7. **WebSockets para notificaciones** - Tiempo real sin polling
8. **Logs Viewer** - Tabla con filtros y paginación
9. **Documentación API** - Generar Swagger/OpenAPI docs
10. **Tests automatizados** - Jest + Supertest para tests unitarios
11. **CI/CD** - Configurar GitHub Actions
12. **Despliegue** - Docker + docker-compose para staging/production

---