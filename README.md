# Sistema de Gestión Administrativa Empresarial

Esta aplicación web tiene como objetivo facilitar la gestión administrativa integral de una empresa, combinando una interfaz moderna con operaciones seguras y eficientes.

## 🚀 Tecnologías Utilizadas
- **Frontend:** React, TailwindCSS
- **Backend:** Node.js, Express
- **Base de datos:** MariaDB
    - Usuario: root
    - Contraseña: klandemo
- **MCP Servers:** Servidores de protocolo de contexto para integración con GitHub Copilot
    - MCP MariaDB (puerto 4000)
    - MCP GitHub (puerto 4001)

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

## ️ Historial de actualizaciones

| Fecha      | Cambio                                    |
|------------|-------------------------------------------|
| 2025-10-15 | Creación del proyecto y documentación inicial |
| 2025-10-15 | Implementación del servidor MCP para GitHub Copilot |
| 2025-10-15 | Estructura completa backend/mcp-server con pruebas |
| 2025-10-22 | Implementación del servidor MCP GitHub para gestión del repositorio |

---
