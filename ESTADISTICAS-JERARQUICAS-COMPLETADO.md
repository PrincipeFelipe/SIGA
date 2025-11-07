# Estadísticas Jerárquicas - Implementación Completada

**Fecha:** 6 de noviembre de 2025  
**Módulo:** Gestión de Tareas  
**Feature:** Dashboard con estadísticas jerárquicas

---

## 📋 Descripción

Se ha implementado un sistema de estadísticas dual en el dashboard de tareas:

1. **Mis Tareas** - Estadísticas personales (tareas asignadas al usuario)
2. **Tareas de mi Ámbito** - Estadísticas jerárquicas (todas las tareas dentro del alcance del usuario)

---

## 🎯 Funcionalidad

### Backend

El endpoint `/api/tareas/estadisticas` acepta un parámetro `global`:

- **`global=false`** (por defecto): Retorna estadísticas de tareas asignadas al usuario
- **`global=true`**: Retorna estadísticas filtradas jerárquicamente según permisos

#### Lógica de Filtrado Jerárquico

```javascript
if (global === 'true') {
    // 1. Verificar si el usuario tiene tasks:view_all
    const puedeVerTodas = await checkPermission('tasks:view_all');
    
    if (!puedeVerTodas) {
        // 2. Obtener unidades accesibles según alcance
        const unidadesAccesibles = await obtenerUnidadesAccesibles(usuario_id, 'tasks:view');
        
        // 3. Filtrar tareas donde el usuario asignado pertenece a unidades accesibles
        WHERE t.id IN (
            SELECT t.id 
            FROM Tareas t
            INNER JOIN Usuarios ua ON t.asignado_a = ua.id
            WHERE ua.unidad_destino_id IN (unidadesAccesibles)
               OR t.asignado_a = usuario_id
               OR t.asignado_por = usuario_id
        )
    }
    // Si tiene tasks:view_all, no aplica filtro (ve todas)
}
```

**Archivo modificado:**  
`/backend/controllers/tareas.controller.js` - método `obtenerEstadisticas()` (líneas 624-688)

### Frontend

**Componente:** `TasksListPage.js`

#### Estado Añadido

```javascript
const [stats, setStats] = useState(null);             // Estadísticas personales
const [statsJerarquicas, setStatsJerarquicas] = useState(null);  // Estadísticas jerárquicas
```

#### Función de Carga

```javascript
const cargarEstadisticas = async () => {
  try {
    // 1. Cargar estadísticas personales
    const result = await tareasService.obtenerEstadisticas(false);
    setStats(result);
    
    // 2. Cargar estadísticas jerárquicas (si tiene permisos)
    if (can.viewAllTasks || can.viewTasks) {
      try {
        const resultJerarquicas = await tareasService.obtenerEstadisticas(true);
        setStatsJerarquicas(resultJerarquicas);
      } catch (error) {
        console.log('No tiene permisos para ver estadísticas jerárquicas');
      }
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
};
```

#### UI Dual

El dashboard ahora muestra dos secciones de estadísticas:

**Sección 1: "Mis Tareas"**
- Total de tareas asignadas
- En progreso
- Completadas
- Vencidas

**Sección 2: "Tareas de mi Ámbito"** (solo si tiene permisos)
- Badge: "Incluye unidades dependientes"
- Misma estructura de 4 cards
- Muestra datos jerárquicos

**Archivo modificado:**  
`/frontend/src/pages/tareas/TasksListPage.js` (líneas 18-19, 76-94, 261-365)

---

## ✅ Verificación y Pruebas

### Script de Prueba

**Archivo:** `/backend/test-estadisticas-jerarquicas.sh`

#### Resultados de Prueba

```
┌─────────────────────────────────┬──────────┬──────────────┐
│ Usuario                         │ Personal │ Jerárquicas  │
├─────────────────────────────────┼──────────┼──────────────┤
│ R84101K                         │        2 │            6 │
│ Admin                           │        - │            7 │
└─────────────────────────────────┴──────────┴──────────────┘
```

#### Análisis de Resultados

**Usuario R84101K:**
- Alcance: Compañía Pamplona (ID 7) + Puesto Pamplona (ID 15)
- Estadísticas personales: 2 tareas (asignadas directamente a él)
- Estadísticas jerárquicas: 6 tareas (todas las de su ámbito)
- ✅ **Correcto:** No ve la tarea de Zona Navarra (fuera de su alcance)

**Usuario Admin:**
- Permiso: `tasks:view_all`
- Estadísticas jerárquicas: 7 tareas (todas las del sistema)
- ✅ **Correcto:** Ve todas las tareas sin filtro

