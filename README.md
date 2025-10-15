# Sistema de Gestión Administrativa Empresarial

Esta aplicación web tiene como objetivo facilitar la gestión administrativa integral de una empresa, combinando una interfaz moderna con operaciones seguras y eficientes.

## 🚀 Tecnologías Utilizadas
- **Frontend:** React, TailwindCSS
- **Backend:** Node.js, Express
- **Base de datos:** MariaDB
    - Usuario: root
    - Contraseña: klandemo

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

## 🗒️ Historial de actualizaciones

| Fecha      | Cambio                                    |
|------------|-------------------------------------------|
| 2025-10-15 | Creación del proyecto y documentación inicial |

---
