-- ============================================================================
-- PLATAFORMA INTERNA DE GESTIÓN (PIG) - SCHEMA DE BASE DE DATOS
-- Sistema de Control de Acceso Jerárquico con Roles y Permisos
-- Base de datos: MariaDB 11.8.3
-- ============================================================================

-- Usar la base de datos
USE siga_db;

-- ============================================================================
-- 1. TABLA UNIDADES (El Árbol Jerárquico)
-- ============================================================================
-- Representa la estructura organizacional jerárquica
-- Soporta consultas recursivas (CTE) para navegación de árbol
-- ============================================================================

CREATE TABLE IF NOT EXISTS Unidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo_unidad ENUM('Zona', 'Comandancia', 'Compañia', 'Puesto') NOT NULL,
    codigo_unidad VARCHAR(50) UNIQUE,
    parent_id INT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relación jerárquica consigo misma
    CONSTRAINT fk_unidad_parent FOREIGN KEY (parent_id) 
        REFERENCES Unidades(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Índices para mejorar rendimiento de consultas jerárquicas
    INDEX idx_parent_id (parent_id),
    INDEX idx_tipo_unidad (tipo_unidad),
    INDEX idx_codigo_unidad (codigo_unidad),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estructura organizacional jerárquica de unidades';

-- ============================================================================
-- 2. TABLA ROLES (Qué se puede hacer)
-- ============================================================================
-- Define los roles que se pueden asignar a usuarios
-- Un rol es un conjunto de permisos (relación N:M con Permisos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    nivel_jerarquico INT DEFAULT 0 COMMENT 'Nivel del rol (0=más alto, 999=más bajo)',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre),
    INDEX idx_nivel (nivel_jerarquico),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roles del sistema que agrupan permisos';

-- ============================================================================
-- 3. TABLA PERMISOS (Las acciones atómicas)
-- ============================================================================
-- Define todas las acciones posibles en el sistema
-- Formato: 'recurso:accion' (ej: 'users:create', 'reports:view')
-- ============================================================================

CREATE TABLE IF NOT EXISTS Permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accion VARCHAR(100) UNIQUE NOT NULL COMMENT 'Formato: recurso:accion (ej: users:create)',
    descripcion TEXT,
    categoria VARCHAR(50) COMMENT 'Agrupa permisos por módulo (users, reports, admin, etc)',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_accion (accion),
    INDEX idx_categoria (categoria),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permisos atómicos del sistema';

-- ============================================================================
-- 4. TABLA ROLES_PERMISOS (Pivote Many-to-Many)
-- ============================================================================
-- Relaciona Roles con Permisos
-- Define qué acciones puede realizar cada rol
-- ============================================================================

CREATE TABLE IF NOT EXISTS Roles_Permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_roles_permisos_rol FOREIGN KEY (rol_id) 
        REFERENCES Roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_roles_permisos_permiso FOREIGN KEY (permiso_id) 
        REFERENCES Permisos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Evitar duplicados
    UNIQUE KEY uk_rol_permiso (rol_id, permiso_id),
    INDEX idx_rol_id (rol_id),
    INDEX idx_permiso_id (permiso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación Many-to-Many entre Roles y Permisos';

-- ============================================================================
-- 5. TABLA USUARIOS (La identidad)
-- ============================================================================
-- Información de usuarios del sistema
-- No hay auto-registro: solo el admin puede crear usuarios
-- ============================================================================

CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    unidad_destino_id INT NOT NULL COMMENT 'Unidad "hogar" del usuario',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP NULL,
    require_password_change BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_unidad_destino FOREIGN KEY (unidad_destino_id) 
        REFERENCES Unidades(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_username (username),
    INDEX idx_unidad_destino (unidad_destino_id),
    INDEX idx_activo (activo),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios del sistema';

-- ============================================================================
-- 6. TABLA USUARIO_ROLES_ALCANCE (¡La Tabla Clave de Seguridad!)
-- ============================================================================
-- Define la autoridad de un usuario
-- Combina: Quién + Qué Rol + Dónde puede ejercerlo
-- Un usuario puede tener múltiples asignaciones (diferentes roles en diferentes unidades)
-- ============================================================================

CREATE TABLE IF NOT EXISTS Usuario_Roles_Alcance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    rol_id INT NOT NULL,
    unidad_alcance_id INT NOT NULL COMMENT 'Nodo más alto donde el rol es efectivo (incluye descendientes)',
    asignado_por INT COMMENT 'Usuario que realizó la asignación',
    fecha_inicio DATE DEFAULT (CURRENT_DATE),
    fecha_fin DATE NULL COMMENT 'NULL = indefinido',
    activo BOOLEAN DEFAULT TRUE,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ura_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ura_rol FOREIGN KEY (rol_id) 
        REFERENCES Roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ura_unidad_alcance FOREIGN KEY (unidad_alcance_id) 
        REFERENCES Unidades(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ura_asignado_por FOREIGN KEY (asignado_por) 
        REFERENCES Usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Evitar asignaciones duplicadas del mismo rol en la misma unidad
    UNIQUE KEY uk_usuario_rol_unidad (usuario_id, rol_id, unidad_alcance_id),
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_rol_id (rol_id),
    INDEX idx_unidad_alcance (unidad_alcance_id),
    INDEX idx_activo (activo),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignaciones de roles con alcance jerárquico - NÚCLEO DE SEGURIDAD';

-- ============================================================================
-- 7. TABLA APLICACIONES (Para el Sidebar Dinámico)
-- ============================================================================
-- Define los módulos/aplicaciones disponibles en el sistema
-- El sidebar se genera dinámicamente según los permisos del usuario
-- ============================================================================

CREATE TABLE IF NOT EXISTS Aplicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ruta VARCHAR(255) NOT NULL UNIQUE COMMENT 'Ruta del módulo en el frontend',
    icono VARCHAR(100) COMMENT 'Nombre del icono (ej: icon-users, icon-charts)',
    permiso_requerido_id INT NULL COMMENT 'Permiso necesario para ver este módulo (NULL = público)',
    orden INT DEFAULT 0 COMMENT 'Orden de aparición en el sidebar',
    parent_id INT NULL COMMENT 'Para sub-menús',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_aplicacion_permiso FOREIGN KEY (permiso_requerido_id) 
        REFERENCES Permisos(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_aplicacion_parent FOREIGN KEY (parent_id) 
        REFERENCES Aplicaciones(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_ruta (ruta),
    INDEX idx_permiso_requerido (permiso_requerido_id),
    INDEX idx_orden (orden),
    INDEX idx_parent_id (parent_id),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Módulos/Aplicaciones del sistema para sidebar dinámico';

-- ============================================================================
-- 8. TABLA NOTIFICACIONES (Sistema de Alertas)
-- ============================================================================
-- Notificaciones para usuarios (aparecen en el header)
-- ============================================================================

CREATE TABLE IF NOT EXISTS Notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    tipo ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    leida BOOLEAN DEFAULT FALSE,
    url VARCHAR(255) COMMENT 'Enlace opcional al hacer clic en la notificación',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida_at TIMESTAMP NULL,
    
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_leida (leida),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Notificaciones para usuarios';

-- ============================================================================
-- 9. TABLA LOGS (Auditoría del Sistema)
-- ============================================================================
-- Registra todas las acciones CUD (Crear, Actualizar, Eliminar)
-- Esencial para auditoría y trazabilidad
-- ============================================================================

CREATE TABLE IF NOT EXISTS Logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL COMMENT 'Acción realizada (CREATE, UPDATE, DELETE, etc)',
    recurso_tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de recurso (Usuario, Unidad, Rol, etc)',
    recurso_id VARCHAR(50) COMMENT 'ID del recurso afectado',
    descripcion TEXT,
    detalles_json JSON COMMENT 'Detalles adicionales en formato JSON',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_recurso (recurso_tipo, recurso_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs de auditoría de todas las acciones del sistema';

-- ============================================================================
-- DATOS INICIALES - PERMISOS
-- ============================================================================
-- Permisos básicos del sistema organizados por categoría
-- ============================================================================

INSERT INTO Permisos (accion, descripcion, categoria) VALUES
-- Permisos de Usuarios
('users:view', 'Ver lista de usuarios', 'users'),
('users:view_detail', 'Ver detalles de un usuario', 'users'),
('users:create', 'Crear nuevos usuarios', 'users'),
('users:edit', 'Editar usuarios existentes', 'users'),
('users:delete', 'Eliminar/desactivar usuarios', 'users'),
('users:reset_password', 'Restablecer contraseñas de usuarios', 'users'),

-- Permisos de Roles
('roles:view', 'Ver lista de roles', 'roles'),
('roles:create', 'Crear nuevos roles', 'roles'),
('roles:edit', 'Editar roles existentes', 'roles'),
('roles:delete', 'Eliminar roles', 'roles'),
('roles:assign_permissions', 'Asignar permisos a roles', 'roles'),

-- Permisos de Unidades
('units:view', 'Ver estructura de unidades', 'units'),
('units:create', 'Crear nuevas unidades', 'units'),
('units:edit', 'Editar unidades existentes', 'units'),
('units:delete', 'Eliminar unidades', 'units'),

-- Permisos de Asignación de Roles
('user_roles:view', 'Ver asignaciones de roles de usuarios', 'user_roles'),
('user_roles:assign', 'Asignar roles y alcances a usuarios', 'user_roles'),
('user_roles:revoke', 'Revocar roles y alcances de usuarios', 'user_roles'),

-- Permisos de Aplicaciones
('apps:view', 'Ver lista de aplicaciones', 'apps'),
('apps:manage', 'Gestionar aplicaciones del sistema', 'apps'),

-- Permisos de Logs
('logs:view', 'Ver logs de auditoría', 'logs'),
('logs:export', 'Exportar logs de auditoría', 'logs'),

-- Permisos de Notificaciones
('notifications:view', 'Ver notificaciones', 'notifications'),
('notifications:create', 'Crear notificaciones', 'notifications'),

-- Permisos de Módulos (Acceso a aplicaciones)
('module:dashboard', 'Acceder al dashboard principal', 'modules'),
('module:admin', 'Acceder al panel de administración', 'modules'),
('module:reports', 'Acceder a reportes', 'modules'),
('module:settings', 'Acceder a configuración', 'modules')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- ============================================================================
-- DATOS INICIALES - ROLES
-- ============================================================================
-- Roles predefinidos del sistema
-- ============================================================================

INSERT INTO Roles (nombre, descripcion, nivel_jerarquico) VALUES
('Admin Total', 'Administrador con acceso total al sistema', 0),
('Gestor de Unidad', 'Gestiona usuarios y recursos de su unidad y descendientes', 10),
('Supervisor', 'Supervisa operaciones en su alcance', 20),
('Usuario Básico', 'Usuario con permisos de lectura básicos', 50)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- ============================================================================
-- ASIGNAR PERMISOS A ROL "Admin Total"
-- ============================================================================
-- El Admin Total tiene todos los permisos
-- ============================================================================

INSERT INTO Roles_Permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM Roles WHERE nombre = 'Admin Total') as rol_id,
    id as permiso_id
FROM Permisos
WHERE NOT EXISTS (
    SELECT 1 FROM Roles_Permisos rp 
    WHERE rp.rol_id = (SELECT id FROM Roles WHERE nombre = 'Admin Total')
    AND rp.permiso_id = Permisos.id
);

-- ============================================================================
-- ASIGNAR PERMISOS A ROL "Gestor de Unidad"
-- ============================================================================

INSERT INTO Roles_Permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM Roles WHERE nombre = 'Gestor de Unidad') as rol_id,
    id as permiso_id
FROM Permisos
WHERE accion IN (
    'users:view', 'users:view_detail', 'users:create', 'users:edit',
    'units:view',
    'user_roles:view', 'user_roles:assign',
    'notifications:view',
    'module:dashboard', 'module:reports'
)
AND NOT EXISTS (
    SELECT 1 FROM Roles_Permisos rp 
    WHERE rp.rol_id = (SELECT id FROM Roles WHERE nombre = 'Gestor de Unidad')
    AND rp.permiso_id = Permisos.id
);

-- ============================================================================
-- ASIGNAR PERMISOS A ROL "Usuario Básico"
-- ============================================================================

INSERT INTO Roles_Permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM Roles WHERE nombre = 'Usuario Básico') as rol_id,
    id as permiso_id
FROM Permisos
WHERE accion IN (
    'users:view',
    'units:view',
    'notifications:view',
    'module:dashboard'
)
AND NOT EXISTS (
    SELECT 1 FROM Roles_Permisos rp 
    WHERE rp.rol_id = (SELECT id FROM Roles WHERE nombre = 'Usuario Básico')
    AND rp.permiso_id = Permisos.id
);

-- ============================================================================
-- DATOS INICIALES - APLICACIONES (Sidebar)
-- ============================================================================

INSERT INTO Aplicaciones (nombre, descripcion, ruta, icono, permiso_requerido_id, orden) VALUES
('Dashboard', 'Panel principal del sistema', '/dashboard', 'icon-home', (SELECT id FROM Permisos WHERE accion = 'module:dashboard'), 1),
('Administración', 'Panel de administración', '/admin', 'icon-settings', (SELECT id FROM Permisos WHERE accion = 'module:admin'), 2),
('Gestión de Usuarios', 'Gestionar usuarios del sistema', '/admin/usuarios', 'icon-users', (SELECT id FROM Permisos WHERE accion = 'users:view'), 3),
('Gestión de Unidades', 'Gestionar estructura de unidades', '/admin/unidades', 'icon-sitemap', (SELECT id FROM Permisos WHERE accion = 'units:view'), 4),
('Roles y Permisos', 'Gestionar roles y permisos', '/admin/roles', 'icon-shield', (SELECT id FROM Permisos WHERE accion = 'roles:view'), 5),
('Reportes', 'Ver reportes del sistema', '/reportes', 'icon-chart-bar', (SELECT id FROM Permisos WHERE accion = 'module:reports'), 6),
('Logs de Auditoría', 'Ver historial de acciones', '/admin/logs', 'icon-history', (SELECT id FROM Permisos WHERE accion = 'logs:view'), 7)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- ============================================================================
-- FUNCIÓN AUXILIAR: Verificar si una unidad es descendiente de otra
-- ============================================================================
-- Esta función se usará en el middleware de autorización
-- Usa Common Table Expression (CTE) recursivo para navegar el árbol
-- ============================================================================

DELIMITER $$

DROP FUNCTION IF EXISTS es_unidad_descendiente$$

CREATE FUNCTION es_unidad_descendiente(
    unidad_objetivo INT,
    unidad_alcance INT
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE es_descendiente BOOLEAN DEFAULT FALSE;
    
    -- Si son la misma unidad, retornar TRUE
    IF unidad_objetivo = unidad_alcance THEN
        RETURN TRUE;
    END IF;
    
    -- Buscar si unidad_objetivo es descendiente de unidad_alcance
    -- usando una consulta recursiva
    WITH RECURSIVE unidades_tree AS (
        -- Caso base: empezar con la unidad de alcance
        SELECT id, parent_id
        FROM Unidades
        WHERE id = unidad_alcance
        
        UNION ALL
        
        -- Caso recursivo: obtener todos los hijos
        SELECT u.id, u.parent_id
        FROM Unidades u
        INNER JOIN unidades_tree ut ON u.parent_id = ut.id
    )
    SELECT EXISTS(
        SELECT 1 FROM unidades_tree WHERE id = unidad_objetivo
    ) INTO es_descendiente;
    
    RETURN es_descendiente;
END$$

DELIMITER ;

-- ============================================================================
-- VISTA: Usuarios con sus Roles y Alcances
-- ============================================================================
-- Vista útil para consultas de autorización
-- ============================================================================

CREATE OR REPLACE VIEW v_usuarios_roles_alcances AS
SELECT 
    u.id as usuario_id,
    u.username,
    u.nombre_completo,
    u.unidad_destino_id,
    ud.nombre as unidad_destino_nombre,
    ura.id as asignacion_id,
    r.id as rol_id,
    r.nombre as rol_nombre,
    ura.unidad_alcance_id,
    ua.nombre as unidad_alcance_nombre,
    ua.tipo_unidad as unidad_alcance_tipo,
    ura.activo as asignacion_activa,
    ura.fecha_inicio,
    ura.fecha_fin
FROM Usuarios u
LEFT JOIN Usuario_Roles_Alcance ura ON u.id = ura.usuario_id
LEFT JOIN Roles r ON ura.rol_id = r.id
LEFT JOIN Unidades ud ON u.unidad_destino_id = ud.id
LEFT JOIN Unidades ua ON ura.unidad_alcance_id = ua.id
WHERE u.activo = TRUE;

-- ============================================================================
-- VISTA: Permisos Efectivos por Usuario
-- ============================================================================
-- Muestra todos los permisos que tiene cada usuario (a través de sus roles)
-- ============================================================================

CREATE OR REPLACE VIEW v_permisos_usuario AS
SELECT DISTINCT
    u.id as usuario_id,
    u.username,
    p.id as permiso_id,
    p.accion as permiso_accion,
    p.categoria as permiso_categoria,
    ura.unidad_alcance_id,
    un.nombre as unidad_alcance_nombre
FROM Usuarios u
INNER JOIN Usuario_Roles_Alcance ura ON u.id = ura.usuario_id
INNER JOIN Roles r ON ura.rol_id = r.id
INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
INNER JOIN Permisos p ON rp.permiso_id = p.id
INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
WHERE u.activo = TRUE 
  AND ura.activo = TRUE
  AND r.activo = TRUE
  AND p.activo = TRUE
  AND (ura.fecha_fin IS NULL OR ura.fecha_fin >= CURDATE());

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================

SELECT 'Schema creado exitosamente' as mensaje;
SELECT COUNT(*) as total_permisos FROM Permisos;
SELECT COUNT(*) as total_roles FROM Roles;
SELECT COUNT(*) as total_aplicaciones FROM Aplicaciones;