### Casos de Prueba

#### CP-01: Usuario con alcance jerárquico limitado

```bash
curl -X GET "http://localhost:5000/api/tareas/estadisticas?global=true" \
  -b cookies-r84.txt
```

**Resultado esperado:**  
✅ Retorna solo estadísticas de tareas dentro del alcance jerárquico

**Resultado obtenido:**  
```json
{
  "success": true,
  "data": {
    "total": 6,
    "pendientes": "5",
    "en_progreso": "0",
    "en_revision": "0",
    "completadas": "1",
    "canceladas": "0",
    "vencidas": "0",
    "total_241": "2"
  }
}
```

#### CP-02: Usuario con permiso global

```bash
curl -X GET "http://localhost:5000/api/tareas/estadisticas?global=true" \
  -b cookies-admin.txt
```

**Resultado esperado:**  
✅ Retorna estadísticas de todas las tareas

**Resultado obtenido:**  
```json
{
  "success": true,
  "data": {
    "total": 7,
    "pendientes": "6",
    "en_progreso": "0",
    "en_revision": "0",
    "completadas": "1",
    "canceladas": "0",
    "vencidas": "0",
    "total_241": "2"
  }
}
```

#### CP-03: Estadísticas personales

```bash
curl -X GET "http://localhost:5000/api/tareas/estadisticas?global=false" \
  -b cookies-r84.txt
```

**Resultado esperado:**  
✅ Retorna solo tareas asignadas al usuario

**Resultado obtenido:**  
```json
{
  "success": true,
  "data": {
    "total": 2,
    "pendientes": "2",
    "en_progreso": "0",
    "en_revision": "0",
    "completadas": "0",
    "canceladas": "0",
    "vencidas": "0",
    "total_241": "0"
  }
}
```

---

## 🔐 Sistema de Permisos

### Permisos Involucrados

| Permiso | Descripción | Efecto en Estadísticas |
|---------|-------------|------------------------|
| `tasks:view_all` | Ver todas las tareas | Estadísticas globales sin filtro |
| `tasks:view` | Ver tareas del ámbito | Estadísticas filtradas jerárquicamente |
| `tasks:view_own` | Solo tareas propias | Solo estadísticas personales |

### Verificación de Permisos en Frontend

```javascript
if (can.viewAllTasks || can.viewTasks) {
  // Mostrar sección "Tareas de mi Ámbito"
  const resultJerarquicas = await tareasService.obtenerEstadisticas(true);
  setStatsJerarquicas(resultJerarquicas);
}
```

---

## 📊 Estructura de Datos

### Request

```
GET /api/tareas/estadisticas?global={true|false}
Authorization: Cookie (JWT)
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 6,
    "pendientes": "5",
    "en_progreso": "0",
    "en_revision": "0",
    "completadas": "1",
    "canceladas": "0",
    "vencidas": "0",
    "total_241": "2"
  }
}
```

### Campos de Estadísticas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total` | Number | Total de tareas |
| `pendientes` | String | Tareas en estado "pendiente" |
| `en_progreso` | String | Tareas en estado "en_progreso" |
| `en_revision` | String | Tareas en estado "en_revision" |
| `completadas` | String | Tareas en estado "completada" |
| `canceladas` | String | Tareas en estado "cancelada" |
| `vencidas` | Number | Tareas con fecha límite pasada y no completadas |
| `total_241` | String | Tareas con es_241 = TRUE |

---

## 🎨 Interfaz de Usuario

### Layout del Dashboard

```
┌─────────────────────────────────────────────────┐
│  📊 Mis Tareas                                  │
├─────────┬─────────┬─────────┬─────────┐         │
│ Total   │ En Prog │ Complet │ Vencidas│         │
│   2     │    0    │    0    │    0    │         │
└─────────┴─────────┴─────────┴─────────┘         │
                                                   │
│  📊 Tareas de mi Ámbito                         │
│  🏷️ Badge: "Incluye unidades dependientes"      │
├─────────┬─────────┬─────────┬─────────┐         │
│ Total   │ En Prog │ Complet │ Vencidas│         │
│   6     │    5    │    1    │    0    │         │
└─────────┴─────────┴─────────┴─────────┘         │
```

### Colores y Estilos

- **Total:** Gradiente azul (`from-blue-500 to-blue-600`)
- **En Progreso:** Gradiente amarillo (`from-yellow-500 to-yellow-600`)
- **Completadas:** Gradiente verde (`from-green-500 to-green-600`)
- **Vencidas:** Gradiente rojo (`from-red-500 to-red-600`)
- **Badge:** Fondo verde claro con texto verde oscuro

