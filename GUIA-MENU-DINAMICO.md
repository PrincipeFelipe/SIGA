# 🎯 Guía de Uso: Menú Dinámico por Permisos

## 📌 Acceso al Sistema

### URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Credenciales de Prueba
```
Usuario: admin
Password: Admin123!
```

---

## 🔍 Cómo Funciona

### 1. Inicio de Sesión
1. Abre http://localhost:3000
2. Ingresa tus credenciales
3. El sistema carga automáticamente tu menú personalizado

### 2. Visualización del Menú
Al iniciar sesión, verás en el sidebar **únicamente** las aplicaciones para las que tienes permisos:

#### Usuario Admin (Acceso Total)
```
┌─────────────────────┐
│ 🏠 Dashboard        │ ← Sin permiso requerido
│ 👥 Usuarios         │ ← Requiere users:view
│ 🏢 Unidades         │ ← Requiere units:view
│ 🛡️  Roles           │ ← Requiere roles:view
│ 📋 Logs             │ ← Requiere logs:view
└─────────────────────┘
```

#### Usuario con Permisos Limitados
```
┌─────────────────────┐
│ 🏠 Dashboard        │ ← Siempre visible
│ 👥 Usuarios         │ ← Si tiene users:view
└─────────────────────┘
```

---

## 🎮 Pruebas Interactivas

### Probar Diferentes Usuarios

1. **Login como Admin (acceso total)**
   ```bash
   Usuario: admin
   Password: Admin123!
   ```
   → Verás las 5 aplicaciones

2. **Logout**
   - Haz clic en el botón de logout en el header

3. **Login con otro usuario**
   ```bash
   Usuario: jefe.zona.norte
   Password: Password123!
   ```
   → Verás solo las aplicaciones según sus permisos

---

## 🛠️ Para Desarrolladores

### Ver Respuesta del Menú (con curl)

1. **Login**
   ```bash
   curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Admin123!"}'
   ```

2. **Obtener Menú**
   ```bash
   curl -b cookies.txt http://localhost:5000/api/menu
   ```

3. **Respuesta Esperada**
   ```json
   {
     "success": true,
     "menu": [
       {
         "id": 1,
         "nombre": "Dashboard",
         "ruta": "/",
         "icono": "icon-home",
         "orden": 1
       },
       ...
     ],
     "total": 5
   }
   ```

### Ejecutar Script de Prueba Automatizado

```bash
cd /home/siga/Proyectos/SIGA/backend
./demo-menu-dinamico.sh
```

---

## 📊 Aplicaciones Disponibles

| Nombre | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| Dashboard | `/` | *(ninguno)* | Panel principal - **Siempre visible** |
| Usuarios | `/usuarios` | `users:view` | Gestión de usuarios |
| Unidades | `/unidades` | `units:view` | Estructura organizacional |
| Roles | `/roles` | `roles:view` | Gestión de roles y permisos |
| Logs | `/logs` | `logs:view` | Auditoría del sistema |

---

## ❓ Preguntas Frecuentes

### ¿Por qué no veo todas las aplicaciones?
**R:** Solo ves las aplicaciones para las que tienes el permiso correspondiente. Esto es intencional por seguridad.

### ¿Cómo puedo obtener acceso a más aplicaciones?
**R:** Un administrador debe asignar roles con los permisos necesarios a tu usuario mediante el módulo de Gestión de Roles.

### ¿El Dashboard siempre está visible?
**R:** Sí, el Dashboard no requiere permisos especiales y está disponible para todos los usuarios autenticados.

### ¿Qué pasa si intento acceder directamente a una URL sin permiso?
**R:** El sistema backend verificará tus permisos y devolverá un error 403 (Forbidden) si no estás autorizado.

### ¿El menú se actualiza si cambian mis permisos?
**R:** Sí, cierra sesión y vuelve a iniciar sesión para que el menú se actualice con tus nuevos permisos.

---

## 🔐 Consideraciones de Seguridad

### ✅ Lo que está protegido:
- El endpoint `/api/menu` requiere autenticación JWT
- La verificación de permisos se hace en el servidor
- Los usuarios solo reciben información de apps autorizadas

### ⚠️ Importante:
- No confiar en el frontend para seguridad
- Todos los endpoints de aplicaciones tienen su propia validación
- Ocultar un menú NO reemplaza la autorización backend

---

## 📝 Añadir Nuevas Aplicaciones

### Para Administradores del Sistema

1. **Insertar en Base de Datos**
   ```sql
   INSERT INTO Aplicaciones (nombre, descripcion, ruta, icono, permiso_requerido_id, orden) 
   VALUES (
     'Reportes',
     'Ver reportes del sistema',
     '/reportes',
     'icon-chart-bar',
     (SELECT id FROM Permisos WHERE accion = 'reports:view'),
     6
   );
   ```

2. **El menú se actualiza automáticamente**
   - Los usuarios con el permiso `reports:view` verán la nueva aplicación
   - No requiere cambios en el código frontend

3. **Crear la página React**
   ```bash
   # Crear el componente
   touch frontend/src/pages/reportes/ReportsPage.js
   
   # Añadir ruta en App.js
   # <Route path="/reportes" element={<ReportsPage />} />
   ```

---

## 🎨 Personalizar Iconos

### Iconos Disponibles

El sistema mapea nombres de iconos de la BD a componentes React:

```javascript
'icon-home'      → FiHome       (🏠)
'icon-users'     → FiUsers      (👥)
'icon-sitemap'   → FiLayers     (🏢)
'icon-shield'    → FiShield     (🛡️)
'icon-history'   → FiFileText   (📋)
'icon-chart-bar' → FiBarChart2  (📊)
'icon-settings'  → FiSettings   (⚙️)
'icon-grid'      → FiGrid       (◻️)
```

### Añadir Nuevos Iconos

1. Importar en `Sidebar.js`:
   ```javascript
   import { FiNewIcon } from 'react-icons/fi';
   ```

2. Añadir al mapeo:
   ```javascript
   const iconMap = {
     ...
     'icon-new': FiNewIcon
   };
   ```

3. Usar en la BD:
   ```sql
   UPDATE Aplicaciones SET icono = 'icon-new' WHERE id = X;
   ```

---

## 📞 Soporte

Para más información, consulta la documentación técnica:
- 📄 `/MENU-DINAMICO-IMPLEMENTADO.md` - Documentación completa
- 📄 `/RESUMEN-MENU-DINAMICO.md` - Resumen ejecutivo
- 📄 `/README.md` - Documentación general del proyecto

---

**¡Disfruta del menú personalizado según tus permisos! 🎉**
