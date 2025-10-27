-- ============================================================================
-- DATOS DE PRUEBA (SEED) - PLATAFORMA INTERNA DE GESTIÓN
-- ============================================================================
-- Este script crea datos de ejemplo para testing y desarrollo
-- Incluye: estructura de unidades, usuario admin, usuarios de prueba
-- ============================================================================

USE siga_db;

-- ============================================================================
-- 1. ESTRUCTURA DE UNIDADES (Árbol Jerárquico)
-- ============================================================================
-- Estructura: 2 Zonas -> 4 Comandancias -> 8 Compañías -> 16 Puestos
-- ============================================================================

-- NIVEL 1: ZONAS (Raíz del árbol)
INSERT INTO Unidades (nombre, tipo_unidad, codigo_unidad, descripcion) VALUES
('Zona Centro', 'Zona', 'Z01', 'Zona geográfica del centro peninsular'),
('Zona Norte', 'Zona', 'Z02', 'Zona geográfica del norte peninsular')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- NIVEL 2: COMANDANCIAS (Hijos de Zonas)
INSERT INTO Unidades (nombre, tipo_unidad, codigo_unidad, parent_id, descripcion) VALUES
-- Comandancias de Zona Centro (Z01)
('Comandancia de Madrid', 'Comandancia', 'Z01-C01', 
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01') AS tmp), 
    'Comandancia principal de Madrid'),
('Comandancia de Toledo', 'Comandancia', 'Z01-C02', 
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01') AS tmp), 
    'Comandancia de la provincia de Toledo'),

-- Comandancias de Zona Norte (Z02)
('Comandancia de Bilbao', 'Comandancia', 'Z02-C01', 
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02') AS tmp), 
    'Comandancia de Vizcaya'),
('Comandancia de San Sebastián', 'Comandancia', 'Z02-C02', 
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02') AS tmp), 
    'Comandancia de Guipúzcoa')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- NIVEL 3: COMPAÑÍAS (Hijos de Comandancias)
INSERT INTO Unidades (nombre, tipo_unidad, codigo_unidad, parent_id, descripcion) VALUES
-- Compañías de Comandancia Madrid (Z01-C01)
('Compañía de Seguridad Ciudadana - Madrid Centro', 'Compañia', 'Z01-C01-CP01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01') AS tmp),
    'Compañía encargada de seguridad ciudadana en el centro de Madrid'),
('Compañía de Tráfico - Madrid', 'Compañia', 'Z01-C01-CP02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01') AS tmp),
    'Compañía especializada en tráfico y seguridad vial'),

-- Compañías de Comandancia Toledo (Z01-C02)
('Compañía de Seguridad Ciudadana - Toledo', 'Compañia', 'Z01-C02-CP01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02') AS tmp),
    'Compañía de seguridad ciudadana en Toledo capital'),
('Compañía de Investigación - Toledo', 'Compañia', 'Z01-C02-CP02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02') AS tmp),
    'Compañía especializada en investigación criminal'),

-- Compañías de Comandancia Bilbao (Z02-C01)
('Compañía de Seguridad Ciudadana - Bilbao', 'Compañia', 'Z02-C01-CP01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C01') AS tmp),
    'Compañía de seguridad en Bilbao'),
('Compañía de Tráfico - Bilbao', 'Compañia', 'Z02-C01-CP02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C01') AS tmp),
    'Compañía de tráfico en carreteras vizcaínas'),

-- Compañías de Comandancia San Sebastián (Z02-C02)
('Compañía de Seguridad Ciudadana - San Sebastián', 'Compañia', 'Z02-C02-CP01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C02') AS tmp),
    'Compañía de seguridad en San Sebastián'),
('Compañía de Montaña - San Sebastián', 'Compañia', 'Z02-C02-CP02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C02') AS tmp),
    'Compañía especializada en operaciones de montaña')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- NIVEL 4: PUESTOS (Hijos de Compañías)
INSERT INTO Unidades (nombre, tipo_unidad, codigo_unidad, parent_id, descripcion) VALUES
-- Puestos de Compañía Madrid Centro (Z01-C01-CP01)
('Puesto de Sol', 'Puesto', 'Z01-C01-CP01-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01') AS tmp),
    'Puesto ubicado en Puerta del Sol'),
('Puesto de Retiro', 'Puesto', 'Z01-C01-CP01-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01') AS tmp),
    'Puesto en el Parque del Retiro'),

-- Puestos de Compañía Tráfico Madrid (Z01-C01-CP02)
('Puesto de A-1 (Norte)', 'Puesto', 'Z01-C01-CP02-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP02') AS tmp),
    'Puesto de control en Autovía del Norte'),
('Puesto de M-30 (Este)', 'Puesto', 'Z01-C01-CP02-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP02') AS tmp),
    'Puesto de control en M-30 Este'),

