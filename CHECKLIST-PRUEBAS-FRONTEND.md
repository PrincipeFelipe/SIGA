# 🧪 Checklist de Pruebas - Refactorización Frontend
**Fecha:** 24 de octubre de 2025  
**Estado Servidores:**  
- ✅ Backend: http://localhost:5000  
- ✅ Frontend: http://localhost:3000

---

## 📋 Guía de Pruebas Manuales

### Credenciales de Prueba
```
Usuario: admin
Contraseña: Admin123!
```
*(Ver CREDENCIALES-PRUEBA.md para más usuarios)*

---

## 1️⃣ Módulo de Usuarios (/usuarios)

### Navegación
- [ ] Acceder a http://localhost:3000/usuarios
- [ ] Sidebar muestra "Usuarios" activo
- [ ] Header muestra título "Usuarios"

### Filtros
- [ ] Campo de búsqueda funciona (buscar por nombre/usuario/email)
- [ ] Filtro de unidad funciona
- [ ] Filtro de estado funciona (Todos/Activos/Inactivos)
- [ ] Checkbox "Incluir descendientes" funciona
- [ ] Botón "Limpiar Filtros" resetea todos los campos
- [ ] Debounce de búsqueda funciona (500ms delay)

### Paginación
- [ ] Números de página se muestran correctamente
- [ ] Botón "Anterior" funciona
- [ ] Botón "Siguiente" funciona
- [ ] Click en número de página funciona
- [ ] Ellipsis (...) aparece cuando hay muchas páginas

### Crear Usuario
- [ ] Click en "Nuevo Usuario" abre modal
- [ ] Modal muestra título "Nuevo Usuario"
- [ ] Todos los campos son editables
- [ ] Campo username es requerido (min 3 caracteres)
- [ ] Campo nombre_completo es requerido
- [ ] Campo email valida formato
- [ ] Campo password es requerido (min 8 caracteres)
- [ ] Campo confirmPassword valida que coincida
- [ ] Dropdown de unidad carga unidades
- [ ] Checkbox "Requerir cambio de contraseña" funciona
- [ ] Click en "Cancelar" cierra modal
- [ ] Click en "Crear Usuario" guarda y muestra toast success
- [ ] Tabla se recarga automáticamente tras crear

### Editar Usuario
- [ ] Click en botón editar (lápiz) abre modal
- [ ] Modal muestra título "Editar Usuario"
- [ ] Datos del usuario se pre-cargan correctamente
- [ ] Campo username está deshabilitado
- [ ] Campo password es opcional (vacío = no cambiar)
- [ ] Click en "Actualizar Usuario" guarda y muestra toast success
- [ ] Tabla se recarga automáticamente tras editar

### Restablecer Contraseña
- [ ] Click en botón llave abre SweetAlert2 de confirmación
- [ ] SweetAlert2 muestra nombre del usuario
- [ ] Click en "Cancelar" cierra alerta sin hacer nada
- [ ] Click en "Sí, restablecer" ejecuta operación
- [ ] Segunda SweetAlert2 muestra la nueva contraseña
- [ ] Contraseña se muestra en bloque de código formateado
- [ ] Mensaje indica que usuario debe cambiar en próximo login
- [ ] Toast success aparece
- [ ] Tabla se recarga automáticamente

### Eliminar Usuario
- [ ] Click en botón basura abre SweetAlert2 de confirmación
- [ ] SweetAlert2 muestra nombre del usuario
- [ ] Click en "Cancelar" cierra alerta sin hacer nada
- [ ] Click en "Sí, eliminar" ejecuta operación
- [ ] Toast success aparece "Usuario eliminado correctamente"
- [ ] Tabla se recarga automáticamente
- [ ] Usuario desaparece de la tabla

### Validaciones y Errores
- [ ] Intentar crear usuario sin campos requeridos muestra errores
- [ ] Email inválido muestra error
- [ ] Contraseñas que no coinciden muestran error
- [ ] Error de red muestra toast error con mensaje del backend
- [ ] Intentar eliminar usuario con dependencias muestra error

