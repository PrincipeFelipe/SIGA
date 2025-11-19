-- ============================================================================
-- MÓDULO DE GESTIÓN DE CITAS PARA TALLER DE VEHÍCULOS
-- ============================================================================
-- Fecha: 17 de noviembre de 2025
-- Descripción: Sistema completo de gestión de vehículos y citas para taller
-- ============================================================================

USE siga_db;

-- ============================================================================
-- TABLA: Vehiculos
-- ============================================================================
-- Almacena los vehículos asignados a cada unidad organizacional
-- ============================================================================

CREATE TABLE IF NOT EXISTS Vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unidad_id INT NOT NULL,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    tipo_vehiculo ENUM('turismo', 'furgoneta', 'camion', 'moto', 'otro') NOT NULL DEFAULT 'turismo',
    ano_fabricacion YEAR,
    kilometraje INT DEFAULT 0,
    numero_bastidor VARCHAR(50),
    estado ENUM('activo', 'mantenimiento', 'baja') NOT NULL DEFAULT 'activo',
    fecha_alta DATE NOT NULL,
    fecha_baja DATE,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    actualizado_por INT,
    
    FOREIGN KEY (unidad_id) REFERENCES Unidades(id) ON DELETE RESTRICT,
    FOREIGN KEY (creado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_unidad (unidad_id),
    INDEX idx_matricula (matricula),
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo_vehiculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: TiposCita
-- ============================================================================
-- Define los tipos de servicios que ofrece el taller y su duración
-- ============================================================================

CREATE TABLE IF NOT EXISTS TiposCita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    duracion_minutos INT NOT NULL DEFAULT 60,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Color para el calendario (hex)
    activo TINYINT(1) NOT NULL DEFAULT 1,
    orden INT DEFAULT 0, -- Para ordenar en selects
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    actualizado_por INT,
    
    FOREIGN KEY (creado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_activo (activo),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: Citas
-- ============================================================================
-- Almacena las citas solicitadas para el taller
-- ============================================================================

CREATE TABLE IF NOT EXISTS Citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    tipo_cita_id INT NOT NULL,
    usuario_solicitante_id INT NOT NULL,
    fecha_hora_inicio DATETIME NOT NULL,
    fecha_hora_fin DATETIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    motivo TEXT,
    observaciones TEXT,
    resultado TEXT, -- Resultado del servicio (completado por el taller)
    kilometraje_entrada INT,
    kilometraje_salida INT,
    fecha_confirmacion DATETIME,
    fecha_completada DATETIME,
    fecha_cancelada DATETIME,
    motivo_cancelacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    actualizado_por INT,
    
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (tipo_cita_id) REFERENCES TiposCita(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_solicitante_id) REFERENCES Usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (creado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_tipo_cita (tipo_cita_id),
    INDEX idx_usuario (usuario_solicitante_id),
    INDEX idx_fecha_inicio (fecha_hora_inicio),
    INDEX idx_estado (estado),
    INDEX idx_fecha_rango (fecha_hora_inicio, fecha_hora_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS INICIALES: Tipos de Cita
-- ============================================================================

-- Eliminar datos existentes para evitar duplicados
DELETE FROM TiposCita WHERE creado_por = 1;

INSERT INTO TiposCita (nombre, descripcion, duracion_minutos, color, activo, orden, creado_por) VALUES
('Revisión General', 'Revisión completa del vehículo (aceite, filtros, frenos, neumáticos)', 120, '#3B82F6', 1, 1, 1),
('Cambio de Aceite', 'Cambio de aceite y filtro de aceite', 30, '#10B981', 1, 2, 1),
('Revisión de Frenos', 'Inspección y ajuste del sistema de frenado', 60, '#F59E0B', 1, 3, 1),
('Cambio de Neumáticos', 'Sustitución de uno o varios neumáticos', 45, '#8B5CF6', 1, 4, 1),
('Revisión Pre-ITV', 'Revisión completa antes de pasar la ITV', 90, '#EF4444', 1, 5, 1),
('Reparación Mecánica', 'Reparación mecánica general', 180, '#F97316', 1, 6, 1),
('Diagnóstico Electrónico', 'Diagnóstico con equipo electrónico', 60, '#06B6D4', 1, 7, 1),
('Mantenimiento Preventivo', 'Mantenimiento preventivo programado', 90, '#14B8A6', 1, 8, 1);

-- ============================================================================
-- PERMISOS DEL MÓDULO
-- ============================================================================

-- Eliminar permisos existentes del módulo
DELETE FROM Permisos WHERE categoria IN ('vehiculos', 'tipos_cita', 'citas');

-- Permisos para Vehículos
INSERT INTO Permisos (accion, descripcion, categoria, activo, created_at) VALUES
('vehicles:view', 'Ver vehículos de la unidad propia', 'vehiculos', 1, NOW()),
('vehicles:view_all', 'Ver todos los vehículos del sistema', 'vehiculos', 1, NOW()),
('vehicles:create', 'Crear nuevos vehículos', 'vehiculos', 1, NOW()),
('vehicles:edit', 'Editar vehículos', 'vehiculos', 1, NOW()),
('vehicles:delete', 'Eliminar vehículos', 'vehiculos', 1, NOW()),
('vehicles:manage', 'Gestión completa de vehículos', 'vehiculos', 1, NOW());

-- Permisos para Tipos de Cita
INSERT INTO Permisos (accion, descripcion, categoria, activo, created_at) VALUES
('appointment_types:view', 'Ver tipos de cita disponibles', 'tipos_cita', 1, NOW()),
('appointment_types:create', 'Crear nuevos tipos de cita', 'tipos_cita', 1, NOW()),
('appointment_types:edit', 'Editar tipos de cita', 'tipos_cita', 1, NOW()),
('appointment_types:delete', 'Eliminar tipos de cita', 'tipos_cita', 1, NOW()),
('appointment_types:manage', 'Gestión completa de tipos de cita', 'tipos_cita', 1, NOW());

-- Permisos para Citas
INSERT INTO Permisos (accion, descripcion, categoria, activo, created_at) VALUES
('appointments:view_own', 'Ver mis propias citas', 'citas', 1, NOW()),
('appointments:view', 'Ver citas de la unidad propia', 'citas', 1, NOW()),
('appointments:view_all', 'Ver todas las citas del sistema', 'citas', 1, NOW()),
('appointments:create', 'Solicitar nuevas citas', 'citas', 1, NOW()),
('appointments:edit', 'Editar citas', 'citas', 1, NOW()),
('appointments:cancel', 'Cancelar citas', 'citas', 1, NOW()),
('appointments:confirm', 'Confirmar citas (personal de taller)', 'citas', 1, NOW()),
('appointments:complete', 'Marcar citas como completadas', 'citas', 1, NOW()),
('appointments:manage', 'Gestión completa de citas', 'citas', 1, NOW());

-- ============================================================================
-- ASIGNAR PERMISOS AL ROL DE ADMINISTRADOR
-- ============================================================================

-- Obtener el ID del rol Admin Total
SET @admin_rol_id = (SELECT id FROM Roles WHERE nombre = 'Admin Total' LIMIT 1);

-- Asignar todos los permisos del módulo al administrador
INSERT INTO Roles_Permisos (rol_id, permiso_id)
SELECT @admin_rol_id, id FROM Permisos 
WHERE categoria IN ('vehiculos', 'tipos_cita', 'citas')
ON DUPLICATE KEY UPDATE rol_id = @admin_rol_id;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT '✅ Tabla Vehiculos creada' AS resultado;
SELECT '✅ Tabla TiposCita creada' AS resultado;
SELECT '✅ Tabla Citas creada' AS resultado;
SELECT '✅ Datos iniciales de TiposCita insertados' AS resultado;
SELECT '✅ Permisos del módulo creados' AS resultado;
SELECT '✅ Permisos asignados al rol Admin' AS resultado;

-- Mostrar resumen
SELECT 
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT 
    '📊 RESUMEN DEL MÓDULO DE TALLER' AS '';
SELECT 
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

SELECT CONCAT('Tablas creadas: ', 
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'siga_db' 
     AND table_name IN ('Vehiculos', 'TiposCita', 'Citas'))
) AS info;

SELECT CONCAT('Tipos de cita disponibles: ', COUNT(*)) AS info
FROM TiposCita WHERE activo = 1;

SELECT CONCAT('Permisos del módulo: ', COUNT(*)) AS info
FROM Permisos WHERE categoria IN ('vehiculos', 'tipos_cita', 'citas');

SELECT 
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT 
    '✨ Módulo de Taller creado exitosamente' AS '';