-- Puestos de Compañía Toledo (Z01-C02-CP01)
('Puesto de Toledo Centro', 'Puesto', 'Z01-C02-CP01-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02-CP01') AS tmp),
    'Puesto en el centro histórico de Toledo'),
('Puesto de Talavera', 'Puesto', 'Z01-C02-CP01-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02-CP01') AS tmp),
    'Puesto en Talavera de la Reina'),

-- Puestos de Compañía Investigación Toledo (Z01-C02-CP02)
('Puesto de Investigación - Toledo Capital', 'Puesto', 'Z01-C02-CP02-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02-CP02') AS tmp),
    'Unidad de investigación en Toledo capital'),
('Puesto de Investigación - Illescas', 'Puesto', 'Z01-C02-CP02-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02-CP02') AS tmp),
    'Unidad de investigación en Illescas'),

-- Puestos de Compañía Bilbao (Z02-C01-CP01)
('Puesto de Bilbao Centro', 'Puesto', 'Z02-C01-CP01-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C01-CP01') AS tmp),
    'Puesto en el centro de Bilbao'),
('Puesto de Barakaldo', 'Puesto', 'Z02-C01-CP01-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C01-CP01') AS tmp),
    'Puesto en Barakaldo'),

-- Puestos de Compañía Tráfico Bilbao (Z02-C01-CP02)
('Puesto de A-8 (Bilbao-Santander)', 'Puesto', 'Z02-C01-CP02-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C01-CP02') AS tmp),
    'Puesto de control en A-8'),
('Puesto de AP-68 (Bilbao-Zaragoza)', 'Puesto', 'Z02-C01-CP02-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C01-CP02') AS tmp),
    'Puesto de control en AP-68'),

-- Puestos de Compañía San Sebastián (Z02-C02-CP01)
('Puesto de San Sebastián Centro', 'Puesto', 'Z02-C02-CP01-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C02-CP01') AS tmp),
    'Puesto en el centro de San Sebastián'),
('Puesto de Irún', 'Puesto', 'Z02-C02-CP01-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C02-CP01') AS tmp),
    'Puesto fronterizo en Irún'),

-- Puestos de Compañía Montaña San Sebastián (Z02-C02-CP02)
('Puesto de Montaña - Aizkorri', 'Puesto', 'Z02-C02-CP02-P01',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C02-CP02') AS tmp),
    'Puesto de montaña en Aizkorri'),
('Puesto de Montaña - Aiako Harria', 'Puesto', 'Z02-C02-CP02-P02',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02-C02-CP02') AS tmp),
    'Puesto de montaña en Aiako Harria')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ============================================================================
-- 2. USUARIOS DE PRUEBA
-- ============================================================================
-- Contraseña para todos: "Password123!" (hasheada con bcrypt, 10 rounds)
-- Hash: $2b$10$YQ7JZ1JZ5X5Q5Q5Q5Q5Q5eFq9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q
-- ============================================================================

