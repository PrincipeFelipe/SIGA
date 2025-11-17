# Sistema de Alertas de Tareas - Actualización

**Fecha:** 13 de noviembre de 2025  
**Versión:** 2.0

---

## 📋 Resumen de Cambios

Se ha actualizado el sistema de alertas automáticas de tareas para cumplir con los siguientes requisitos:

1. ✅ **Alertar cuando quedan MENOS de 3 días** (0, 1 o 2 días antes del vencimiento)
2. ✅ **Mantener las alertas hasta que la tarea esté finalizada** (completada o cancelada)
3. ✅ **Evitar spam** enviando máximo 1 notificación por día por tarea

---

## 🔄 Cambios Implementados

### 1. Evento `check_tareas_proximas_vencer`

**Antes:**
```sql
WHERE estado NOT IN ('completada', 'cancelada')
  AND DATEDIFF(fecha_limite, CURDATE()) BETWEEN 0 AND 3
```

**Ahora:**
```sql
WHERE estado NOT IN ('completada', 'cancelada')
  AND DATEDIFF(fecha_limite, CURDATE()) >= 0
  AND DATEDIFF(fecha_limite, CURDATE()) < 3  -- Menos de 3 días: 0, 1 o 2
```

**Impacto:**
- ✅ Ahora solo alerta cuando quedan **menos de 3 días** (0, 1 o 2 días)
- ✅ Tareas que vencen en 3 días o más **NO generan alerta**
- ✅ Se ejecuta diariamente a las **08:00 AM**

### 2. Niveles de Alerta Actualizados

| Días Restantes | Tipo | Color | Icono | Descripción |
|----------------|------|-------|-------|-------------|
| 0 días (HOY) | `error` | 🔴 Rojo | 🔴 | URGENTE - Vence HOY |
| 1 día (MAÑANA) | `error` | 🔴 Rojo | 🟠 | Vence MAÑANA |
| 2 días | `warning` | 🟡 Amarillo | ⚠️ | Vence en 2 días |
| 3+ días | - | - | - | Sin alerta |

### 3. Notificaciones Persistentes

**Comportamiento nuevo:**
- Las notificaciones se **repiten diariamente** mientras la tarea esté pendiente
- Solo se envía **1 notificación por día** para evitar spam
- Las alertas **cesan automáticamente** cuando la tarea se completa o cancela

**Verificación de duplicados:**
```sql
IF NOT EXISTS (
    SELECT 1 FROM Notificaciones 
    WHERE usuario_id = v_usuario_id 
      AND titulo LIKE CONCAT('%', v_titulo, '%')
      AND tipo IN ('warning', 'error')
      AND DATE(created_at) = CURDATE()
)
```

### 4. Evento `check_tareas_vencidas`

**Mejoras:**
- Envía alertas **diarias** para tareas vencidas no completadas
- Mensaje actualizado indicando que la alerta se repetirá hasta completar
- Verifica que no exista notificación del mismo día antes de crear una nueva

**Mensaje de notificación:**
```
URGENTE: La tarea "{título}" está vencida desde hace {N} días. 
Esta alerta se repetirá diariamente hasta que completes o canceles la tarea.
```

---

## 📊 Ejemplos de Funcionamiento

### Escenario 1: Tarea que vence en 5 días
- **Día 1-2:** ❌ Sin alerta (más de 3 días)
- **Día 3:** ❌ Sin alerta (exactamente 3 días = NO < 3)
- **Día 4:** ✅ Alerta WARNING (quedan 2 días)
- **Día 5:** ✅ Alerta ERROR (vence mañana)
- **Día 6:** ✅ Alerta ERROR (vence hoy)

### Escenario 2: Tarea vencida hace 2 días
- **Cada día:** ✅ Alerta ERROR diaria hasta completar
- **Una vez completada:** ❌ Sin más alertas

### Escenario 3: Tarea que vence hoy y se completa
- **Por la mañana (8AM):** ✅ Alerta "VENCE HOY"
- **Usuario completa la tarea:** ✅ Trigger envía notificación de éxito
- **Al día siguiente:** ❌ Sin alerta (tarea completada)

---

## 🔧 Archivos Modificados

