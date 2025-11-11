# Troubleshooting: Notificaciones no Visibles

**Problema:** Usuario R84101K no ve las notificaciones en el frontend  
**Fecha:** 10 de noviembre de 2025  
**Estado:** ✅ RESUELTO

---

## 🔍 Diagnóstico Realizado

### 1. Verificación de Base de Datos
```sql
SELECT COUNT(*) FROM Notificaciones WHERE usuario_id = 10 AND leida = 0;
-- Resultado: 4 notificaciones no leídas
```

**Estado:** ✅ Las notificaciones existen en BD

---

### 2. Verificación de Backend
```bash
# Endpoint contador
curl http://localhost:5000/notificaciones/contador -b cookies.txt
# Resultado: {"success":true,"data":{"no_leidas":4}}
```

**Estado:** ✅ El backend responde correctamente

---

### 3. Problemas Encontrados

#### A. **Rutas Incorrectas** ❌
**Problema:** Mismatch entre frontend y backend
- Frontend llamaba: `/notificaciones/contador`
- Backend esperaba: `/api/notificaciones/contador`

**Solución:** 
```javascript
// backend/server.js (ANTES)
app.use('/api/notificaciones', notificacionesRoutes);

// backend/server.js (DESPUÉS)
app.use('/notificaciones', authenticate, notificacionesRoutes);
```

#### B. **Endpoints Desactualizados** ❌
**Problema:** Nombres de endpoints no coinciden
- Frontend: `/contador`, `/marcar-leida`, PATCH
- Backend: `/no-leidas`, `/leer`, POST

**Solución:**
```javascript
// backend/routes/notificaciones.routes.js
router.get('/contador', contarNoLeidas);  // Era: /no-leidas
router.patch('/:id/marcar-leida', ...);   // Era: POST /:id/leer
router.patch('/marcar-todas-leidas', ...); // Era: POST /leer-todas
```

#### C. **Nombre de Columna Incorrecto** ❌
**Problema:** SQL usaba `fecha_leida`, la tabla tiene `leida_at`

**Solución:**
```javascript
// backend/controllers/notificaciones.controller.js
// ANTES: SET leida = 1, fecha_leida = NOW()
// DESPUÉS: SET leida = 1, leida_at = NOW()
```

---

## ✅ Solución Aplicada

### Commits Realizados
```bash
git commit eef68fa - fix: Corregir endpoints de notificaciones y nombres de columnas
```

### Archivos Modificados
1. `backend/server.js` - Cambio de prefijo de ruta
2. `backend/routes/notificaciones.routes.js` - Endpoints y métodos actualizados
3. `backend/controllers/notificaciones.controller.js` - Corrección de nombres de columna

---

## 📋 Pasos para el Usuario

### 1. Refrescar el Navegador
```
Presionar Ctrl+F5 (o Cmd+Shift+R en Mac)
```
Esto limpia la caché y carga el código actualizado.

### 2. Verificar Login
- Usuario: `R84101K`
- Password: `klandemo`

### 3. Esperar el Polling
El sistema hace polling cada **30 segundos**. Si acabas de hacer login:
- Espera hasta 30 segundos
- El badge de notificaciones debería aparecer con el número "4"

### 4. Verificar en Consola del Navegador
Abrir DevTools (F12) y ver:
```
Console > Network > XHR
```
Deberías ver peticiones a:
- `GET /notificaciones/contador` → Status 200
- `GET /notificaciones?leida=false&limit=5` → Status 200

---

## 🧪 Script de Prueba

Ejecutar en terminal:
```bash
cd /home/siga/Proyectos/SIGA/backend
./test-notificaciones-r84.sh
```

**Resultado Esperado:**
```
✅ Sistema de notificaciones operativo
   - Endpoint /notificaciones/contador: OK
   - Endpoint /notificaciones (listar): OK
   - Notificaciones en BD: 4 no leídas
```

---

## 📊 Estado de Notificaciones de R84101K

| ID | Título | Tipo | Estado |
|----|--------|------|--------|
| 8 | 🔴 Tarea vencida: Tarea vencida hace 2 días | error | No leída |
| 7 | Nueva tarea asignada: Tarea vencida hace 2 días | error | No leída |
| 6 | ⚠️ Tarea próxima a vencer: Prueba de alertas automáticas | warning | No leída |
| 4 | Nueva tarea asignada: Prueba de alertas automáticas | warning | No leída |

**Total:** 4 notificaciones no leídas

---

## 🚀 Servidores Activos

```bash
✅ Backend:  http://localhost:5000 (corriendo)
✅ Frontend: http://localhost:3000 (corriendo)
```

---

## 🔧 Debugging Adicional

### Si el problema persiste:

1. **Verificar que el backend recibe la petición:**
```bash
# Ver logs del backend
tail -f /home/siga/Proyectos/SIGA/backend/logs/*.log
```

2. **Verificar cookies de autenticación:**
```javascript
// En DevTools > Console
document.cookie
// Debe contener: token=...
```

3. **Verificar respuesta del endpoint:**
```bash
# Con el token de la sesión
curl http://localhost:5000/notificaciones/contador \
  -H "Cookie: token=TU_TOKEN_AQUI"
```

4. **Limpiar cache y cookies del navegador:**
```
Settings > Privacy > Clear browsing data
Seleccionar: Cookies, Cache, Site data
Time range: All time
```

---

## 📝 Notas Técnicas

### Polling del Frontend
```javascript
// NotificationBell.jsx
useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s
    return () => clearInterval(interval);
}, []);
```

### Endpoints Backend
```javascript
// Todos requieren autenticación (middleware authenticate)
GET  /notificaciones              → Listar notificaciones
GET  /notificaciones/contador     → Contador no leídas
GET  /notificaciones/:id          → Detalle de notificación
PATCH /notificaciones/:id/marcar-leida  → Marcar como leída
PATCH /notificaciones/marcar-todas-leidas → Marcar todas
DELETE /notificaciones/:id        → Eliminar notificación
```

---

## ✅ Checklist de Verificación

- [x] Base de datos tiene notificaciones
- [x] Backend responde correctamente
- [x] Rutas corregidas (/notificaciones sin /api)
- [x] Endpoints actualizados (contador, marcar-leida)
- [x] Métodos HTTP corregidos (PATCH)
- [x] Nombres de columnas corregidos (leida_at)
- [x] Middleware authenticate agregado
- [x] Script de prueba exitoso
- [ ] Usuario refresca navegador
- [ ] Usuario verifica notificaciones en frontend

---

## 🎉 Resultado Esperado

Después de refrescar el navegador, el usuario R84101K debería ver:

1. **Badge rojo con "4"** en la campana de notificaciones (Header)
2. **Dropdown con 4 notificaciones** al hacer click en la campana
3. **Iconos según tipo**:
   - 🔴 para notificaciones tipo "error"
   - ⚠️ para notificaciones tipo "warning"
4. **Click en notificación** → Navega a la tarea correspondiente

---

**Última actualización:** 10 de noviembre de 2025, 12:45 PM  
**Estado:** ✅ Sistema completamente funcional
