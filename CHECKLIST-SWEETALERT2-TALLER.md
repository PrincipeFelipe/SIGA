# ✅ Checklist de Pruebas - SweetAlert2 Módulo Taller

**Fecha:** 19 de noviembre de 2025  
**Usuario:** Admin  
**URL:** http://localhost:3000

---

## 🎯 Acceso al Módulo

### 1. Login
- [ ] Navegar a http://localhost:3000
- [ ] Login como `admin / Admin123!`
- [ ] Verificar que el sistema carga correctamente

### 2. Navegación al Módulo Taller
- [ ] En el sidebar, buscar el menú **"Taller"**
- [ ] Click en "Taller" → debe expandirse mostrando 3 sub-items:
  - [ ] Vehículos
  - [ ] Tipos de Cita
  - [ ] Citas

---

## 🚗 Vehículos (VehiclesListPage)

### Eliminar Vehículo (SweetAlert2)
- [ ] Click en **"Vehículos"**
- [ ] Buscar un vehículo existente
- [ ] Click en botón **"Eliminar"** (icono basura roja)
- [ ] **Verificar:** Aparece diálogo SweetAlert2 con:
  - ✅ Título: "¿Eliminar vehículo?"
  - ✅ Texto: "¿Estás seguro de que deseas eliminar el vehículo **MATRICULA**?"
  - ✅ Subtexto: Marca y modelo en gris
  - ✅ Icono: ⚠️ warning (amarillo)
  - ✅ Botón "Sí, eliminar" (rojo #C8102E)
  - ✅ Botón "Cancelar" (gris #6B7280)
- [ ] Click en **"Cancelar"** → Modal se cierra
- [ ] Click en **"Eliminar"** nuevamente
- [ ] Click en **"Sí, eliminar"** → Verificar:
  - ✅ Modal se cierra
  - ✅ Toast verde aparece: "Vehículo eliminado correctamente"
  - ✅ Vehículo desaparece de la lista

### Crear Vehículo (Toast)
- [ ] Click en botón **"Nuevo Vehículo"**
- [ ] Rellenar formulario:
  - Unidad: Seleccionar cualquiera
  - Matrícula: TEST-9999
  - Marca: Seat
  - Modelo: León
  - Tipo: Turismo
  - Año: 2020
- [ ] Click en **"Guardar"**
- [ ] **Verificar:**
  - ✅ Modal se cierra
  - ✅ Toast verde aparece: "Vehículo creado correctamente"
  - ✅ Vehículo aparece en la lista

### Editar Vehículo (Toast)
- [ ] Click en botón **"Editar"** (icono lápiz azul)
- [ ] Cambiar el campo "Modelo" a "León FR"
- [ ] Click en **"Guardar"**
- [ ] **Verificar:**
  - ✅ Toast verde aparece: "Vehículo actualizado correctamente"
  - ✅ Cambio se refleja en la lista

---

## 🔧 Tipos de Cita (AppointmentTypesListPage)

### Eliminar Tipo de Cita (SweetAlert2)
- [ ] Click en **"Tipos de Cita"** en el sidebar
- [ ] Buscar un tipo de cita existente
- [ ] Click en botón **"Eliminar"** (icono basura roja)
- [ ] **Verificar:** Aparece diálogo SweetAlert2 con:
  - ✅ Título: "¿Eliminar tipo de cita?"
  - ✅ Texto: "¿Estás seguro de que deseas eliminar el tipo de cita **NOMBRE**?"
  - ✅ Subtexto: "Duración: X minutos" en gris
  - ✅ Icono: ⚠️ warning (amarillo)
  - ✅ Botón "Sí, eliminar" (rojo #C8102E)
  - ✅ Botón "Cancelar" (gris)
- [ ] Click en **"Cancelar"** → Modal se cierra
- [ ] Click en **"Eliminar"** nuevamente
- [ ] Click en **"Sí, eliminar"** → Verificar:
  - ✅ Toast verde: "Tipo de cita eliminado correctamente"
  - ✅ Tipo desaparece de la lista

### Crear Tipo de Cita (Toast)
- [ ] Click en botón **"Nuevo Tipo de Cita"**
- [ ] Rellenar:
  - Nombre: Test SweetAlert2
  - Código: TSW
  - Duración: 60 minutos
  - Descripción: Prueba de SweetAlert2
  - Color: Azul (#3B82F6)
- [ ] Click en **"Guardar"**
- [ ] **Verificar:**
  - ✅ Toast verde: "Tipo de cita creado correctamente"
  - ✅ Tipo aparece en la lista con el color seleccionado

---

## 📅 Citas (AppointmentsListPage) ⭐ **PRUEBAS MÁS COMPLEJAS**

### Crear Cita (Alerta de validación + Toast)
- [ ] Click en **"Citas"** en el sidebar
- [ ] Click en botón **"Nueva Cita"**
- [ ] Rellenar Paso 1:
  - Vehículo: Seleccionar cualquiera
  - Servicio: "Revisión General (120 min)"
  - Fecha: 2025-11-25
- [ ] Click en **"Siguiente"**
- [ ] **NO seleccionar ningún horario**
- [ ] Click en **"Crear Cita"**
- [ ] **Verificar:** Aparece diálogo SweetAlert2 con:
  - ✅ Título: "Horario requerido"
  - ✅ Texto: "Por favor selecciona un horario disponible"
  - ✅ Icono: ⚠️ warning (amarillo)
  - ✅ Botón "OK" (verde #004E2E)
- [ ] Click en **"OK"** → Modal se cierra
- [ ] Seleccionar un horario disponible (ej: 10:00)
- [ ] Click en **"Crear Cita"**
- [ ] **Verificar:**
  - ✅ Toast verde: "Cita creada correctamente"
  - ✅ Cita aparece en la lista con estado "Pendiente"

### Confirmar Cita (SweetAlert2)
- [ ] Buscar una cita con estado **"Pendiente"**
- [ ] Click en botón **"Confirmar"** (icono check verde)
- [ ] **Verificar:** Aparece diálogo SweetAlert2 con:
  - ✅ Título: "¿Confirmar cita?"
  - ✅ Texto: "¿Deseas confirmar la cita para el vehículo **MATRICULA**?"
  - ✅ Subtexto: Tipo de cita + fecha/hora en gris
  - ✅ Icono: ❓ question (azul)
  - ✅ Botón "Sí, confirmar" (verde #004E2E)
  - ✅ Botón "Cancelar" (gris)
- [ ] Click en **"Cancelar"** → Modal se cierra
- [ ] Click en **"Confirmar"** nuevamente
- [ ] Click en **"Sí, confirmar"** → Verificar:
  - ✅ Toast verde: "Cita confirmada correctamente"
  - ✅ Estado cambia a "Confirmada"

### Completar Cita (Formulario SweetAlert2)
- [ ] Buscar una cita con estado **"Confirmada"**
- [ ] Click en botón **"Completar"** (icono check)
- [ ] **Verificar:** Aparece diálogo SweetAlert2 con:
  - ✅ Título: "Completar cita"
  - ✅ Texto: "Vehículo: **MATRICULA**"
  - ✅ Campo textarea: "Diagnóstico (opcional)"
  - ✅ Campo textarea: "Trabajos realizados (opcional)"
  - ✅ Icono: ℹ️ info (azul)
  - ✅ Botón "Completar" (verde #004E2E)
  - ✅ Botón "Cancelar" (gris)
- [ ] Escribir en "Diagnóstico": "Motor en buen estado"
- [ ] Escribir en "Trabajos realizados": "Cambio de aceite y filtro"
- [ ] Click en **"Completar"** → Verificar:
  - ✅ Toast verde: "Cita completada correctamente"
  - ✅ Estado cambia a "Completada"

### Cancelar Cita (Formulario con validación SweetAlert2)
- [ ] Buscar una cita con estado **"Pendiente"** o **"Confirmada"**
- [ ] Click en botón **"Cancelar"** (icono X roja)
- [ ] **Verificar:** Aparece diálogo SweetAlert2 con:
  - ✅ Título: "Cancelar cita"
  - ✅ Texto: "Vehículo: **MATRICULA**"
  - ✅ Campo textarea: "Motivo de cancelación *" (requerido)
  - ✅ Icono: ⚠️ warning (amarillo)
  - ✅ Botón "Cancelar cita" (rojo #C8102E)
  - ✅ Botón "Volver" (gris)
- [ ] **NO escribir nada** y click en **"Cancelar cita"**
- [ ] **Verificar:**
  - ✅ Aparece mensaje de validación: "Debes indicar el motivo de cancelación"
  - ✅ Modal NO se cierra
- [ ] Escribir en "Motivo": "Cliente no disponible"
- [ ] Click en **"Cancelar cita"** → Verificar:
  - ✅ Toast verde: "Cita cancelada correctamente"
  - ✅ Estado cambia a "Cancelada"

---

## 🎨 Verificación Visual

### Colores Corporativos
- [ ] **Verde (#004E2E)** en botones de confirmar/completar
- [ ] **Rojo (#C8102E)** en botones de eliminar/cancelar
- [ ] **Gris (#6B7280)** en botones secundarios

### Iconos Contextuales
- [ ] ⚠️ **warning** en eliminaciones y cancelaciones
- [ ] ❓ **question** en confirmaciones
- [ ] ℹ️ **info** en formularios
- [ ] ✅ **success** en toast de éxito
- [ ] ❌ **error** en toast de error

### Animaciones
- [ ] Modales aparecen con animación suave
- [ ] Toast aparece desde arriba derecha
- [ ] Toast desaparece automáticamente en 3-4 segundos

---

## 🐛 Bugs Conocidos (Reportar si se encuentran)

- [ ] Diálogo no aparece al eliminar
- [ ] Toast no aparece después de operación exitosa
- [ ] Botones con colores incorrectos
- [ ] Validación no funciona en cancelar cita
- [ ] Campos del formulario no se capturan correctamente

---

## 📊 Resultado Final

### Pruebas Exitosas: __ / 35
### Errores Encontrados: __

---

## 📝 Notas del Usuario

_(Espacio para comentarios adicionales)_

---

**Probado por:** _______________  
**Fecha:** 19/11/2025  
**Hora:** _______  
**Navegador:** Chrome / Firefox / Safari / Edge

---

## ✅ Aprobación

- [ ] **APROBADO** - Todas las pruebas pasaron
- [ ] **CON OBSERVACIONES** - Hay bugs menores
- [ ] **RECHAZADO** - Bugs críticos encontrados

**Firma:** _______________
