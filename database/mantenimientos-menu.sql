-- ============================================================================
-- AÑADIR MANTENIMIENTOS AL MENÚ DINÁMICO DEL TALLER
-- ============================================================================

USE siga_db;

-- Obtener el ID de la aplicación Taller
SET @taller_app_id = (SELECT id FROM Aplicaciones WHERE nombre = 'Taller');

-- Obtener IDs de permisos
SET @permiso_maintenance_view = (SELECT id FROM Permisos WHERE accion = 'maintenance:view');
SET @permiso_maintenance_types_view = (SELECT id FROM Permisos WHERE accion = 'maintenance_types:view');

-- Insertar nuevos sub-menús del módulo Taller
INSERT INTO Aplicaciones (nombre, descripcion, icono, ruta, orden, activo, permiso_requerido_id, parent_id)
VALUES 
('Mantenimientos', 'Historial de mantenimientos preventivos', 'tool', '/taller/mantenimientos', 4, 1, @permiso_maintenance_view, @taller_app_id),
('Tipos Mantenimiento', 'Configuración de tipos de mantenimiento', 'settings', '/taller/tipos-mantenimiento', 5, 1, @permiso_maintenance_types_view, @taller_app_id),
('Pendientes', 'Mantenimientos próximos y vencidos', 'alert-circle', '/taller/pendientes', 6, 1, @permiso_maintenance_view, @taller_app_id)
ON DUPLICATE KEY UPDATE 
    descripcion = VALUES(descripcion),
    icono = VALUES(icono),
    ruta = VALUES(ruta),
    orden = VALUES(orden),
    activo = VALUES(activo),
    permiso_requerido_id = VALUES(permiso_requerido_id),
    parent_id = VALUES(parent_id);

-- Verificar la inserción
SELECT 
    a.id,
    a.nombre,
    a.ruta,
    p2.accion as permiso_requerido,
    CASE WHEN a.parent_id IS NULL THEN 'Menú Principal' ELSE CONCAT('Sub-menú de ', p.nombre) END as nivel
FROM Aplicaciones a
LEFT JOIN Aplicaciones p ON a.parent_id = p.id
LEFT JOIN Permisos p2 ON a.permiso_requerido_id = p2.id
WHERE a.nombre IN ('Taller', 'Vehículos', 'Tipos de Cita', 'Citas', 'Mantenimientos', 'Tipos Mantenimiento', 'Pendientes')
ORDER BY a.parent_id IS NULL DESC, a.orden;

SELECT '✅ Opciones de mantenimiento añadidas al menú del Taller' as Resultado;
