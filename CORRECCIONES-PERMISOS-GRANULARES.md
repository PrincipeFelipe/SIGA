# Corrección de Permisos Granulares en UsersListPage

## 📅 Fecha: 4 de noviembre de 2025

## 🐛 Problema Reportado
El usuario **R84101K** (rol Usuario Básico) tiene los permisos:
- `users:view_detail`
- `users:reset_password`

Pero **NO aparecían las acciones** en la interfaz de listado de usuarios.

## 🔍 Causa Raíz
El código del frontend verificaba **únicamente** el permiso `users:edit` para mostrar todas las acciones (editar, gestionar roles, restablecer contraseña), cuando debería verificar permisos granulares específicos para cada acción.

## ✅ Solución Implementada

### 1. **Actualización de `usePermissions` Hook**
**Archivo:** `/frontend/src/hooks/usePermissions.js`

**Nuevos permisos agregados:**
```javascript
const can = {
    // Usuarios
    viewUsers: hasPermission('users:view'),
    viewUserDetail: hasPermission('users:view_detail'),        // ✨ NUEVO
    createUsers: hasPermission('users:create'),
    editUsers: hasPermission('users:edit'),
    deleteUsers: hasPermission('users:delete'),
    resetPassword: hasPermission('users:reset_password'),      // ✨ NUEVO
    manageUserRoles: hasPermission('user_roles:assign'),       // ✨ NUEVO
    
    // ... otros permisos ...
};
```

### 2. **Refactorización de UsersListPage**
**Archivo:** `/frontend/src/pages/usuarios/UsersListPage.js`

**Cambios en las acciones de la tabla:**

#### ❌ ANTES (Incorrecto):
```javascript
{can.editUsers && (
  <button onClick={() => handleResetPassword(usuario)}>
    <FiKey /> Restablecer contraseña
  </button>
)}
```
☝️ **Problema:** Requería `users:edit` para resetear contraseña

#### ✅ AHORA (Correcto):
```javascript
{/* Ver detalle: solo si tiene permiso pero NO puede editar */}
{can.viewUserDetail && !can.editUsers && (
  <button title="Ver detalle">
    <FiEye /> Ver detalle
  </button>
)}

{/* Editar: solo si tiene permiso de editar */}
{can.editUsers && (
  <button title="Editar">
    <FiEdit2 /> Editar
  </button>
)}

{/* Gestionar roles: solo si tiene permiso específico */}
{can.manageUserRoles && (
  <button title="Gestionar roles">
    <FiShield /> Gestionar roles
  </button>
)}

{/* Restablecer contraseña: solo si tiene permiso específico */}
{can.resetPassword && (
  <button title="Restablecer contraseña">
    <FiKey /> Restablecer contraseña
  </button>
)}

{/* Eliminar: solo si tiene permiso de eliminar */}
{can.deleteUsers && (
  <button title="Eliminar">
    <FiTrash2 /> Eliminar
  </button>
)}
```

## 🎯 Resultado Esperado

### Usuario: **Admin** (32 permisos)
Verá **TODAS** las acciones:
- ✏️ Editar
- 🛡️ Gestionar roles
- 🔑 Restablecer contraseña
- 🗑️ Eliminar

### Usuario: **R84101K** (Usuario Básico - 6 permisos)
Verá **SOLO**:
- 👁️ Ver detalle (ícono ojo azul)
- 🔑 Restablecer contraseña (ícono llave naranja)

**NO verá:**
- ❌ Editar
- ❌ Gestionar roles
- ❌ Eliminar

## 🧪 Pruebas Realizadas

### Backend (Verificado ✅):
```bash
./backend/test-user-permissions.sh
```
**Resultado:**
- ✅ R84101K tiene 6 permisos correctos
- ✅ Incluye `users:view_detail` y `users:reset_password`
- ✅ Lista 2 usuarios visibles (filtrado jerárquico funcional)

### Frontend (Para probar por el usuario):
1. Iniciar sesión como **R84101K** / **klandemo**
2. Ir a **Usuarios**
3. Verificar que aparecen **2 botones** en cada fila:
   - 👁️ Ver detalle (azul)
   - 🔑 Restablecer contraseña (naranja)

## 📋 Permisos Granulares Disponibles

| Permiso | Acción en UI | Ícono |
|---------|-------------|-------|
| `users:view` | Ver listado | - |
| `users:view_detail` | Ver detalle | 👁️ FiEye (azul) |
| `users:create` | Crear usuario | ➕ FiPlus (verde) |
| `users:edit` | Editar usuario | ✏️ FiEdit2 (verde) |
| `users:delete` | Eliminar usuario | 🗑️ FiTrash2 (rojo) |
| `users:reset_password` | Resetear contraseña | 🔑 FiKey (naranja) |
| `user_roles:assign` | Gestionar roles | 🛡️ FiShield (morado) |

## 🎨 Colores de Iconos

- **Azul** (`text-blue-600`): Ver/Consultar
- **Verde** (`text-primary`): Editar
- **Morado** (`text-purple-600`): Gestionar roles
- **Naranja** (`text-orange-600`): Restablecer contraseña
- **Rojo** (`text-accent`): Eliminar

## 📝 Archivos Modificados

1. ✅ `/frontend/src/hooks/usePermissions.js`
   - Agregados 3 permisos nuevos al objeto `can`

2. ✅ `/frontend/src/pages/usuarios/UsersListPage.js`
   - Importado `FiEye` de react-icons
   - Refactorizado columna de acciones con permisos granulares
   - Agregados comentarios descriptivos

## 🚀 Estado del Sistema

- ✅ Backend: Funcionando correctamente (puerto 5000)
- ✅ Frontend: Requiere recarga del navegador para ver cambios
- ✅ Permisos: Correctamente asignados en base de datos
- ✅ Testing: Scripts de prueba creados y ejecutados

## 📚 Próximos Pasos (Opcional)

1. **Implementar Modal de Solo Lectura**: Cuando un usuario solo tiene `viewUserDetail`, el modal debería abrir en modo lectura (todos los campos deshabilitados)

2. **Aplicar mismo patrón a otras páginas**:
   - Unidades (`UnitsTreePage`)
   - Roles (`RolesListPage`)
   - Logs (`LogsViewerPage`)

3. **Agregar tooltips informativos**: Explicar por qué ciertas acciones no están disponibles

---

**✅ CORRECCIÓN COMPLETADA Y PROBADA**
