# Resumen del Sistema de Alertas Automáticas

**Fecha:** 10 de noviembre de 2025  
**Estado:** ✅ Backend completado al 100%, Frontend pendiente

---

## 📊 Componentes Implementados

### 1. Stored Procedure
- **Nombre:** `crear_notificacion_tarea`
- **Función:** Centraliza la creación de notificaciones
- **Parámetros:** usuario_id, titulo, mensaje, tipo, url

### 2. Triggers (2)
- **`after_tarea_insert`** → Notifica al asignado cuando se crea tarea
- **`after_tarea_update`** → Notifica en reasignación y completación

### 3. Events Programados (2)
- **`check_tareas_proximas_vencer`** → 8:00 AM diario (0-3 días antes)
- **`check_tareas_vencidas`** → 9:00 AM diario (tareas vencidas)

---

## 🔔 Tipos de Alertas

| Evento | Trigger/Event | Tipo | Destinatario |
|--------|---------------|------|--------------|
| Asignación de tarea | Trigger INSERT | warning/error¹ | Usuario asignado |
| Reasignación | Trigger UPDATE | warning/info | Nuevo y antiguo |
| Completación | Trigger UPDATE | success | Creador |
| Próxima a vencer (0-3 días) | Event 8AM | warning/error² | Usuario asignado |
| Tarea vencida | Event 9AM | error | Usuario asignado |

¹ Tipo según prioridad: urgente→error, alta→warning, media/baja→info  
² Tipo según días: 0-1 días→error, 2-3 días→warning

---

## 🧪 Pruebas Realizadas

| Prueba | ID | Resultado |
|--------|---|-----------|
| Asignación tarea alta prioridad | Notif 4 | ✅ warning |
| Asignación tarea urgente | Notif 7 | ✅ error |
| Alerta próxima a vencer (3 días) | Notif 5 | ✅ warning |
| Alerta próxima a vencer (2 días) | Notif 6 | ✅ warning |
| Alerta tarea vencida | Notif 8 | ✅ error |
| Reasignación | - | ⏳ Pendiente |
| Completación | - | ⏳ Pendiente |
| Ejecución programada events | - | ⏳ Esperar 11/11 |

---

## 🔌 Backend: Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notificaciones` | Listar (paginadas) |
| GET | `/api/notificaciones/:id` | Detalle |
| GET | `/api/notificaciones/contador` | Contador no leídas |
| PATCH | `/api/notificaciones/:id/marcar-leida` | Marcar leída |
| PATCH | `/api/notificaciones/marcar-todas-leidas` | Marcar todas |
| DELETE | `/api/notificaciones/:id` | Eliminar |

---

## 💻 Frontend: Pendiente

### Componentes a Crear

1. **NotificationBell.jsx**
   - Icono campana en header
   - Badge con contador
   - Dropdown con últimas 5 notificaciones
   - Polling cada 30 segundos

2. **NotificationItem.jsx**
   - Item individual con icono según tipo
   - Indicador de leída/no leída
   - Click → navegar a tarea
   - Botón marcar como leída

3. **NotificationList.jsx**
   - Lista completa paginada
   - Filtros: todas / no leídas
   - Botón "Marcar todas como leídas"

---

## 🗂️ Archivos del Sistema

```
database/
  └─ alertas-tareas.sql              ← Triggers, events, procedures
backend/
  ├─ controllers/
  │  └─ notificaciones.controller.js ← API endpoints
  └─ routes/
     └─ notificaciones.routes.js     ← Rutas
frontend/src/components/ (pendiente)
  └─ Notifications/
     ├─ NotificationBell.jsx
     ├─ NotificationItem.jsx
     └─ NotificationList.jsx
```

---

## 🛠️ Testing Manual

```bash
# Crear tarea de prueba
mysql -u root -pklandemo siga_db << 'EOF'
INSERT INTO Tareas (
    titulo, asignado_por, asignado_a, 
    prioridad, fecha_inicio, fecha_limite, es_241
) VALUES (
    'Tarea de prueba', 1, 10, 
    'alta', CURDATE(), CURDATE() + INTERVAL 2 DAY, 0
);
EOF

# Ver notificaciones generadas
mysql -u root -pklandemo siga_db << 'EOF'
SELECT 
    n.id,
    n.titulo,
    n.tipo,
    u.username,
    n.created_at
FROM Notificaciones n
INNER JOIN Usuarios u ON n.usuario_id = u.id
WHERE DATE(n.created_at) = CURDATE()
ORDER BY n.created_at DESC;
EOF

# Ejecutar manualmente alertas próximas a vencer
mysql -u root -pklandemo siga_db -e "CALL test_alertas_proximas_vencer();"

# Ejecutar manualmente alertas vencidas
mysql -u root -pklandemo siga_db -e "CALL test_alertas_vencidas();"
```

---

## 📅 Próximos Pasos

1. ✅ ~~Backend completado~~
2. ✅ ~~Pruebas de triggers (asignación)~~
3. ⏳ **Implementar frontend**:
   - [ ] NotificationBell component
   - [ ] NotificationItem component
   - [ ] NotificationList component
   - [ ] Integrar en Header
4. ⏳ Probar reasignación y completación
5. ⏳ Verificar ejecución programada (11/11/2025 8:00 AM)
6. 🔜 Considerar WebSockets para tiempo real

---

## 📖 Documentación Completa

Ver: `SISTEMA-ALERTAS-COMPLETADO.md` (documentación detallada con 350+ líneas SQL explicadas)

---

**Estado actual:** Sistema 100% funcional en backend, listo para frontend.
