# ============================================================================
# CREDENCIALES DE USUARIOS DE PRUEBA
# ============================================================================
# Fecha: 23 de octubre de 2025
# Base de datos: siga_db

## Usuario Administrador

**Username:** admin  
**Password:** Password123!  
**Nombre Completo:** Administrador del Sistema  
**Email:** admin@siga.es  
**Unidad:** Zona Centro (ID: 1)  
**Rol:** Admin Total  
**Estado:** Activo  
**Require Password Change:** No

### Permisos del Rol "Admin Total":
- Acceso total al sistema
- Gestión de usuarios, unidades, roles y permisos
- Visualización de logs y auditoría
- Nivel jerárquico: 0 (máximo)

---

## Otros Usuarios de Prueba

### 1. Jefe de Zona Centro
**Username:** jefe.zona.centro  
**Password:** Password123!  
**Nombre:** María García López  
**Email:** maria.garcia@siga.es  
**Unidad:** Zona Centro

### 2. Jefe Comandancia Madrid
**Username:** jefe.cmd.madrid  
**Password:** Password123!  
**Nombre:** Carlos Rodríguez Martín  
**Email:** carlos.rodriguez@siga.es  
**Unidad:** Comandancia de Madrid

### 3. Jefe Compañía Madrid Centro
**Username:** jefe.cmp.madrid.centro  
**Password:** Password123!  
**Nombre:** Ana Martínez Fernández  
**Email:** ana.martinez@siga.es  
**Unidad:** Compañía de Seguridad Ciudadana - Madrid Centro

### 4. Agente Puesto Sol
**Username:** agente.sol  
**Password:** Password123!  
**Nombre:** Luis Sánchez García  
**Email:** luis.sanchez@siga.es  
**Unidad:** Puesto de Sol

### 5. Agente Puesto Retiro
**Username:** agente.retiro  
**Password:** Password123!  
**Nombre:** Carmen López Ruiz  
**Email:** carmen.lopez@siga.es  
**Unidad:** Puesto de Retiro

### 6. Jefe Comandancia Toledo
**Username:** jefe.cmd.toledo  
**Password:** Password123!  
**Nombre:** Pedro Gómez Pérez  
**Email:** pedro.gomez@siga.es  
**Unidad:** Comandancia de Toledo

### 7. Jefe Zona Norte
**Username:** jefe.zona.norte  
**Password:** Password123!  
**Nombre:** Isabel Fernández Díaz  
**Email:** isabel.fernandez@siga.es  
**Unidad:** Zona Norte

---

## ✅ Estado de las Pruebas

### Última ejecución: 24 de octubre de 2025

**Resultado:** ✅ **TODAS LAS PRUEBAS PASARON (22/22)**

#### Endpoints Verificados:
1. ✅ Health Check (público)
2. ✅ Autenticación (Login, Me)
3. ✅ Usuarios (Listar, Ver, Filtros) - 3 endpoints
4. ✅ Unidades (Árbol, Lista, Ver, Descendientes) - 4 endpoints
5. ✅ Roles (Listar, Ver, Permisos) - 3 endpoints
6. ✅ Permisos (Listar, Por Recurso, Ver) - 3 endpoints
7. ✅ Roles y Alcance (Ver Roles de Usuario) - 1 endpoint
8. ✅ Notificaciones (Listar, Contar No Leídas) - 2 endpoints
9. ✅ Logs (Listar, Estadísticas) - 2 endpoints
10. ✅ Menú Dinámico (Obtener Menú) - 1 endpoint

**Total de permisos en sistema:** 32 permisos atómicos
- 28 permisos originales
- 4 permisos nuevos agregados para gestión de permisos (permissions:view, permissions:create, permissions:edit, permissions:delete)

**Correcciones aplicadas:**
- ✅ Controlador de permisos: cambiado campo `nombre` y `recurso` por `accion` y `categoria`
- ✅ Controlador de roles: cambiado campo `nombre` y `recurso` por `accion` y `categoria`  
- ✅ Controlador de notificaciones: cambiado campo `fecha_leida` por `leida_at`
- ✅ Agregados permisos faltantes para gestión de permisos
- ✅ Permisos asignados al rol Admin Total

---

## Comandos de Prueba

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Password123!"}' \
  -c /tmp/cookies.txt
```

### Verificar Sesión
```bash
curl http://localhost:5000/api/auth/me -b /tmp/cookies.txt
```

### Listar Usuarios
```bash
curl "http://localhost:5000/api/usuarios?limite=10" -b /tmp/cookies.txt
```

### Listar Unidades (Árbol)
```bash
curl http://localhost:5000/api/unidades -b /tmp/cookies.txt
```

### Listar Roles
```bash
curl http://localhost:5000/api/roles -b /tmp/cookies.txt
```

### Obtener Usuario por ID
```bash
curl http://localhost:5000/api/usuarios/1 -b /tmp/cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout -b /tmp/cookies.txt
```

---

## Notas de Seguridad

⚠️ **IMPORTANTE:** Estas credenciales son SOLO para desarrollo y pruebas.  
⚠️ En producción, cambiar todas las contraseñas por valores seguros.  
⚠️ Las contraseñas están hasheadas con bcrypt (10 rounds).  
⚠️ Los tokens JWT expiran en 24 horas.  
⚠️ Las cookies son HttpOnly y Secure (en producción).

---

**Última actualización:** 23 de octubre de 2025
