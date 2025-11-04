# 🔧 Debugging: Menú Dinámico - Solo muestra Dashboard

## Problema Reportado
Usuario ve solo el Dashboard en el sidebar después de iniciar sesión como admin, cuando debería ver 5 aplicaciones.

## Diagnóstico Realizado

### ✅ Backend - FUNCIONA CORRECTAMENTE
```bash
curl -b cookies.txt http://localhost:5000/api/menu
# Devuelve correctamente las 5 aplicaciones
```

### ❓ Frontend - POSIBLE PROBLEMA
El backend está devolviendo los datos correctos, pero el frontend no los está mostrando.

## Cambios Aplicados para Debugging

### 1. AuthContext.js - Mejorados los console.log
```javascript
console.log('🔄 Cargando menú después del login...');
console.log('📋 Resultado del menú:', menuResult);
console.log('✅ Menú cargado con', menuResult.menu.length, 'items');
```

### 2. Sidebar.js - Añadido useEffect para tracking
```javascript
useEffect(() => {
    console.log('🎯 Sidebar - menú actualizado:', {
        cantidadItems: menu?.length || 0,
        items: menu
    });
}, [menu]);
```

## Instrucciones para el Usuario

### PASO 1: Refrescar el Navegador
1. Ve a http://localhost:3000
2. Presiona **Ctrl+Shift+R** (o Cmd+Shift+R en Mac) para hard refresh
3. Esto limpiará la caché del navegador

### PASO 2: Abrir Consola de Desarrollador
1. Presiona **F12** (o Ctrl+Shift+I)
2. Ve a la pestaña "**Console**"

### PASO 3: Iniciar Sesión
1. Usuario: `admin`
2. Password: `Admin123!`

### PASO 4: Verificar Mensajes en Consola
Deberías ver:
```
🔄 Cargando menú después del login...
📋 Resultado del menú: {success: true, menu: Array(5), total: 5}
✅ Menú cargado con 5 items
🎯 Sidebar - menú actualizado: {cantidadItems: 5, items: Array(5)}
```

### PASO 5: Verificar Network
1. Ve a la pestaña "**Network**" (Red)
2. Filtra por "**menu**"
3. Deberías ver una llamada a `/api/menu` con status **200**
4. Haz clic en ella y verifica que la respuesta tenga 5 items

## Posibles Causas y Soluciones

### A) Caché del Navegador
**Síntoma:** No ves los nuevos console.log  
**Solución:** Ctrl+Shift+R para limpiar caché

### B) El menú llega vacío
**Síntoma:** Ves `cantidadItems: 0`  
**Posible causa:** Error en la llamada a `/api/menu`  
**Verificar:** Pestaña Network debe mostrar la llamada exitosa

### C) El menú no se propaga al Sidebar
**Síntoma:** Ves el menú cargado pero Sidebar dice `cantidadItems: 0`  
**Posible causa:** Problema con React Context  
**Solución:** Revisar que AuthProvider envuelva correctamente la aplicación

### D) Cookies no se envían
**Síntoma:** Error 401 en `/api/menu`  
**Verificar:** 
- En Network, Headers de la request deben incluir Cookie
- Backend debe tener CORS con credentials: true

## Comandos de Verificación

### Verificar que el backend responde correctamente:
```bash
# Login
curl -c /tmp/test-cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'

# Obtener menú
curl -b /tmp/test-cookies.txt http://localhost:5000/api/menu | jq '.menu | length'
# Debe devolver: 5
```

### Verificar Frontend compilado:
```bash
tail -20 /tmp/siga-frontend.log | grep "Compiled"
# Debe mostrar: "Compiled successfully!"
```

## Si el Problema Persiste

### Opción 1: Reiniciar Frontend
```bash
# Detener
kill $(lsof -ti:3000)

# Reiniciar
cd /home/siga/Proyectos/SIGA/frontend
npm start > /tmp/siga-frontend.log 2>&1 &
```

### Opción 2: Limpiar y Reinstalar
```bash
cd /home/siga/Proyectos/SIGA/frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Opción 3: Verificar que menuService esté exportado
```bash
grep "menuService" /home/siga/Proyectos/SIGA/frontend/src/services/index.js
# Debe aparecer la exportación
```

## Información para Reportar

Si el problema continúa, proporciona:
1. **Mensajes de la consola** (todos los que empiecen con 🔄, 📋, ✅, 🎯, ❌)
2. **Respuesta de /api/menu** desde la pestaña Network
3. **Errores en rojo** de la consola (si los hay)
4. **Captura de pantalla** del sidebar

## Archivos Modificados
- `/frontend/src/contexts/AuthContext.js` - Mejorados logs de debugging
- `/frontend/src/components/layout/Sidebar.js` - Añadido useEffect para tracking
- `/DEBUG-MENU-FRONTEND.sh` - Script de instrucciones creado

---

**Última actualización:** 3 de noviembre de 2025