---

## 2️⃣ Módulo de Unidades (/unidades)

### Navegación
- [ ] Acceder a http://localhost:3000/unidades
- [ ] Sidebar muestra "Unidades" activo
- [ ] Árbol jerárquico se despliega correctamente

### Árbol Jerárquico
- [ ] Unidades raíz se muestran
- [ ] Click en icono (+) expand/colapsa hijos
- [ ] Iconos cambian entre FiChevronRight y FiChevronDown
- [ ] Indentación visual muestra jerarquía correctamente
- [ ] Colores de fondo alternan por nivel
- [ ] Badges de tipo se muestran con colores correctos

### Botones de Acción en Nodos
- [ ] Botón "Ver detalles" (ojo) abre modal de detalles
- [ ] Botón "Agregar hijo" (+) abre modal de creación
- [ ] Botón "Editar" (lápiz) abre modal de edición
- [ ] Botón "Eliminar" (basura) abre SweetAlert2 de confirmación

### Crear Unidad Raíz
- [ ] Click en "Nueva Unidad" abre modal
- [ ] Modal muestra título "Nueva Unidad"
- [ ] Todos los campos son editables
- [ ] Campo "Unidad Superior" muestra "Ninguna (Raíz)"
- [ ] Dropdown de tipo muestra opciones
- [ ] Click en "Crear Unidad" guarda y muestra toast success
- [ ] Árbol se recarga automáticamente

### Crear Unidad Hija
- [ ] Click en "+" en un nodo abre modal
- [ ] Modal muestra título "Nueva Unidad"
- [ ] Campo "Unidad Superior" muestra el padre correcto
- [ ] Campo "Unidad Superior" está deshabilitado
- [ ] Click en "Crear Unidad" guarda bajo el padre correcto
- [ ] Árbol se recarga automáticamente

### Editar Unidad
- [ ] Click en botón editar abre modal
- [ ] Modal muestra título "Editar Unidad"
- [ ] Datos de la unidad se pre-cargan
- [ ] Campo "Unidad Superior" no incluye la unidad misma
- [ ] Campo "Unidad Superior" no incluye descendientes
- [ ] Click en "Actualizar Unidad" guarda y muestra toast success
- [ ] Árbol se recarga automáticamente

### Ver Detalles
- [ ] Click en botón ojo abre modal de detalles
- [ ] Modal muestra toda la información de la unidad
- [ ] Información se muestra formateada correctamente
- [ ] Click en "Cerrar" cierra el modal

### Eliminar Unidad
- [ ] Click en botón basura abre SweetAlert2
- [ ] SweetAlert2 muestra nombre de la unidad
- [ ] Click en "Cancelar" cierra sin hacer nada
- [ ] Click en "Sí, eliminar" ejecuta operación
- [ ] Toast success aparece
- [ ] Árbol se recarga automáticamente
- [ ] Unidad desaparece del árbol

### Validaciones
- [ ] Intentar crear sin nombre muestra error
- [ ] Nombre muy corto (< 3 chars) muestra error
- [ ] Código muy corto (< 2 chars) muestra error
- [ ] Error de red muestra toast error
- [ ] Intentar eliminar unidad con hijos muestra error

---

## 3️⃣ Módulo de Roles (/roles) ⭐ NUEVO

### Navegación
- [ ] Acceder a http://localhost:3000/roles
- [ ] Sidebar muestra "Roles" activo
- [ ] Header muestra título "Roles y Permisos"

### Tabla de Roles
- [ ] Tabla carga correctamente con roles
- [ ] Columna "Rol" muestra icono y nombre
- [ ] Columna "Descripción" muestra texto o "-"
- [ ] Columna "Nivel" muestra badge con nivel jerárquico
- [ ] Badge de nivel usa colores diferentes (≤3 primary, >3 secondary)
- [ ] Columna "Permisos" muestra contador
- [ ] Botones de acción (editar, eliminar) funcionan

