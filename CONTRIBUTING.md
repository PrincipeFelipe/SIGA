# 🤝 Guía de Contribución - SIGA

Gracias por tu interés en contribuir al Sistema de Gestión Administrativa (SIGA). Esta guía te ayudará a comenzar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Commits y Pull Requests](#commits-y-pull-requests)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

---

## 🚀 ¿Cómo Contribuir?

### Reportar Bugs

1. Verifica que el bug no haya sido reportado previamente en [Issues](https://github.com/PrincipeFelipe/SIGA/issues)
2. Abre un nuevo issue usando la plantilla de bug report
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Versión del navegador/Node.js

### Sugerir Mejoras

1. Abre un issue con la etiqueta `enhancement`
2. Describe claramente la funcionalidad propuesta
3. Explica por qué sería útil para el proyecto

### Contribuir Código

1. Haz fork del repositorio
2. Crea una rama desde `main`
3. Implementa tus cambios
4. Asegúrate de que todo funcione correctamente
5. Envía un Pull Request

---

## 🛠️ Configuración del Entorno

### Prerrequisitos

- **Node.js:** v18.0.0 o superior (recomendado v22.19.0)
- **MariaDB:** v11.8.3 o superior
- **npm:** v9.0.0 o superior
- **Git:** v2.30.0 o superior

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/PrincipeFelipe/SIGA.git
cd SIGA

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones locales

# 3. Instalar dependencias del backend
cd backend
npm install

# 4. Instalar dependencias del frontend
cd ../frontend
npm install

# 5. Configurar base de datos
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed.sql

# 6. Iniciar servidores (en terminales separados)
cd ../backend && npm start
cd ../frontend && npm start
```

### Verificar Instalación

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Credenciales de prueba: `admin` / `Admin123!`

---

## 🔄 Flujo de Trabajo

### Crear una Rama

```bash
# Actualizar main
git checkout main
git pull origin main

# Crear rama descriptiva
git checkout -b feature/nombre-funcionalidad
# o
git checkout -b fix/descripcion-bug
```

### Nomenclatura de Ramas

- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `refactor/` - Refactorización de código
- `docs/` - Cambios en documentación
- `test/` - Añadir o modificar tests

### Antes de Commitear

```bash
# Verificar que no hay errores
npm run lint  # (si está configurado)

# Probar localmente
npm test      # (si hay tests)

# Ver cambios
git status
git diff
```

---

## 💻 Estándares de Código

### Backend (Node.js + Express)

- **Estilo:** ES6+ con async/await
- **Estructura:** Separación en controllers, routes, middleware
- **Naming:**
  - Archivos: `kebab-case.js`
  - Funciones: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE`
- **Comentarios:** Documentar funciones complejas
- **Manejo de errores:** Siempre usar try-catch

```javascript
// ✅ Bueno
async function obtenerUsuarios(req, res) {
    try {
        const usuarios = await Usuario.findAll();
        res.json({ success: true, data: usuarios });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
}

// ❌ Malo
function getUsers(req,res){
Usuario.findAll().then(u=>res.json(u)).catch(e=>console.log(e))
}
```

### Frontend (React + TailwindCSS)

- **Componentes:** Funcionales con hooks
- **Naming:**
  - Componentes: `PascalCase.js`
  - Funciones: `camelCase`
  - Hooks personalizados: `use + PascalCase`
- **Estructura:** Un componente por archivo
- **Estilos:** TailwindCSS (evitar CSS inline)
- **Estado:** Context API para estado global

```javascript
// ✅ Bueno
const UserCard = ({ user }) => {
    const [loading, setLoading] = useState(false);
    
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold">{user.nombre}</h3>
        </div>
    );
};

// ❌ Malo
function userCard({user}){
return <div style={{background:'white'}}>{user.nombre}</div>
}
```

### SQL

- **Naming:**
  - Tablas: `PascalCase` (singular)
  - Columnas: `snake_case`
  - Índices: `idx_tabla_columna`
- **Formato:** Indentación consistente

---

## 📝 Commits y Pull Requests

### Formato de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(alcance): descripción breve

[cuerpo opcional con más detalles]

[footer opcional con issues relacionados]
```

**Tipos:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato, sin cambios funcionales
- `refactor:` Refactorización sin cambiar funcionalidad
- `test:` Añadir o modificar tests
- `chore:` Mantenimiento, dependencias

**Ejemplos:**

```bash
git commit -m "feat(usuarios): agregar filtro por unidad"
git commit -m "fix(auth): corregir validación de JWT"
git commit -m "docs(readme): actualizar instrucciones de instalación"
```

### Pull Requests

**Título:** Claro y descriptivo

```
feat: Implementar módulo de notificaciones
fix: Resolver error de sesión al refrescar página
```

**Descripción:** Incluir

- ¿Qué cambia?
- ¿Por qué?
- ¿Cómo probarlo?
- Screenshots (si aplica)
- Issues relacionados: `Closes #123`

**Checklist antes de enviar:**

- [ ] El código compila sin errores
- [ ] He probado los cambios localmente
- [ ] He actualizado la documentación (si aplica)
- [ ] Los commits siguen el formato establecido
- [ ] He revisado mi propio código

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# E2E (cuando estén configurados)
npm run test:e2e
```

---

## 📚 Recursos

- [Documentación del Proyecto](./README.md)
- [Instrucciones de Copilot](./.github/copilot-instructions.md)
- [Documentación Backend](./backend/IMPLEMENTACION-COMPLETADA.md)
- [GitHub Issues](https://github.com/PrincipeFelipe/SIGA/issues)

---

## 🎯 Áreas que Necesitan Ayuda

- [ ] Tests automatizados (Jest + Supertest)
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] Internacionalización (i18n)
- [ ] Logs Viewer (frontend)
- [ ] Notificaciones en tiempo real
- [ ] Exportación de datos (Excel/PDF)

---

## 💬 ¿Preguntas?

Si tienes dudas, puedes:
- Abrir un [Issue](https://github.com/PrincipeFelipe/SIGA/issues) con la etiqueta `question`
- Comentar en un Pull Request existente
- Contactar a los maintainers

---

**¡Gracias por contribuir a SIGA! 🚀**
