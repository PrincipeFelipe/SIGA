# Servidor MCP MariaDB - Sistema SIGA

Servidor MCP (Model Context Protocol) que permite a GitHub Copilot y otras herramientas interactuar directamente con la base de datos MariaDB del Sistema SIGA.

## 🎯 Propósito

Este servidor actúa como un puente seguro entre herramientas de desarrollo (como GitHub Copilot) y la base de datos MariaDB, permitiendo:
- Ejecutar consultas SQL
- Listar tablas y estructuras
- Realizar operaciones CRUD
- Obtener información del esquema de la base de datos

## 📋 Requisitos previos

- Node.js >= 14.0.0
- MariaDB instalado y ejecutándose
- Base de datos `siga_db` creada (o el nombre que prefieras)

## 🚀 Instalación

1. Navegar a la carpeta del servidor MCP:
```bash
cd /home/siga/Proyectos/SIGA/backend/mcp-server
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Edita el archivo `.env` con tus credenciales:
```env
MCP_PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=klandemo
DB_NAME=siga_db
NODE_ENV=development
```

## 🎮 Uso

### Iniciar el servidor (modo normal)
```bash
npm start
```

### Iniciar con verificaciones de seguridad (recomendado)
Este modo verifica y cierra procesos que ocupen el puerto antes de iniciar:
```bash
npm run start-safe
```

### Modo desarrollo (auto-reinicio con nodemon)
```bash
npm run dev
```

### Ejecutar pruebas
```bash
npm test
```

## 📡 Endpoints disponibles

### 1. Health Check
**GET** `/health`

Verifica el estado del servidor y la conexión a la base de datos.

**Respuesta:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-15T10:30:00.000Z"
}
```

### 2. Información del servidor
**GET** `/`

Obtiene información general del servidor MCP.

### 3. Listar tablas
**GET** `/tables`

Lista todas las tablas de la base de datos.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {"Tables_in_siga_db": "usuarios"},
    {"Tables_in_siga_db": "clientes"},
    {"Tables_in_siga_db": "productos"}
  ]
}
```

### 4. Estructura de tabla
**GET** `/table/:tableName`

Obtiene la estructura de una tabla específica.

**Ejemplo:** `GET /table/usuarios`

### 5. Ejecutar consulta SQL
**POST** `/query`

Ejecuta una consulta SQL personalizada.

**Body:**
```json
{
  "sql": "SELECT * FROM usuarios WHERE id = ?",
  "params": [1]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "rowCount": 1
}
```

## 🧪 Pruebas

El proyecto incluye un cliente de prueba que verifica todos los endpoints:

```bash
npm test
```

Las pruebas incluyen:
- ✅ Health check
- ✅ Información del servidor
- ✅ Listado de tablas
- ✅ Consultas SQL válidas
- ✅ Manejo de errores

## 🔒 Seguridad

- Las consultas usan parámetros preparados para prevenir inyección SQL
- Pool de conexiones limitado (máximo 5 conexiones simultáneas)
- Manejo apropiado de errores sin exponer información sensible
- Variables de entorno para credenciales

## 🛠️ Características técnicas

- **Pool de conexiones:** Reutiliza conexiones para mejor rendimiento
- **CORS habilitado:** Permite solicitudes desde cualquier origen (configurable)
- **Cierre graceful:** Cierra conexiones correctamente al detener el servidor
- **Verificación de puerto:** Detecta y cierra procesos que ocupen el puerto antes de iniciar

## 📝 Logs

El servidor muestra información detallada al iniciar:
```
============================================================
🔌 Servidor MCP MariaDB iniciado correctamente
============================================================
📡 URL: http://localhost:4000
📊 Base de datos: siga_db
🔗 Host: localhost
👤 Usuario: root
============================================================
```

## 🐛 Solución de problemas

### Puerto ocupado
Si el puerto 4000 está ocupado, usa el script seguro:
```bash
npm run start-safe
```

### Error de conexión a base de datos
Verifica:
- MariaDB está ejecutándose: `sudo systemctl status mariadb`
- Las credenciales en `.env` son correctas
- La base de datos existe: `SHOW DATABASES;`

### No se instalan las dependencias
Limpia caché e intenta de nuevo:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔗 Integración con .well-known/mcp.json

El servidor está configurado para funcionar con la especificación MCP definida en:
`/home/siga/Proyectos/SIGA/.well-known/mcp.json`

GitHub Copilot automáticamente detectará y usará este servidor cuando esté ejecutándose.

## 📚 Recursos adicionales

- [Documentación de MariaDB](https://mariadb.com/kb/en/documentation/)
- [Express.js](https://expressjs.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Versión:** 1.0.0  
**Última actualización:** 15 de octubre de 2025
