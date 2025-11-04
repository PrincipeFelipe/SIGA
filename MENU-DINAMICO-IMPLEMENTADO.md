# 📋 Sistema de Menú Dinámico Basado en Permisos

## ✅ Implementación Completada (3 de noviembre de 2025)

### 🎯 Objetivo
Mostrar en el sidebar del dashboard **únicamente las aplicaciones a las que el usuario tiene acceso** según sus permisos asignados a través de roles.

---

## 🏗️ Arquitectura

### Backend

#### 1. **Tabla de Base de Datos: `Aplicaciones`**
```sql
CREATE TABLE Aplicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ruta VARCHAR(255) NOT NULL,
    icono VARCHAR(50),
    permiso_requerido_id INT NULL,
    parent_id INT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (permiso_requerido_id) REFERENCES Permisos(id),
    FOREIGN KEY (parent_id) REFERENCES Aplicaciones(id)
);
```

**Aplicaciones Registradas:**
- **Dashboard** (`/`) - Sin permiso requerido (acceso público)
- **Usuarios** (`/usuarios`) - Requiere `users:view`
- **Unidades** (`/unidades`) - Requiere `units:view`
- **Roles** (`/roles`) - Requiere `roles:view`
- **Logs** (`/logs`) - Requiere `logs:view`

#### 2. **Controlador: `menu.controller.js`**
```javascript
async function obtenerMenu(req, res) {
    // Consulta SQL que:
    // 1. Filtra aplicaciones activas
    // 2. Incluye apps sin permiso (públicas)
    // 3. Verifica si el usuario tiene el permiso requerido
    // 4. Organiza en estructura de árbol (parent/children)
}
```

**Lógica de Verificación:**
1. Si `permiso_requerido_id IS NULL` → Aplicación pública (visible para todos)
2. Si tiene permiso requerido → Busca en `Usuario_Roles_Alcance` + `Roles_Permisos`
3. Verifica que el rol esté activo y no haya expirado
4. Devuelve solo las aplicaciones autorizadas

#### 3. **Ruta: `/api/menu`**
```javascript
router.get('/', 
    authenticate,  // Requiere autenticación JWT
    menuController.obtenerMenu
);
```

---

### Frontend

#### 1. **Servicio: `menuService.js`**
```javascript
const menuService = {
    async obtenerMenu() {
        const response = await api.get('/menu');
        return {
            success: true,
            menu: response.data.menu || [],
            total: response.data.total || 0
        };
    }
};
```

#### 2. **Context: `AuthContext.js`**
Se añadió el estado `menu` y se carga automáticamente:
- **Al iniciar sesión** (`login`)
- **Al verificar autenticación** (`checkAuth`)
- **Se limpia al cerrar sesión** (`logout`)

```javascript
const [menu, setMenu] = useState([]);

const login = async (username, password) => {
    // ... autenticación ...
    const menuResult = await menuService.obtenerMenu();
    if (menuResult.success) {
        setMenu(menuResult.menu);
    }
};
```

#### 3. **Componente: `Sidebar.js`**
Renderiza dinámicamente el menú usando el contexto:

```javascript
const { menu } = useAuth();

// Mapeo de iconos
const iconMap = {
    'icon-home': FiHome,
    'icon-users': FiUsers,
    'icon-sitemap': FiLayers,
    'icon-shield': FiShield,
    'icon-history': FiFileText,
    'icon-chart-bar': FiBarChart2,
    'icon-grid': FiGrid
};

// Renderizado
{menu.map(item => (
    <Link to={item.ruta}>
        <IconComponent size={20} />
        <span>{item.nombre}</span>
    </Link>
))}
```

---

## 🔐 Flujo de Autorización

```
Usuario inicia sesión
    ↓
AuthContext.login() exitoso
    ↓
Llama a menuService.obtenerMenu()
    ↓
GET /api/menu (con JWT cookie)
    ↓
Backend consulta:
    - Aplicaciones activas
    - Permisos del usuario (via roles)
    ↓
Devuelve solo aplicaciones autorizadas
    ↓
Context actualiza estado menu[]
    ↓
Sidebar renderiza items del menú
```

---

## 🧪 Pruebas

### Script de Prueba: `backend/test-menu.sh`

```bash
cd /home/siga/Proyectos/SIGA/backend
./test-menu.sh
```

