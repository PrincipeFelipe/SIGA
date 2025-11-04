# Sistema de Gestión Administrativa Empresarial (SIGA)

**Plataforma Interna de Gestión (PIG)** - Sistema de Control de Acceso Jerárquico con Roles y Permisos

Esta aplicación web tiene como objetivo facilitar la gestión administrativa integral de una empresa, combinando una interfaz moderna con operaciones seguras y control de acceso basado en jerarquía organizacional.

---

## 🎯 Características Principales

### ⭐ Sistema de Autorización Jerárquico
- Control de acceso basado en **estructura organizacional** (Zonas → Comandancias → Compañías → Puestos)
- Permisos que **se heredan** automáticamente a unidades descendientes
- Validación con **CTEs recursivos** en SQL para máxima eficiencia
- Asignación de roles con **alcance específico** por unidad organizacional

### 🔐 Seguridad Robusta
- Autenticación JWT con **cookies HttpOnly**
- **Hashing bcrypt** para contraseñas (10 rounds)
- **Rate limiting**: 5 intentos de login / 15 minutos
- **Auditoría automática** de todas las operaciones
- Headers de seguridad con **Helmet**
- **CORS** configurado para origen específico

### 📊 Gestión Completa
- **Usuarios**: CRUD con filtrado jerárquico, reseteo de contraseñas
- **Unidades**: Árbol organizacional con CTEs recursivos
- **Roles y Permisos**: Sistema RBAC completo (26 permisos predefinidos)
- **Menú Dinámico**: ⭐ Sidebar que muestra solo aplicaciones autorizadas
- **Notificaciones**: Sistema de alertas para usuarios
- **Logs de Auditoría**: Historial completo con estadísticas

---

## 🚀 Tecnologías Utilizadas

### Backend
- **Runtime:** Node.js v22.19.0
- **Framework:** Express v4.18.2
- **Base de datos:** MariaDB 11.8.3
- **Autenticación:** JWT + bcrypt
- **Seguridad:** Helmet, express-rate-limit, CORS
- **ORM:** Pool de conexiones nativo con queries preparadas

### Frontend ✅ **REFACTORIZADO**
- **Framework:** React 19.2.0
- **CSS:** TailwindCSS 3.4.1 (con identidad corporativa)
- **Routing:** React Router DOM 7.9.4
- **State:** Context API (AuthContext)
- **HTTP Client:** Axios 1.12.2 con interceptores
- **Icons:** react-icons 5.5.0
- **Alerts:** sweetalert2 (confirmaciones elegantes)
- **Notifications:** react-hot-toast (notificaciones modernas)
- **Charts:** recharts 3.3.0

### Infraestructura
- **MCP MariaDB Server** (puerto 4000) - Integración con GitHub Copilot
- **MCP GitHub Server** (puerto 4001) - Gestión del repositorio
- **Systemd Services** - Inicio automático de servidores MCP

---

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/PrincipeFelipe/SIGA.git
cd SIGA
```

### 2. Instalar dependencias del Backend
```bash
cd backend
npm install
```

### 3. Configurar Base de Datos

**Crear base de datos:**
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

**Configurar variables de entorno:**
```bash
# Crear archivo .env en /backend
cp .env.example .env
```

**Contenido del .env:**
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASS=klandemo
DB_NAME=siga_db

# JWT
JWT_SECRET=tu_secreto_super_seguro_de_64_caracteres_aqui

# Servidor
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Instalar dependencias del Frontend
```bash
cd frontend
npm install
```

**Configurar variables de entorno:**
```bash
# Crear archivo .env en /frontend
cp .env.example .env
```

**Contenido del .env:**
```env
REACT_APP_API_URL=http://localhost:5000
```

### 5. Instalar Servidores MCP (Opcional)

**MCP MariaDB:**
```bash
cd backend/mcp-server
npm install
npm run start-safe
```

**MCP GitHub:**
```bash
cd backend/mcp-github
npm install
# Configurar GITHUB_TOKEN en .env
npm run start-safe
```

---

## 🏃 Ejecución

### Iniciar Backend
```bash
cd /home/siga/Proyectos/SIGA/backend
npm start
```

El servidor estará disponible en: **http://localhost:5000**

### Iniciar Frontend
```bash
npm start --prefix /home/siga/Proyectos/SIGA/frontend