### Crear Rol
- [ ] Click en "Nuevo Rol" abre modal
- [ ] Modal muestra título "Nuevo Rol"
- [ ] Campo "Nombre del Rol" es requerido (min 3 chars)
- [ ] Campo "Nivel Jerárquico" acepta 1-10
- [ ] Campo "Descripción" es opcional
- [ ] Sección de permisos muestra grupos por recurso
- [ ] Checkboxes de recursos funcionan (marcar/desmarcar grupo)
- [ ] Checkboxes individuales funcionan
- [ ] Checkbox de grupo muestra estado indeterminado cuando aplica
- [ ] Contador de permisos actualiza en tiempo real
- [ ] Click en "Crear Rol" guarda y muestra toast success
- [ ] Tabla se recarga automáticamente

### Editar Rol
- [ ] Click en botón editar abre modal
- [ ] Modal muestra título "Editar Rol"
- [ ] Datos del rol se pre-cargan
- [ ] Permisos actuales se pre-seleccionan correctamente
- [ ] Checkboxes de grupo reflejan estado correcto
- [ ] Click en "Actualizar Rol" guarda y muestra toast success
- [ ] Tabla se recarga automáticamente

### Eliminar Rol
- [ ] Click en botón basura abre SweetAlert2
- [ ] SweetAlert2 muestra nombre del rol y nivel
- [ ] Click en "Cancelar" cierra sin hacer nada
- [ ] Click en "Sí, eliminar" ejecuta operación
- [ ] Toast success aparece "Rol eliminado correctamente"
- [ ] Tabla se recarga automáticamente
- [ ] Rol desaparece de la tabla

### Validaciones
- [ ] Nombre vacío muestra error
- [ ] Nombre muy corto (< 3 chars) muestra error
- [ ] Nivel fuera de rango (1-10) muestra error
- [ ] Error de red muestra toast error

---

## 4️⃣ Pruebas de Componentes Comunes

### Layout
- [ ] Sidebar se muestra en desktop
- [ ] Sidebar se oculta en móvil
- [ ] Header se muestra correctamente
- [ ] Contenido principal tiene padding correcto
- [ ] Scroll funciona cuando contenido es largo

### Sidebar
- [ ] Logo o placeholder se muestra
- [ ] Items del menú se muestran correctamente
- [ ] Item activo tiene fondo destacado
- [ ] Hover en items funciona
- [ ] Click en item navega correctamente
- [ ] Footer muestra versión "SIGA v1.0.0"

### Modales
- [ ] Overlay oscuro aparece detrás del modal
- [ ] Click en overlay cierra el modal
- [ ] Botón X cierra el modal
- [ ] Modal tiene scroll si el contenido es alto
- [ ] Modal es responsive en móvil

