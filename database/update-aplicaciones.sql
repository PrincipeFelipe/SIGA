-- ============================================================================
-- ACTUALIZACIÓN DE APLICACIONES - Menú Dinámico
-- ============================================================================
-- Script para actualizar las rutas y permisos de las aplicaciones del sidebar
-- ============================================================================

-- Limpiar tabla de aplicaciones
TRUNCATE TABLE Aplicaciones;

-- Insertar aplicaciones con rutas correctas
INSERT INTO Aplicaciones (nombre, descripcion, ruta, icono, permiso_requerido_id, orden, activo) VALUES
-- Dashboard - accesible para todos los usuarios autenticados (sin permiso requerido)
('Dashboard', 'Panel principal del sistema', '/', 'icon-home', NULL, 1, TRUE),

-- Gestión de Usuarios
('Usuarios', 'Gestionar usuarios del sistema', '/usuarios', 'icon-users', 
    (SELECT id FROM Permisos WHERE accion = 'users:view' LIMIT 1), 2, TRUE),

-- Gestión de Unidades
('Unidades', 'Gestionar estructura organizacional', '/unidades', 'icon-sitemap', 
    (SELECT id FROM Permisos WHERE accion = 'units:view' LIMIT 1), 3, TRUE),

-- Roles y Permisos
('Roles', 'Gestionar roles y permisos', '/roles', 'icon-shield', 
    (SELECT id FROM Permisos WHERE accion = 'roles:view' LIMIT 1), 4, TRUE),

-- Logs de Auditoría
('Logs', 'Historial de acciones del sistema', '/logs', 'icon-history', 
    (SELECT id FROM Permisos WHERE accion = 'logs:view' LIMIT 1), 5, TRUE);

-- Verificar inserción
SELECT 
    a.id,
    a.nombre,
    a.ruta,
    a.icono,
    p.accion as permiso_requerido,
    a.orden,
    a.activo
FROM Aplicaciones a
LEFT JOIN Permisos p ON a.permiso_requerido_id = p.id
ORDER BY a.orden;