**Resultado esperado para admin:**
```json
{
  "success": true,
  "menu": [
    { "nombre": "Dashboard", "ruta": "/" },
    { "nombre": "Usuarios", "ruta": "/usuarios" },
    { "nombre": "Unidades", "ruta": "/unidades" },
    { "nombre": "Roles", "ruta": "/roles" },
    { "nombre": "Logs", "ruta": "/logs" }
  ],
  "total": 5
}
```

**Usuarios de prueba:**
- `admin` / `Admin123!` → Acceso completo (5 aplicaciones)
- `jefe.zona.norte` → Acceso limitado según roles asignados
- `R84101K` → Acceso limitado según roles asignados

---

## 📂 Archivos Modificados/Creados

### Backend
- ✅ `/backend/controllers/menu.controller.js` - Ya existía, sin cambios
- ✅ `/backend/routes/menu.routes.js` - **ACTUALIZADO** con middleware `authenticate`
- ✅ `/database/update-aplicaciones.sql` - **CREADO** para actualizar aplicaciones
- ✅ `/backend/test-menu.sh` - **CREADO** para pruebas

### Frontend
- ✅ `/frontend/src/services/menuService.js` - **CREADO**
- ✅ `/frontend/src/services/index.js` - **ACTUALIZADO** exporta menuService
- ✅ `/frontend/src/contexts/AuthContext.js` - **ACTUALIZADO** gestiona estado de menú
- ✅ `/frontend/src/components/layout/Sidebar.js` - **ACTUALIZADO** renderiza menú dinámico

---

## 🔧 Configuración de Base de Datos

```bash
# Actualizar aplicaciones en BD
mysql -u root -pklandemo siga_db < /home/siga/Proyectos/SIGA/database/update-aplicaciones.sql
```

---

## 📊 Estado del Sistema

| Componente | Estado | Puerto | Notas |
|------------|--------|--------|-------|
| Backend | ✅ Operativo | 5000 | Endpoint `/api/menu` protegido |
| Frontend | ✅ Operativo | 3000 | Menú dinámico funcionando |
| Base de Datos | ✅ Actualizada | 3306 | 5 aplicaciones registradas |

---

## 🎨 Comportamiento Visual

### Usuario con Todos los Permisos (Admin)
```
┌─────────────────────────────┐
│  🏠 Dashboard               │
│  👥 Usuarios                │
│  🏢 Unidades                │
│  🛡️  Roles                  │
│  📋 Logs                    │
└─────────────────────────────┘
```

### Usuario con Permisos Limitados
```
┌─────────────────────────────┐
│  🏠 Dashboard               │
│  👥 Usuarios                │
└─────────────────────────────┘
```
(Solo ve las aplicaciones para las que tiene el permiso requerido)

---

## ✨ Características Implementadas

✅ **Filtrado automático por permisos** - Cada usuario ve solo lo que puede usar  
✅ **Dashboard siempre visible** - No requiere permisos (acceso base)  
✅ **Carga automática al login** - Menú se actualiza al autenticarse  
✅ **Iconos dinámicos** - Mapeo de nombres a componentes React Icons  
✅ **Estructura jerárquica** - Soporte para menús con sub-ítems (parent_id)  
✅ **Ordenamiento** - Campo `orden` define la secuencia de visualización  
✅ **Fallback elegante** - Si no hay menú, muestra solo Dashboard  

---

## 🚀 Próximos Pasos Opcionales

- [ ] Añadir más aplicaciones (Reportes, Notificaciones, Configuración)
- [ ] Implementar sub-menús desplegables (usando `parent_id`)
- [ ] Añadir badges de notificaciones en items del menú
- [ ] Cache del menú en localStorage para mejorar performance
- [ ] Animaciones al expandir/contraer sub-menús
- [ ] Modo de búsqueda rápida en el sidebar

---

## 📝 Notas Técnicas

### Seguridad
- El endpoint `/api/menu` requiere autenticación JWT
- La verificación de permisos se hace en el backend (no confiar en frontend)
- Los usuarios solo reciben información de apps a las que tienen acceso
- No se exponen permisos o roles en la respuesta del menú

### Performance
- Consulta SQL optimizada con EXISTS (más eficiente que JOIN)
- Árbol de menú se organiza en memoria (no múltiples queries)
- Menú se carga una vez por sesión (no en cada navegación)

### Escalabilidad
- Soporte para menús multinivel (parent_id)
- Campo `orden` permite reordenar sin cambiar código
- Campo `activo` permite deshabilitar apps sin eliminarlas
- Fácil añadir nuevas aplicaciones insertando en BD

---

**Implementación completada exitosamente ✅**  
*Sistema probado y operativo en http://localhost:3000*
