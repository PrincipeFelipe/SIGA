# Servidor MCP GitHub - Sistema SIGA

Servidor MCP (Model Context Protocol) que permite a GitHub Copilot y otras herramientas interactuar directamente con el repositorio GitHub del Sistema SIGA.

## 🎯 Propósito

Este servidor actúa como un puente entre herramientas de desarrollo y la API de GitHub, permitiendo:
- Consultar información del repositorio
- Listar ramas, commits, issues y pull requests
- Crear issues y ramas
- Gestionar archivos (crear, leer, actualizar, eliminar)
- Automatizar tareas de desarrollo

## 📋 Requisitos previos

- Node.js >= 14.0.0
- Token de acceso personal de GitHub con permisos:
  - `repo` (acceso completo a repositorios)
  - `workflow` (gestión de workflows)

## 🔑 Configurar Token de GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Click en "Generate new token (classic)"
3. Selecciona los permisos:
   - ✅ repo (Full control of private repositories)
   - ✅ workflow (Update GitHub Action workflows)
4. Copia el token generado
5. Pégalo en el archivo `.env` como `GITHUB_TOKEN`

## 🚀 Instalación

1. Navegar a la carpeta del servidor MCP GitHub:
```bash
cd /home/siga/Proyectos/SIGA/backend/mcp-github
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Edita el archivo `.env` con tus credenciales:
```env
GITHUB_MCP_PORT=4001
GITHUB_TOKEN=tu_token_personal_de_github_aqui
GITHUB_OWNER=PrincipeFelipe
GITHUB_REPO=SIGA
NODE_ENV=development
```

## 🎮 Uso

### Iniciar el servidor (modo normal)
```bash
npm start
```

### Iniciar con verificaciones de seguridad (recomendado)
```bash
npm run start-safe
```

### Modo desarrollo (auto-reinicio)
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

Verifica el estado del servidor y la conexión con GitHub.

**Respuesta:**
```json
{
  "status": "healthy",
  "github": "connected",
  "user": "PrincipeFelipe",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

### 2. Información del repositorio
**GET** `/repo`

Obtiene información completa del repositorio.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "name": "SIGA",
    "full_name": "PrincipeFelipe/SIGA",
    "description": "Sistema de Gestión Administrativa Empresarial",
    "default_branch": "main",
    "open_issues": 5,
    "stars": 10,
    "url": "https://github.com/PrincipeFelipe/SIGA"
  }
}
```

### 3. Listar ramas
**GET** `/branches`

Lista todas las ramas del repositorio.

### 4. Listar commits
**GET** `/commits?limit=10&branch=main`

Lista los commits recientes.

**Parámetros:**
- `limit` (opcional): Número de commits (default: 10)
- `branch` (opcional): Rama a consultar (default: main)

### 5. Listar issues
**GET** `/issues?state=open&limit=20`

Lista los issues del repositorio.

**Parámetros:**
- `state` (opcional): Estado (open, closed, all) (default: open)
- `limit` (opcional): Número de issues (default: 20)

### 6. Listar Pull Requests
**GET** `/pulls?state=open&limit=20`

Lista los pull requests.

### 7. Crear Issue
**POST** `/issue`

Crea un nuevo issue.

**Body:**
```json
{
  "title": "Implementar autenticación JWT",
  "body": "Necesitamos implementar autenticación con JWT para el backend",
  "labels": ["enhancement", "backend"]
}
```

### 8. Crear Rama
**POST** `/branch`

Crea una nueva rama.

**Body:**
```json
{
  "branch": "feature/nueva-funcionalidad",
  "from": "main"
}
```

### 9. Obtener contenido de archivo
**GET** `/file/:path?branch=main`

Lee el contenido de un archivo.

**Ejemplo:** `GET /file/README.md`

### 10. Crear archivo
**POST** `/file`

Crea un nuevo archivo en el repositorio.

**Body:**
```json
{
  "path": "docs/nuevo-archivo.md",
  "content": "# Contenido del archivo",
  "message": "Agregar nueva documentación",
  "branch": "main"
}
```

### 11. Actualizar archivo
**PUT** `/file`

Actualiza un archivo existente.

**Body:**
```json
{
  "path": "README.md",
  "content": "# Contenido actualizado",
  "message": "Actualizar README",
  "sha": "abc123...",
  "branch": "main"
}
```

### 12. Eliminar archivo
**DELETE** `/file/:path`

Elimina un archivo del repositorio.

**Body:**
```json
{
  "message": "Eliminar archivo obsoleto",
  "sha": "abc123...",
  "branch": "main"
}
```

## 🧪 Ejemplos de uso

### Con cURL

```bash
# Ver información del repositorio
curl http://localhost:4001/repo

# Listar commits recientes
curl http://localhost:4001/commits?limit=5

# Crear un issue
curl -X POST http://localhost:4001/issue \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug en el login",
    "body": "El formulario de login no valida correctamente",
    "labels": ["bug"]
  }'

# Leer archivo
curl http://localhost:4001/file/README.md
```

### Con JavaScript (fetch)

```javascript
// Obtener información del repositorio
const response = await fetch('http://localhost:4001/repo');
const repo = await response.json();
console.log(repo.data);

// Crear una rama
const newBranch = await fetch('http://localhost:4001/branch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    branch: 'feature/nuevo-modulo',
    from: 'main'
  })
});
```

### Con Python

```python
import requests

# Listar issues abiertos
response = requests.get('http://localhost:4001/issues?state=open')
issues = response.json()

for issue in issues['data']:
    print(f"#{issue['number']}: {issue['title']}")
```

## 🔒 Seguridad

- ✅ Token de GitHub almacenado en variables de entorno
- ✅ CORS configurado para desarrollo
- ✅ Validación de parámetros requeridos
- ✅ Manejo de errores apropiado
- ⚠️ **IMPORTANTE:** Nunca subas el archivo `.env` al repositorio

## 🔗 Integración con GitHub Copilot

El servidor MCP GitHub permite a GitHub Copilot:
- 📊 Consultar el estado del repositorio
- 🔍 Ver commits, issues y pull requests
- 📝 Sugerir acciones basadas en el estado actual
- 🤖 Automatizar tareas de desarrollo

## 🛠️ Solución de problemas

### Error de autenticación
```
Error: Bad credentials
```
**Solución:** Verifica que el token de GitHub en `.env` sea válido y tenga los permisos necesarios.

### Puerto ocupado
```bash
kill -9 $(lsof -ti:4001)
npm run start-safe
```

### No se pueden crear archivos
**Solución:** Asegúrate de que el token tenga permisos `repo` completos.

## 📚 Recursos adicionales

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Octokit.js](https://github.com/octokit/octokit.js)
- [Personal Access Tokens](https://github.com/settings/tokens)

---

**Versión:** 1.0.0  
**Puerto:** 4001  
**Última actualización:** 22 de octubre de 2025
