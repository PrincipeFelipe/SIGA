#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   Creando Tareas de Prueba para Notificaciones            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Ejecutar el script SQL
mysql -u root -pklandemo siga_db < /home/siga/Proyectos/SIGA/database/test-tareas.sql

if [ $? -eq 0 ]; then
    echo "✅ Tareas creadas exitosamente"
    echo ""
    echo "📊 Verificando tareas creadas..."
    echo ""
    
    mysql -u root -pklandemo siga_db << 'EOSQL'
SELECT 
    CONCAT('ID: ', id) as 'Tarea',
    titulo as 'Título',
    fecha_limite as 'Vence',
    prioridad as 'Prioridad',
    CASE 
        WHEN fecha_limite < CURDATE() THEN '🔴 VENCIDA'
        WHEN fecha_limite = CURDATE() THEN '🔴 HOY'
        WHEN DATEDIFF(fecha_limite, CURDATE()) = 1 THEN '🟠 MAÑANA'
        WHEN DATEDIFF(fecha_limite, CURDATE()) BETWEEN 2 AND 3 THEN '🟡 2-3 DÍAS'
        ELSE '🟢 NORMAL'
    END as 'Estado'
FROM Tareas
WHERE asignado_a = 10
AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
ORDER BY fecha_limite ASC;
EOSQL

    echo ""
    echo "🔔 Verificando notificaciones generadas..."
    echo ""
    
    mysql -u root -pklandemo siga_db << 'EOSQL'
SELECT 
    COUNT(*) as 'Total Notificaciones',
    SUM(CASE WHEN tipo = 'error' THEN 1 ELSE 0 END) as 'Error',
    SUM(CASE WHEN tipo = 'warning' THEN 1 ELSE 0 END) as 'Warning',
    SUM(CASE WHEN tipo = 'info' THEN 1 ELSE 0 END) as 'Info'
FROM Notificaciones
WHERE usuario_id = 10
AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE);
EOSQL

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✨ Las tareas se han creado exitosamente."
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Ir a http://localhost:3000"
    echo "   2. Login como R84101K / klandemo"
    echo "   3. Verificar la campana 🔔 en el Header"
    echo "   4. Click en las notificaciones para navegarlas"
    echo ""
else
    echo "❌ Error al crear las tareas"
    exit 1
fi