-- Usuario Super Admin (acceso total desde raíz)
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('admin', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'Administrador del Sistema', 'admin@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Jefe de Zona Centro (gestiona toda la Zona Centro)
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('jefe.zona.centro', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'María García López', 'maria.garcia@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Jefe de Comandancia Madrid (gestiona Comandancia Madrid y sus descendientes)
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('jefe.cmd.madrid', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'Carlos Rodríguez Martín', 'carlos.rodriguez@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Jefe de Compañía Madrid Centro (gestiona su compañía y puestos)
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('jefe.cmp.madrid.centro', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'Ana Martínez Fernández', 'ana.martinez@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Agente en Puesto Sol (usuario básico)
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('agente.sol', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'Luis Sánchez García', 'luis.sanchez@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01-P01') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Agente en Puesto Retiro (usuario básico)
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('agente.retiro', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'Carmen López Ruiz', 'carmen.lopez@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01-P02') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Jefe de Comandancia Toledo
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('jefe.cmd.toledo', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'Pedro Gómez Pérez', 'pedro.gomez@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- Jefe de Zona Norte
-- Contraseña: Password123!
INSERT INTO Usuarios (username, password_hash, nombre_completo, email, unidad_destino_id, activo) VALUES
('jefe.zona.norte', '$2b$10$p7b4FdIabGj7G6DMoUudi.nEaN3Zl.O7XJ95cu49A7oZ/otkrOl.K', 'Isabel Fernández Díaz', 'isabel.fernandez@siga.es',
    (SELECT id FROM (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02') AS tmp),
    TRUE)
ON DUPLICATE KEY UPDATE nombre_completo = VALUES(nombre_completo);

-- ============================================================================
-- 3. ASIGNAR ROLES Y ALCANCES A USUARIOS
-- ============================================================================
-- Esta tabla es CRÍTICA: define quién puede hacer qué y dónde
-- ============================================================================

-- Admin Total -> Admin Total en Zona Centro (alcance total desde raíz Z01)
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'admin'),
    (SELECT id FROM Roles WHERE nombre = 'Admin Total'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01'),
    NULL
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Jefe Zona Centro -> Gestor de Unidad en Zona Centro
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'jefe.zona.centro'),
    (SELECT id FROM Roles WHERE nombre = 'Gestor de Unidad'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01'),
    (SELECT id FROM Usuarios WHERE username = 'admin')
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Jefe Comandancia Madrid -> Gestor de Unidad en Comandancia Madrid
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'jefe.cmd.madrid'),
    (SELECT id FROM Roles WHERE nombre = 'Gestor de Unidad'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01'),
    (SELECT id FROM Usuarios WHERE username = 'admin')
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Jefe Compañía Madrid Centro -> Supervisor en Compañía Madrid Centro
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'jefe.cmp.madrid.centro'),
    (SELECT id FROM Roles WHERE nombre = 'Supervisor'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01'),
    (SELECT id FROM Usuarios WHERE username = 'jefe.cmd.madrid')
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Agente Sol -> Usuario Básico en Puesto Sol
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'agente.sol'),
    (SELECT id FROM Roles WHERE nombre = 'Usuario Básico'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01-P01'),
    (SELECT id FROM Usuarios WHERE username = 'jefe.cmp.madrid.centro')
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Agente Retiro -> Usuario Básico en Puesto Retiro
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'agente.retiro'),
    (SELECT id FROM Roles WHERE nombre = 'Usuario Básico'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C01-CP01-P02'),
    (SELECT id FROM Usuarios WHERE username = 'jefe.cmp.madrid.centro')
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Jefe Comandancia Toledo -> Gestor de Unidad en Comandancia Toledo
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'jefe.cmd.toledo'),
    (SELECT id FROM Roles WHERE nombre = 'Gestor de Unidad'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z01-C02'),
    (SELECT id FROM Usuarios WHERE username = 'admin')
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Jefe Zona Norte -> Gestor de Unidad en Zona Norte
INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id, asignado_por) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'jefe.zona.norte'),
    (SELECT id FROM Roles WHERE nombre = 'Gestor de Unidad'),
    (SELECT id FROM Unidades WHERE codigo_unidad = 'Z02'),
    (SELECT id FROM Usuarios WHERE username = 'admin')
)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- ============================================================================
-- 4. NOTIFICACIONES DE PRUEBA
-- ============================================================================

INSERT INTO Notificaciones (usuario_id, titulo, mensaje, tipo, url) VALUES
(
    (SELECT id FROM Usuarios WHERE username = 'admin'),
    'Bienvenido al Sistema',
    'El sistema ha sido configurado correctamente. Revisa las opciones de administración.',
    'success',
    '/admin'
),
(
    (SELECT id FROM Usuarios WHERE username = 'jefe.cmd.madrid'),
    'Nuevo usuario asignado',
    'Se ha asignado un nuevo agente a tu comandancia.',
    'info',
    '/admin/usuarios'
),
(
    (SELECT id FROM Usuarios WHERE username = 'agente.sol'),
    'Actualización de turno',
    'Tu turno ha sido modificado. Revisa el calendario.',
    'warning',
    '/turnos'
)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- ============================================================================
-- RESUMEN DE DATOS CREADOS
-- ============================================================================

SELECT '=== RESUMEN DE DATOS CREADOS ===' as '---';
SELECT COUNT(*) as total_unidades FROM Unidades;
SELECT COUNT(*) as total_usuarios FROM Usuarios;
SELECT COUNT(*) as total_asignaciones FROM Usuario_Roles_Alcance;
SELECT COUNT(*) as total_notificaciones FROM Notificaciones;

SELECT '=== ESTRUCTURA DE UNIDADES POR TIPO ===' as '---';
SELECT tipo_unidad, COUNT(*) as cantidad 
FROM Unidades 
GROUP BY tipo_unidad 
ORDER BY FIELD(tipo_unidad, 'Zona', 'Comandancia', 'Compañia', 'Puesto');

SELECT '=== USUARIOS CON SUS ROLES ===' as '---';
SELECT 
    u.username,
    u.nombre_completo,
    r.nombre as rol,
    un.nombre as unidad_alcance,
    un.tipo_unidad
FROM Usuarios u
INNER JOIN Usuario_Roles_Alcance ura ON u.id = ura.usuario_id
INNER JOIN Roles r ON ura.rol_id = r.id
INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
ORDER BY un.tipo_unidad, u.username;

-- ============================================================================
-- NOTA IMPORTANTE SOBRE CONTRASEÑAS
-- ============================================================================
-- TODAS las contraseñas están configuradas temporalmente como hash de ejemplo
-- Es necesario ejecutar el script de Node.js para generar los hashes reales
-- Ver: /backend/scripts/generate-password-hashes.js
-- ============================================================================
