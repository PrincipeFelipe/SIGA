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