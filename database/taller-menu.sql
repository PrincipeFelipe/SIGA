-- ============================================================================
-- AÑADIR MÓDULO DE TALLER AL MENÚ DINÁMICO
-- ============================================================================

USE siga_db;

-- Insertar aplicación principal "Taller"
INSERT INTO Aplicaciones (nombre, descripcion, icono, ruta, orden, activo, requiere_permiso)
VALUES 
('Taller', 'Gestión de vehículos y citas de mantenimiento', 'truck', '/taller', 40, 1, 'vehicles:view')
ON DUPLICATE KEY UPDATE 
    descripcion = VALUES(descripcion),
    icono = VALUES(icono),
    ruta = VALUES(ruta),
    orden = VALUES(orden),
    activo = VALUES(activo),
    requiere_permiso = VALUES(requiere_permiso);

-- Obtener el ID de la aplicación Taller
SET @taller_app_id = (SELECT id FROM Aplicaciones WHERE nombre = 'Taller');

-- Insertar sub-menús del módulo Taller
INSERT INTO Aplicaciones (nombre, descripcion, icono, ruta, orden, activo, requiere_permiso, parent_id)
VALUES 
('Vehículos', 'Gestión del parque móvil', 'truck', '/taller/vehiculos', 1, 1, 'vehicles:view', @taller_app_id),
('Tipos de Cita', 'Gestión de servicios del taller', 'settings', '/taller/tipos-cita', 2, 1, 'appointment_types:view', @taller_app_id),
('Citas', 'Gestión de citas de mantenimiento', 'calendar', '/taller/citas', 3, 1, 'appointments:view', @taller_app_id)
ON DUPLICATE KEY UPDATE 
    descripcion = VALUES(descripcion),
    icono = VALUES(icono),
    ruta = VALUES(ruta),
    orden = VALUES(orden),
    activo = VALUES(activo),
    requiere_permiso = VALUES(requiere_permiso),
    parent_id = VALUES(parent_id);

-- Verificar la inserción
SELECT 
    a.id,
    a.nombre,
    a.ruta,
    a.requiere_permiso,
    CASE WHEN a.parent_id IS NULL THEN 'Menú Principal' ELSE CONCAT('Sub-menú de ', p.nombre) END as nivel
FROM Aplicaciones a
LEFT JOIN Aplicaciones p ON a.parent_id = p.id
WHERE a.nombre IN ('Taller', 'Vehículos', 'Tipos de Cita', 'Citas')
ORDER BY a.parent_id IS NULL DESC, a.orden;

SELECT '✅ Módulo de Taller añadido al menú dinámico' as Resultado;

