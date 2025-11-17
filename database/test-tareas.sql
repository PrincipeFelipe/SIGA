-- ============================================================================
-- Script para crear tareas de prueba del sistema de notificaciones
-- ============================================================================
-- Fecha: 13 de noviembre de 2025
-- 
-- NUEVA LÓGICA DE ALERTAS:
-- -------------------------
-- • Alertas cuando quedan MENOS de 3 días (0, 1 o 2 días)
-- • Vence HOY o MAÑANA: tipo ERROR (🔴 crítico)
-- • Vence en 2 días: tipo WARNING (🟡 advertencia)
-- • Las alertas se repiten diariamente hasta completar la tarea
-- • Solo se envía 1 notificación por día para evitar spam
-- ============================================================================

-- Tarea 1: Vence HOY (generará alerta ERROR - crítico)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Revisar documentación urgente - VENCE HOY',
    'Revisar y validar la documentación de seguridad del proyecto. Esta tarea es crítica y vence hoy.',
    CURDATE(),
    'urgente',
    'pendiente',
    1,
    10,
    7,
    1
);

-- Tarea 2: Vence MAÑANA (generará alerta ERROR - crítico)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Preparar informe mensual - VENCE MAÑANA',
    'Preparar el informe mensual de actividades y métricas del departamento.',
    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
    'alta',
    'pendiente',
    1,
    10,
    7,
    0
);

-- Tarea 3: Vence en 2 días (generará alerta WARNING - advertencia)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Actualizar sistema de inventario - 2 días',
    'Actualizar el sistema de inventario con los nuevos equipos adquiridos.',
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    'alta',
    'pendiente',
    1,
    10,
    7,
    0
);

-- Tarea 4: Vence en 3 días (NO generará alerta aún - fuera del rango < 3 días)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Coordinar reunión de equipo - 3 días',
    'Coordinar y preparar agenda para la reunión mensual del equipo.',
    DATE_ADD(CURDATE(), INTERVAL 3 DAY),
    'media',
    'pendiente',
    1,
    10,
    7,
    0
);

-- Tarea 5: VENCIDA hace 2 días (generará alerta ERROR - se repetirá diariamente)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Tarea VENCIDA - Revisar procedimientos',
    'Esta tarea venció hace 2 días y necesita atención inmediata.',
    DATE_SUB(CURDATE(), INTERVAL 2 DAY),
    'urgente',
    'pendiente',
    1,
    10,
    7,
    1
);

-- Tarea 6: Vence en 5 días (NO generará alerta - fuera del rango < 3 días)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Organizar archivo - 5 días',
    'Organizar y digitalizar documentos del archivo del mes pasado.',
    DATE_ADD(CURDATE(), INTERVAL 5 DAY),
    'baja',
    'pendiente',
    1,
    10,
    7,
    0
);

-- Tarea 7: Para jefe.zona.norte (usuario 2) que vence en 2 días
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Supervisar operativo regional',
    'Supervisar el operativo de seguridad en la zona norte.',
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    'alta',
    'pendiente',
    1,
    2,
    2,
    1
);

-- Tarea 8: Para coord.huesca (usuario 4) VENCIDA
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id, es_241)
VALUES (
    'Completar informe trimestral - VENCIDA',
    'Esta tarea está vencida y requiere atención inmediata.',
    DATE_SUB(CURDATE(), INTERVAL 1 DAY),
    'urgente',
    'pendiente',
    1,
    4,
    4,
    0
);