# O desde el directorio frontend:
cd frontend
npm start
```

La aplicación estará disponible en: **http://localhost:3000**

### Verificar Funcionamiento
```bash
# Health check
curl http://localhost:5000/health

# Login de prueba
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Password123!"}'
```

---

## 🌟 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario autenticado
- `POST /api/auth/change-password` - Cambiar contraseña

### Usuarios
- `GET /api/usuarios` - Listar usuarios (filtrado jerárquico)
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Desactivar usuario
- `POST /api/usuarios/:id/reset-password` - Resetear contraseña

### Unidades Organizacionales
- `GET /api/unidades` - Árbol jerárquico completo
- `GET /api/unidades/lista` - Lista plana (para selectores)
- `GET /api/unidades/:id` - Obtener unidad por ID
- `GET /api/unidades/:id/descendientes` - Obtener descendientes (CTE recursivo)
- `POST /api/unidades` - Crear unidad
- `PUT /api/unidades/:id` - Actualizar unidad
- `DELETE /api/unidades/:id` - Eliminar unidad

### Roles
- `GET /api/roles` - Listar roles
- `GET /api/roles/:id` - Obtener rol por ID
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol
- `GET /api/roles/:id/permisos` - Obtener permisos de un rol
- `POST /api/roles/:id/permisos` - Asignar permisos a un rol

### Permisos
- `GET /api/permisos` - Listar permisos
- `GET /api/permisos/por-recurso` - Permisos agrupados por recurso
- `GET /api/permisos/:id` - Obtener permiso por ID
- `POST /api/permisos` - Crear permiso
- `PUT /api/permisos/:id` - Actualizar permiso
- `DELETE /api/permisos/:id` - Eliminar permiso

### Asignaciones de Roles
- `GET /api/usuarios/:usuarioId/roles-alcance` - Listar asignaciones
- `POST /api/usuarios/:usuarioId/roles-alcance` - Asignar rol con alcance
- `DELETE /api/usuarios/:usuarioId/roles-alcance/:asignacionId` - Revocar asignación
- `PUT /api/usuarios/:usuarioId/roles-alcance` - Actualizar todas las asignaciones

### Notificaciones
- `GET /api/notificaciones` - Listar notificaciones
- `GET /api/notificaciones/no-leidas` - Contar no leídas
- `POST /api/notificaciones/:id/leer` - Marcar como leída
- `POST /api/notificaciones/leer-todas` - Marcar todas como leídas
- `DELETE /api/notificaciones/:id` - Eliminar notificación

### Logs de Auditoría
- `GET /api/logs` - Listar logs (solo admin)
- `GET /api/logs/estadisticas` - Estadísticas de logs
- `GET /api/logs/:id` - Obtener log por ID
- `GET /api/logs/recurso/:tipo/:id` - Historial de un recurso

### Menú Dinámico
- `GET /api/menu` - Obtener menú según permisos del usuario

---

## 👥 Usuarios de Prueba

Todos los usuarios tienen la contraseña: **`Password123!`**

| Usuario | Rol | Alcance | Descripción |
|---------|-----|---------|-------------|
| `admin` | Admin Total | Zona Centro | Acceso completo al sistema |
| `jefe.cmd.madrid` | Gestor | Comandancia Madrid | Gestiona Madrid + descendientes |
| `jefe.cmd.toledo` | Gestor | Comandancia Toledo | Gestiona Toledo + descendientes |
| `oficial.cmp.retiro` | Usuario Básico | Compañía Retiro | Acceso limitado a Compañía Retiro |
| `agente.sol` | Usuario Básico | Puesto Sol | Acceso limitado a Puesto Sol |

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales
1. **Unidades** - Árbol jerárquico organizacional (self-referencing)
2. **Usuarios** - Usuarios del sistema con unidad de destino
3. **Roles** - Roles del sistema (Admin, Gestor, Usuario Básico)
4. **Permisos** - Permisos atómicos (26 predefinidos)
5. **Roles_Permisos** - Relación muchos a muchos
6. **Usuario_Roles_Alcance** - ⭐ Asignación de rol + alcance jerárquico
7. **Aplicaciones** - Módulos del sidebar con permisos
8. **Notificaciones** - Alertas para usuarios
9. **Logs** - Registro de auditoría

### Función SQL Clave
```sql
es_unidad_descendiente(unidad_objetivo, unidad_alcance) RETURNS BOOLEAN
```
- Usa CTE recursivo para verificar si una unidad es descendiente de otra
- Utilizada por el middleware de autorización

---

## 🔌 Servidores MCP

### MCP MariaDB (puerto 4000)
Permite a GitHub Copilot interactuar con la base de datos.

**Características:**
- ✅ Consultas SQL seguras con parámetros
- ✅ Listado de tablas y estructuras
- ✅ Health checks y monitoreo
- ✅ Pool de conexiones optimizado

**Ubicación:** `/backend/mcp-server`  
**Documentación:** [Ver README](backend/mcp-server/README.md)

### MCP GitHub (puerto 4001)
Permite a GitHub Copilot gestionar el repositorio.

**Características:**
- ✅ Consultar info del repositorio
- ✅ Gestionar issues y pull requests
- ✅ Crear/editar archivos
- ✅ Automatizar tareas de desarrollo

**Ubicación:** `/backend/mcp-github`  
**Documentación:** [Ver README](backend/mcp-github/README.md)

---

## 📋 Estado del Proyecto

### ✅ Backend Completado (100%)
- [x] Base de datos con 9 tablas
- [x] Seed data con 30 unidades y 8 usuarios
- [x] Sistema de autenticación JWT
- [x] Sistema de autorización jerárquico (CTEs recursivos)
- [x] CRUD completo de Usuarios, Unidades, Roles, Permisos
- [x] Gestión de Usuario_Roles_Alcance
- [x] Sistema de Notificaciones
- [x] Sistema de Logs con estadísticas
- [x] Menú dinámico por permisos
- [x] Middleware de auditoría automática
- [x] Seguridad (Helmet, CORS, Rate Limiting)
- [x] Servidores MCP para GitHub Copilot

### ✅ Frontend Completado (Refactorización 24/Oct/2025)
- [x] **Módulo de Usuarios**: CRUD completo con modales, filtros avanzados, paginación
- [x] **Módulo de Unidades**: Árbol jerárquico interactivo con modales
- [x] **Módulo de Roles**: ⭐ NUEVO - Gestión completa de roles y permisos
- [x] **Menú Dinámico**: ⭐ NUEVO (3/Nov/2025) - Sidebar muestra solo apps con permisos
- [x] **Layout Corporativo**: Sidebar + Header con logo de comandancia
- [x] **SweetAlert2**: Confirmaciones elegantes para acciones destructivas
- [x] **React Hot Toast**: Notificaciones modernas con colores corporativos
- [x] **Patrón Modal**: Todos los formularios como modales emergentes
- [x] **Servicios API**: 4 servicios (usuarios, unidades, roles, menu)
- [x] **Build Optimizado**: 131.26 kB gzipped

### 🔄 En Desarrollo
- [ ] Módulo de Logs (LogsViewerPage con filtros)
- [ ] Módulo de Configuración
- [ ] Panel de notificaciones en Header
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] Tests unitarios y de integración

### 📅 Próximamente
- [ ] Dashboard con estadísticas y gráficos
- [ ] Sistema de notificaciones en tiempo real (WebSockets)
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Autenticación de dos factores (2FA)
- [ ] Internacionalización (i18n)

---

## 📚 Documentación Adicional

- [Implementación Completada](backend/IMPLEMENTACION-COMPLETADA.md) - Resumen detallado del backend
- [Refactorización Frontend](REFACTORIZACION-FRONTEND-2025-10-24.md) - ⭐ Cambios arquitectónicos 24/Oct/2025
- [Checklist de Pruebas](CHECKLIST-PRUEBAS-FRONTEND.md) - Guía completa de testing
- [MCP MariaDB](backend/mcp-server/README.md) - Servidor MCP para base de datos
- [MCP GitHub](backend/mcp-github/README.md) - Servidor MCP para GitHub
- [Configuración Exitosa MCP](backend/mcp-server/CONFIGURACION-EXITOSA.md) - Guía de configuración
- [Instrucciones Copilot](.github/copilot-instructions.md) - Instrucciones para GitHub Copilot
- [Credenciales de Prueba](CREDENCIALES-PRUEBA.md) - Usuarios de prueba del sistema

---

## 🤝 Contribución

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

---

## 📝 Historial de Actualizaciones

| Fecha | Cambio |
|-------|--------|
| 2025-10-15 | Creación del proyecto y documentación inicial |
| 2025-10-15 | Implementación del servidor MCP MariaDB |
| 2025-10-22 | Implementación del servidor MCP GitHub |
| 2025-10-22 | ✅ **Backend completado al 100%**: Todos los CRUDs, autorización jerárquica, notificaciones, logs |
| 2025-10-23 | ✅ **Frontend base implementado**: Login, Dashboard, UsersListPage, Header, 7 servicios API, Table component |
| 2025-10-24 | ✅ **Backend 100% verificado (22/22 pruebas)**: Correcciones en 3 controladores, 4 permisos nuevos agregados |
| 2025-10-24 | ✅ **Frontend CRUD usuarios completado**: UserFormPage con validaciones, sistema de toasts (4 variantes), integración completa |
| 2025-10-24 | ✅ **Mejoras de Layout**: Header sticky, Sidebar fixed 100% altura, logo de comandancia, scroll independiente |
| 2025-10-24 | 🎉 **REFACTORIZACIÓN COMPLETA**: 3 módulos con patrón modal (Usuarios, Unidades, Roles), SweetAlert2, react-hot-toast, build 131KB |

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 📧 Contacto

**Proyecto:** Sistema de Gestión Administrativa Empresarial (SIGA)  
**Repositorio:** https://github.com/PrincipeFelipe/SIGA  
**Desarrollado con:** GitHub Copilot + Node.js + Express + MariaDB

---

**Estado actual:** ✅ **Backend 100% funcional** | ✅ **Frontend 3 módulos completados** | 🔄 **Listo para testing**

## 📦 Instalación y ejecución

### Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

### Instalar dependencias
**Frontend:**
cd /ruta/absoluta/frontend
npm install

**Backend:**
cd /ruta/absoluta/backend
npm install

**Servidor MCP:**
cd /home/siga/Proyectos/SIGA/backend/mcp-server
npm install

**Servidor MCP GitHub:**
cd /home/siga/Proyectos/SIGA/backend/mcp-github
npm install

### Configuración de la base de datos
Asegúrate de tener MariaDB instalado y configurado con los siguientes datos:
- Usuario: root
- Contraseña: klandemo

Crea un archivo `.env` en el backend con:
DB_HOST=localhost
DB_USER=root
DB_PASS=klandemo
DB_NAME=nombre_de_tu_base

### Ejecución de servidores de desarrollo
**Frontend:**
npm start --prefix /ruta/absoluta/frontend

**Backend:**
npm start --prefix /ruta/absoluta/backend
> Antes de iniciar cada servidor, comprobar si el proceso está ocupado. Si está activo, cerrarlo y relanzar.

**Servidor MCP (para GitHub Copilot):**
cd /home/siga/Proyectos/SIGA/backend/mcp-server
npm run start-safe
> Este servidor permite a GitHub Copilot interactuar con la base de datos

**Servidor MCP GitHub (para GitHub Copilot):**
cd /home/siga/Proyectos/SIGA/backend/mcp-github
npm run start-safe
> Este servidor permite a GitHub Copilot gestionar el repositorio GitHub
> Requiere configurar GITHUB_TOKEN en el archivo .env

## 🌟 Funcionalidades iniciales
- Autenticación de usuarios
- Dashboard administrativo
- Gestión de clientes
- Gestión de productos
- Registro y consulta de facturas

## 🛣️ Rutas API
- `/api/users` – Gestión de usuarios
- `/api/clients` – Gestión de clientes
- `/api/products` – Productos
- `/api/invoices` – Facturación

## 🔌 Servidor MCP

El proyecto incluye un servidor MCP (Model Context Protocol) que permite a GitHub Copilot y otras herramientas interactuar directamente con la base de datos MariaDB.

**Características:**
- ✅ Consultas SQL seguras con parámetros preparados
- ✅ Listado de tablas y estructuras
- ✅ Health checks y monitoreo
- ✅ Pool de conexiones optimizado
- ✅ Verificación automática de puertos

**Ubicación:** `/backend/mcp-server`  
**Puerto:** 4000  
**Documentación completa:** [Ver README del MCP](backend/mcp-server/README.md)

**Inicio rápido:**
```bash
cd /home/siga/Proyectos/SIGA/backend/mcp-server
npm install
npm run start-safe
```

## 📦 Servidor MCP GitHub

Servidor adicional que permite gestionar el repositorio GitHub directamente desde GitHub Copilot.

**Características:**
- ✅ Consultar información del repositorio
- ✅ Listar ramas, commits, issues y pull requests
- ✅ Crear issues y ramas automáticamente
- ✅ Gestionar archivos (crear, leer, actualizar, eliminar)
- ✅ Automatizar tareas de desarrollo

**Ubicación:** `/backend/mcp-github`  
**Puerto:** 4001  
**Documentación completa:** [Ver README del MCP GitHub](backend/mcp-github/README.md)

**Configuración:**
1. Generar un token personal en GitHub (Settings > Developer settings > Personal access tokens)
2. Configurar el token en `/backend/mcp-github/.env`
3. Iniciar el servidor

**Inicio rápido:**
```bash
cd /home/siga/Proyectos/SIGA/backend/mcp-github
npm install
# Configurar GITHUB_TOKEN en .env
npm run start-safe
```

## 🎨 Frontend - Identidad Corporativa

El frontend implementa la identidad visual de la Guardia Civil:

**Colores:**
- **Primary (Verde Guardia Civil):** #004E2E - Pantone 341C
- **Accent (Rojo):** #C8102E - Pantone 485C
- **Background:** #F7F9FA
- **Text:** #1A1A1A
- **Alert:** #FFC700 - Pantone 116C

**Tipografías:**
- **Headings:** Montserrat (Google Fonts)
- **Body:** Inter (Google Fonts)

**Componentes Implementados:**
- ✅ Button (6 variantes: primary, secondary, accent, outline, danger, success)
- ✅ Input (con validación y errores)
- ✅ Card (contenedor de contenido)
- ✅ Modal (diálogos)
- ✅ Badge (etiquetas de estado)
- ✅ Loading (indicadores de carga)
- ✅ Layout (Sidebar + Header)
- ✅ ProtectedRoute (rutas protegidas)

**Páginas Implementadas:**
- ✅ Login (autenticación)
- ✅ Dashboard (panel principal)
- ✅ Change Password (cambio de contraseña)

**Documentación completa:** [Ver README del Frontend](frontend/README.md)

---

## ️ Historial de actualizaciones

| Fecha      | Cambio                                    |
|------------|-------------------------------------------|
| 2025-10-15 | Creación del proyecto y documentación inicial |
| 2025-10-15 | Implementación del servidor MCP para GitHub Copilot |
| 2025-10-15 | Estructura completa backend/mcp-server con pruebas |
| 2025-10-22 | Implementación del servidor MCP GitHub para gestión del repositorio |
| 2025-10-22 | Backend 100% completo - 40+ endpoints implementados |
| 2025-10-23 | Frontend React completo - Login, Dashboard, componentes base |
| 2025-10-23 | Identidad corporativa Guardia Civil aplicada en frontend |

---