### SweetAlert2
- [ ] Alertas se muestran centradas
- [ ] Colores corporativos se aplican (primary, accent)
- [ ] Botón confirmar usa color accent (#C8102E)
- [ ] Botón cancelar usa color gris (#6B7280)
- [ ] HTML dentro de alertas se renderiza correctamente
- [ ] Iconos (warning, success, question) se muestran

### React Hot Toast
- [ ] Toasts aparecen en top-right
- [ ] Toast success tiene icono verde (#004E2E)
- [ ] Toast error tiene icono rojo (#C8102E)
- [ ] Toasts desaparecen automáticamente (4s)
- [ ] Múltiples toasts se apilan correctamente
- [ ] Click en toast lo cierra anticipadamente

---

## 5️⃣ Pruebas de Integración

### Flujo Completo: Crear Usuario con Rol
- [ ] Crear un nuevo rol con permisos específicos
- [ ] Crear una nueva unidad organizacional
- [ ] Crear un nuevo usuario asignado a esa unidad
- [ ] Asignar el rol creado al usuario (módulo pendiente)
- [ ] Verificar que todo se creó correctamente

### Flujo Completo: Jerarquía de Unidades
- [ ] Crear unidad raíz (ej: "Dirección General")
- [ ] Crear unidad hija (ej: "Subdirección A")
- [ ] Crear unidad nieta (ej: "Departamento 1")
- [ ] Verificar que el árbol muestra la jerarquía correcta
- [ ] Editar unidad intermedia
- [ ] Eliminar unidad hoja (sin hijos)

### Flujo Completo: Gestión de Usuarios
- [ ] Crear usuario nuevo
- [ ] Iniciar sesión con ese usuario (logout primero)
- [ ] Verificar que requiere cambio de contraseña
- [ ] Cambiar contraseña
- [ ] Editar datos del usuario (como admin)
- [ ] Restablecer contraseña del usuario
- [ ] Desactivar usuario (cambiar a inactivo)

---

## 6️⃣ Pruebas de Errores y Edge Cases

### Manejo de Errores de Red
- [ ] Detener backend y probar operaciones
- [ ] Verificar que toasts error se muestran
- [ ] Verificar mensajes de error descriptivos

### Validaciones Client-Side
- [ ] Enviar formularios vacíos
- [ ] Enviar formularios con datos inválidos
- [ ] Verificar que errores se muestran bajo los campos

### Casos Límite
- [ ] Tabla vacía muestra mensaje apropiado
- [ ] Paginación con 1 página no muestra controles
- [ ] Búsqueda sin resultados muestra mensaje
- [ ] Árbol sin unidades muestra mensaje

### Permisos y Autorización
- [ ] Intentar acceder sin login redirige a /login
- [ ] Intentar operaciones sin permisos muestra error 403
- [ ] Token expirado redirige a login

---

## 7️⃣ Pruebas de Responsividad

### Desktop (1920x1080)
- [ ] Layout se ve correcto
- [ ] Tablas muestran todas las columnas
- [ ] Modales están bien centrados
- [ ] No hay scroll horizontal

### Tablet (768x1024)
- [ ] Sidebar funciona correctamente
- [ ] Tablas son scrolleables horizontalmente
- [ ] Modales se adaptan al ancho

### Móvil (375x667)
- [ ] Sidebar se oculta por defecto
- [ ] Botón hamburguesa funciona (si existe)
- [ ] Tablas son scrolleables
- [ ] Modales ocupan casi toda la pantalla
- [ ] Botones son suficientemente grandes

---

## 8️⃣ Pruebas de Rendimiento

### Tiempos de Carga
- [ ] Página inicial carga en < 2s
- [ ] Navegación entre páginas es instantánea
- [ ] Modales abren sin lag
- [ ] Tablas con muchos datos se renderizan rápido

### Optimización
- [ ] No hay re-renders innecesarios (verificar con React DevTools)
- [ ] Debounce de búsqueda funciona correctamente
- [ ] Llamadas a API no se duplican

---

## ✅ Resumen de Pruebas

### Criterios de Aceptación
- [ ] Todos los módulos (Usuarios, Unidades, Roles) funcionan correctamente
- [ ] Todos los modales abren y cierran correctamente
- [ ] Todas las operaciones CRUD funcionan
- [ ] Todas las validaciones funcionan
- [ ] Todos los mensajes de éxito/error se muestran
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings críticos en consola
- [ ] Diseño es consistente en todos los módulos
- [ ] Aplicación es responsive

### Bugs Encontrados
*Documentar aquí cualquier bug encontrado durante las pruebas*

```
1. [Descripción del bug]
   - Módulo: 
   - Severidad: Alta/Media/Baja
   - Pasos para reproducir:
   - Comportamiento esperado:
   - Comportamiento actual:

2. [Otro bug...]
```

---

## 📝 Notas de Pruebas

### Navegadores Probados
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Dispositivos Probados
- [ ] Desktop Linux
- [ ] Desktop Windows
- [ ] Tablet
- [ ] Smartphone

---

**Fecha de Pruebas:** _______________  
**Probado por:** _______________  
**Resultado General:** ⬜ APROBADO / ⬜ RECHAZADO  
**Observaciones:** _______________________________________________
