#!/bin/bash

# ============================================================================
# Script de Prueba - Sistema de Alertas v2.0
# ============================================================================
# Demuestra el nuevo comportamiento del sistema de alertas
# Fecha: 13 de noviembre de 2025
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     🧪 Prueba del Sistema de Alertas v2.0                     ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📝 Creando tareas de prueba con diferentes vencimientos..."
echo ""

mysql -u root -pklandemo siga_db << 'EOSQL' 2>/dev/null

-- Limpiar tareas de prueba anteriores
DELETE FROM Tareas WHERE titulo LIKE '%[TEST]%';

-- Tarea 1: Vence en 5 días (NO debería generar alerta)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    '[TEST] Tarea vence en 5 días',
    'Esta tarea NO debería generar alerta automática',
    DATE_ADD(CURDATE(), INTERVAL 5 DAY),
    'media',
    'pendiente',
    1, 10, 7
);

-- Tarea 2: Vence en 3 días (NO debería generar alerta - 3 NO es < 3)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    '[TEST] Tarea vence en 3 días',
    'Esta tarea NO debería generar alerta (3 NO es menor que 3)',
    DATE_ADD(CURDATE(), INTERVAL 3 DAY),
    'media',
    'pendiente',
    1, 10, 7
);

-- Tarea 3: Vence en 2 días (SÍ debería generar alerta WARNING)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    '[TEST] Tarea vence en 2 días',
    'Esta tarea SÍ debería generar alerta WARNING',
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    'alta',
    'pendiente',
    1, 10, 7
);

-- Tarea 4: Vence MAÑANA (SÍ debería generar alerta ERROR)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    '[TEST] Tarea vence MAÑANA',
    'Esta tarea SÍ debería generar alerta ERROR',
    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
    'alta',
    'pendiente',
    1, 10, 7
);

-- Tarea 5: Vence HOY (SÍ debería generar alerta ERROR - URGENTE)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    '[TEST] Tarea vence HOY',
    'Esta tarea SÍ debería generar alerta ERROR - URGENTE',
    CURDATE(),
    'urgente',
    'pendiente',
    1, 10, 7
);

-- Tarea 6: VENCIDA hace 2 días (SÍ debería generar alerta ERROR diaria)
INSERT INTO Tareas (titulo, descripcion, fecha_limite, prioridad, estado, creado_por, asignado_a, unidad_id)
VALUES (
    '[TEST] Tarea VENCIDA',
    'Esta tarea está vencida y debería alertar diariamente',
    DATE_SUB(CURDATE(), INTERVAL 2 DAY),
    'urgente',
    'pendiente',
    1, 10, 7
);

SELECT '✅ Tareas de prueba creadas' as resultado;

EOSQL

if [ $? -eq 0 ]; then
    echo "✅ Tareas de prueba creadas exitosamente"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Resumen de tareas creadas:"
    echo ""
    
    mysql -u root -pklandemo siga_db << 'EOSQL' 2>/dev/null
SELECT 
    titulo as 'Tarea',
    fecha_limite as 'Vence',
    DATEDIFF(fecha_limite, CURDATE()) as 'Días',
    CASE 
        WHEN DATEDIFF(fecha_limite, CURDATE()) < 0 THEN '✅ ERROR (vencida)'
        WHEN DATEDIFF(fecha_limite, CURDATE()) = 0 THEN '✅ ERROR (hoy)'
        WHEN DATEDIFF(fecha_limite, CURDATE()) = 1 THEN '✅ ERROR (mañana)'
        WHEN DATEDIFF(fecha_limite, CURDATE()) = 2 THEN '✅ WARNING'
        WHEN DATEDIFF(fecha_limite, CURDATE()) = 3 THEN '❌ Sin alerta (3 = 3)'
        ELSE '❌ Sin alerta (> 3)'
    END as 'Alerta Esperada'
FROM Tareas
WHERE titulo LIKE '%[TEST]%'
ORDER BY fecha_limite ASC;
EOSQL

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔔 Notificaciones generadas por triggers (asignación):"
    echo ""
    
    mysql -u root -pklandemo siga_db << 'EOSQL' 2>/dev/null
SELECT 
    COUNT(*) as 'Total Notificaciones',
    tipo as 'Tipo'
FROM Notificaciones
WHERE titulo LIKE '%[TEST]%'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
GROUP BY tipo;
EOSQL

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⏰ Las alertas automáticas se ejecutarán:"
    echo "   • A las 08:00 AM: check_tareas_proximas_vencer"
    echo "   • A las 09:00 AM: check_tareas_vencidas"
    echo ""
    echo "📍 Para probar inmediatamente, puedes ejecutar manualmente:"
    echo ""
    echo "   mysql -u root -pklandemo siga_db << 'EOF'"
    echo "   CALL check_tareas_proximas_vencer();"
    echo "   CALL check_tareas_vencidas();"
    echo "   EOF"
    echo ""
    echo "💡 O simplemente espera hasta mañana a las 8:00 y 9:00 AM"
    echo ""
    echo "🌐 Ver en el frontend:"
    echo "   1. http://localhost:3000"
    echo "   2. Login: R84101K / klandemo"
    echo "   3. Click en la campana 🔔"
    echo ""
else
    echo "❌ Error al crear las tareas de prueba"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Prueba completada. Las tareas están listas para demostrar"
echo "   el nuevo comportamiento del sistema de alertas v2.0"
echo ""