1. **`/database/alertas-tareas.sql`** - Script principal del sistema de alertas
   - Procedimiento `crear_notificacion_tarea`
   - Trigger `after_tarea_insert`
   - Trigger `after_tarea_update`
   - Event `check_tareas_proximas_vencer` ⭐ ACTUALIZADO
   - Event `check_tareas_vencidas` ⭐ ACTUALIZADO

2. **`/database/test-tareas.sql`** - Script de pruebas actualizado
   - Comentarios actualizados con la nueva lógica
   - Ejemplos de tareas para probar todos los casos

---

## ✅ Pruebas Sugeridas

### Prueba 1: Crear tarea que vence en 2 días
```sql
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    'Prueba alerta 2 días',
    'Esta tarea debería generar alerta WARNING',
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    'alta',
    'pendiente',
    1,
    10,
    7
);
```

**Resultado esperado:**
- ✅ Notificación inmediata de asignación (trigger)
- ✅ A las 8:00 AM: Alerta WARNING "Vence en 2 días"

### Prueba 2: Crear tarea que vence HOY
```sql
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    'Prueba alerta HOY',
    'Esta tarea debería generar alerta ERROR',
    CURDATE(),
    'urgente',
    'pendiente',
    1,
    10,
    7
);
```

**Resultado esperado:**
- ✅ Notificación inmediata de asignación (trigger)
- ✅ A las 8:00 AM: Alerta ERROR "🔴 URGENTE - Vence HOY"

### Prueba 3: Tarea vencida
```sql
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    'Prueba tarea vencida',
    'Esta tarea está vencida',
    DATE_SUB(CURDATE(), INTERVAL 2 DAY),
    'urgente',
    'pendiente',
    1,
    10,
    7
);
```

**Resultado esperado:**
- ✅ Notificación inmediata de asignación (trigger)
- ✅ A las 9:00 AM: Alerta ERROR "🔴 Tarea VENCIDA"
- ✅ Cada día a las 9:00 AM: Nueva alerta hasta completar

### Prueba 4: Completar tarea con alertas
```sql
UPDATE Tareas 
SET estado = 'completada', completado_el = NOW()
WHERE id = [ID_TAREA];
```

**Resultado esperado:**
- ✅ Notificación de completación al creador (trigger)
- ✅ Al día siguiente: NO más alertas automáticas

---

## 🎯 Beneficios de la Actualización

1. ✅ **Alertas más relevantes**: Solo cuando realmente falta poco tiempo
2. ✅ **Sin spam**: Máximo 1 notificación por día por tarea
3. ✅ **Persistencia inteligente**: Las alertas continúan hasta resolver
4. ✅ **Priorización clara**: ERROR vs WARNING según urgencia
5. ✅ **Visibilidad mejorada**: Iconos y colores distintivos
6. ✅ **Limpieza automática**: Alertas cesan al completar tareas

---

## 📅 Horarios de Ejecución

| Evento | Hora | Frecuencia | Función |
|--------|------|------------|---------|
| `check_tareas_proximas_vencer` | 08:00 AM | Diaria | Detecta tareas que vencen en < 3 días |
| `check_tareas_vencidas` | 09:00 AM | Diaria | Detecta tareas vencidas no completadas |

---

## 🔍 Verificación del Sistema

```sql
-- Verificar que los eventos estén activos
SHOW EVENTS WHERE Db = 'siga_db';

-- Verificar estado del event scheduler
SHOW VARIABLES LIKE 'event_scheduler';

-- Ver próxima ejecución
SELECT 
    event_name,
    last_executed,
    interval_value,
    interval_field,
    starts,
    status
FROM information_schema.events
WHERE event_schema = 'siga_db';
```

---

## 📝 Notas Técnicas

- Los eventos se ejecutan en **zona horaria del servidor** (SYSTEM)
- Las notificaciones se crean con el procedimiento `crear_notificacion_tarea`
- El campo `tipo` de notificaciones: `info`, `warning`, `error`, `success`
- Los triggers se ejecutan **instantáneamente** al modificar tareas
- Los events se ejecutan **una vez al día** según horario configurado

---

## 🚀 Estado Actual

✅ **Sistema actualizado y operativo**  
✅ **Probado en base de datos siga_db**  
✅ **Events programados y activos**  
✅ **Triggers funcionando correctamente**

---

**Última actualización:** 13 de noviembre de 2025  
**Próxima revisión:** A demanda según feedback de usuarios