---

## 🔄 Flujo de Datos

```
┌──────────────┐
│   Usuario    │
│  Dashboard   │
└──────┬───────┘
       │
       │ cargarEstadisticas()
       │
       ├─── obtenerEstadisticas(false) ────┐
       │                                   │
       └─── obtenerEstadisticas(true) ─────┤
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │  Backend Controller     │
                              │  obtenerEstadisticas()  │
                              └────────┬────────────────┘
                                       │
                   ┌───────────────────┴──────────────────┐
                   │                                      │
                   ▼                                      ▼
         ┌──────────────────┐               ┌──────────────────────┐
         │ global = false   │               │   global = true      │
         │ WHERE asignado_a │               │ Filtrado jerárquico  │
         │    = usuario_id  │               │ por unidades         │
         └──────────────────┘               └──────────────────────┘
                   │                                      │
                   └──────────────┬───────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Estadísticas  │
                         │   Calculadas    │
                         └─────────────────┘
```

---

## 📝 Archivos Modificados

### Backend

**`/backend/controllers/tareas.controller.js`**

- Método `obtenerEstadisticas()` (líneas 624-688)
- Cambios principales:
  - Añadido parámetro `global` de query
  - Implementado filtrado jerárquico cuando `global=true`
  - Verificación de permiso `tasks:view_all`
  - Uso de `obtenerUnidadesAccesibles()` para CTEs recursivos

### Frontend

**`/frontend/src/pages/tareas/TasksListPage.js`**

- Estado (línea 19): Añadido `statsJerarquicas`
- Función `cargarEstadisticas()` (líneas 76-94): Doble llamada a API
- Renderizado (líneas 261-365): Dos secciones de estadísticas

---

## 🧪 Ejecución de Pruebas

### Comando

```bash
bash /home/siga/Proyectos/SIGA/backend/test-estadisticas-jerarquicas.sh
```

### Prerequisitos

- Backend corriendo en `http://localhost:5000`
- Base de datos con datos de prueba
- Usuarios: `admin` y `R84101K` con credenciales válidas

### Resultado Esperado

```
✅ Todos los tests completados

┌─────────────────────────────────┬──────────┬──────────────┐
│ Usuario                         │ Personal │ Jerárquicas  │
├─────────────────────────────────┼──────────┼──────────────┤
│ R84101K                         │        2 │            6 │
│ Admin                           │        - │            7 │
└─────────────────────────────────┴──────────┴──────────────┘
```

---

## ✅ Checklist de Completitud

- [x] Backend: Filtrado jerárquico en `obtenerEstadisticas()`
- [x] Backend: Verificación de permiso `tasks:view_all`
- [x] Backend: Uso de CTEs recursivos para alcance
- [x] Frontend: Estado `statsJerarquicas`
- [x] Frontend: Función `cargarEstadisticas()` dual
- [x] Frontend: Sección "Mis Tareas"
- [x] Frontend: Sección "Tareas de mi Ámbito"
- [x] Frontend: Badge "Incluye unidades dependientes"
- [x] Frontend: Renderizado condicional según permisos
- [x] Pruebas: Script de verificación automatizada
- [x] Pruebas: Validación con R84101K (alcance limitado)
- [x] Pruebas: Validación con admin (permiso global)
- [x] Documentación: Este archivo completo

---

## 🎯 Estado Final

**✅ COMPLETADO - 100%**

El sistema de estadísticas jerárquicas está completamente funcional y verificado. Los usuarios ven:

1. **Sus tareas personales** en la primera sección
2. **Todas las tareas de su ámbito jerárquico** en la segunda sección (si tienen permisos)

El filtrado respeta correctamente:
- Los permisos del usuario (`tasks:view_all`, `tasks:view`, `tasks:view_own`)
- La jerarquía organizacional (Zona → Compañía → Puesto)
- Los alcances asignados en `Usuario_Roles_Alcance`

---

## 📚 Referencias

- [MODULO-UNIDADES-COMPLETO.md](./MODULO-UNIDADES-COMPLETO.md) - Documentación del módulo de tareas
- [CORRECCIONES-PERMISOS-GRANULARES.md](./CORRECCIONES-PERMISOS-GRANULARES.md) - Sistema de permisos
- [IMPLEMENTACION-COMPLETADA.md](./backend/IMPLEMENTACION-COMPLETADA.md) - Backend completo
- Script de prueba: `backend/test-estadisticas-jerarquicas.sh`

---

**Última actualización:** 6 de noviembre de 2025  
**Autor:** GitHub Copilot  
**Estado:** ✅ Implementación completada y verificada
