-- ============================================================================
-- MÓDULO DE GESTIÓN DE TAREAS
-- ============================================================================
-- Creado: 5 de noviembre de 2025
-- Descripción: Sistema de asignación y seguimiento de tareas del equipo
-- ============================================================================

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS Tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Asignación
    asignado_a INT NOT NULL,
    asignado_por INT NOT NULL,
    unidad_id INT,
    
    -- Prioridad y plazos
    prioridad ENUM('baja', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
    es_241 BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Campo 24.1 - Si es SI, plazo automático de 90 días',
    fecha_inicio DATE NOT NULL,
    fecha_limite DATE NOT NULL,
    fecha_completada DATETIME NULL,
    
    -- Estado
    estado ENUM('pendiente', 'en_progreso', 'en_revision', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    progreso INT DEFAULT 0 COMMENT 'Porcentaje de avance (0-100)',
    
    -- Notas y seguimiento
    notas TEXT,
    archivos_adjuntos JSON COMMENT 'Array de rutas a archivos adjuntos',
    
    -- Auditoría
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    actualizado_por INT,
    
    -- Foreign Keys
    FOREIGN KEY (asignado_a) REFERENCES Usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (asignado_por) REFERENCES Usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (unidad_id) REFERENCES Unidades(id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    
    -- Índices para optimizar búsquedas
    INDEX idx_asignado_a (asignado_a),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_limite (fecha_limite),
    INDEX idx_es_241 (es_241),
    INDEX idx_unidad (unidad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Comentarios de Tareas
CREATE TABLE IF NOT EXISTS Tareas_Comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tarea_id) REFERENCES Tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_tarea (tarea_id),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Historial de Cambios
CREATE TABLE IF NOT EXISTS Tareas_Historial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    campo_modificado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tarea_id) REFERENCES Tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_tarea (tarea_id),
    INDEX idx_fecha (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRIGGER: Calcular fecha límite automática para 24.1
-- ============================================================================
DELIMITER //

CREATE TRIGGER before_insert_tarea
BEFORE INSERT ON Tareas
FOR EACH ROW
BEGIN
    -- Si es_241 es TRUE, establecer fecha límite a 90 días desde fecha_inicio
    IF NEW.es_241 = TRUE THEN
        SET NEW.fecha_limite = DATE_ADD(NEW.fecha_inicio, INTERVAL 90 DAY);
    END IF;
END//

CREATE TRIGGER before_update_tarea
BEFORE UPDATE ON Tareas
FOR EACH ROW
BEGIN
    -- Si se activa es_241, recalcular fecha límite
    IF NEW.es_241 = TRUE AND (OLD.es_241 = FALSE OR NEW.fecha_inicio != OLD.fecha_inicio) THEN
        SET NEW.fecha_limite = DATE_ADD(NEW.fecha_inicio, INTERVAL 90 DAY);
    END IF;
    
    -- Registrar cambio de estado en el historial
    IF NEW.estado != OLD.estado THEN
        INSERT INTO Tareas_Historial (tarea_id, usuario_id, campo_modificado, valor_anterior, valor_nuevo)
        VALUES (NEW.id, NEW.actualizado_por, 'estado', OLD.estado, NEW.estado);
    END IF;
    
    -- Si se marca como completada, registrar fecha
    IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
        SET NEW.fecha_completada = NOW();
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- PERMISOS PARA EL MÓDULO DE TAREAS
-- ============================================================================
INSERT INTO Permisos (accion, descripcion, categoria, activo) VALUES
('tasks:view', 'Ver listado de tareas', 'tasks', TRUE),
('tasks:view_all', 'Ver todas las tareas del sistema', 'tasks', TRUE),
('tasks:view_own', 'Ver solo tareas propias', 'tasks', TRUE),
('tasks:create', 'Crear nuevas tareas', 'tasks', TRUE),
('tasks:assign', 'Asignar tareas a otros usuarios', 'tasks', TRUE),
('tasks:edit', 'Editar tareas existentes', 'tasks', TRUE),
('tasks:edit_own', 'Editar solo tareas propias', 'tasks', TRUE),
('tasks:delete', 'Eliminar tareas', 'tasks', TRUE),
('tasks:change_status', 'Cambiar estado de tareas', 'tasks', TRUE),
('tasks:comment', 'Comentar en tareas', 'tasks', TRUE),
('tasks:view_history', 'Ver historial de cambios', 'tasks', TRUE),
('tasks:export', 'Exportar listado de tareas', 'tasks', TRUE);

-- ============================================================================
-- AGREGAR APLICACIÓN AL MENÚ DINÁMICO
-- ============================================================================
INSERT INTO Aplicaciones (nombre, descripcion, ruta, icono, permiso_requerido_id, orden, activo)
VALUES (
    'Tareas',
    'Gestión de tareas del equipo',
    '/tareas',
    'icon-check-square',
    (SELECT id FROM Permisos WHERE accion = 'tasks:view' LIMIT 1),
    6,
    TRUE
);

-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTAR SI NO SE DESEAN)
-- ============================================================================
/*
INSERT INTO Tareas (titulo, descripcion, asignado_a, asignado_por, unidad_id, prioridad, es_241, fecha_inicio, fecha_limite, estado, progreso, creado_por)
VALUES 
(
    'Revisión de documentación del sistema',
    'Revisar y actualizar toda la documentación técnica del sistema SIGA',
    10, -- R84101K
    1,  -- admin
    1,  -- Zona de Navarra
    'alta',
    FALSE,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 15 DAY),
    'pendiente',
    0,
    1
),
(
    'Auditoría de seguridad - Procedimiento 24.1',
    'Realizar auditoría completa de seguridad según procedimiento 24.1. Plazo automático de 90 días.',
    10,
    1,
    1,
    'urgente',
    TRUE, -- Es 24.1, fecha límite se calcula automáticamente
    CURDATE(),
    NULL, -- Se calculará automáticamente por el trigger
    'en_progreso',
    25,
    1
),
(
    'Formación en nuevo módulo',
    'Impartir formación sobre el nuevo módulo de tareas a todos los coordinadores',
    7, -- coord.huesca
    1,
    5, -- Comandancia de Huesca
    'media',
    FALSE,
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    'pendiente',
    0,
    1
);
*/

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista de tareas con información completa
CREATE OR REPLACE VIEW v_tareas_completas AS
SELECT 
    t.id,
    t.titulo,
    t.descripcion,
    t.prioridad,
    t.es_241,
    t.estado,
    t.progreso,
    t.fecha_inicio,
    t.fecha_limite,
    t.fecha_completada,
    
    -- Usuario asignado
    ua.id AS asignado_a_id,
    ua.username AS asignado_a_username,
    ua.nombre_completo AS asignado_a_nombre,
    
    -- Usuario que asignó
    up.id AS asignado_por_id,
    up.username AS asignado_por_username,
    up.nombre_completo AS asignado_por_nombre,
    
    -- Unidad
    u.id AS unidad_id,
    u.nombre AS unidad_nombre,
    u.codigo_unidad,
    
    -- Días restantes
    DATEDIFF(t.fecha_limite, CURDATE()) AS dias_restantes,
    
    -- Estado del plazo
    CASE 
        WHEN t.estado IN ('completada', 'cancelada') THEN 'finalizada'
        WHEN DATEDIFF(t.fecha_limite, CURDATE()) < 0 THEN 'vencida'
        WHEN DATEDIFF(t.fecha_limite, CURDATE()) <= 3 THEN 'urgente'
        WHEN DATEDIFF(t.fecha_limite, CURDATE()) <= 7 THEN 'proximo_vencimiento'
        ELSE 'en_plazo'
    END AS estado_plazo,
    
    -- Auditoría
    t.creado_en,
    t.actualizado_en
FROM Tareas t
INNER JOIN Usuarios ua ON t.asignado_a = ua.id
INNER JOIN Usuarios up ON t.asignado_por = up.id
LEFT JOIN Unidades u ON t.unidad_id = u.id;

-- Vista de estadísticas por usuario
CREATE OR REPLACE VIEW v_tareas_estadisticas_usuario AS
SELECT 
    u.id AS usuario_id,
    u.username,
    u.nombre_completo,
    COUNT(t.id) AS total_tareas,
    SUM(CASE WHEN t.estado = 'pendiente' THEN 1 ELSE 0 END) AS tareas_pendientes,
    SUM(CASE WHEN t.estado = 'en_progreso' THEN 1 ELSE 0 END) AS tareas_en_progreso,
    SUM(CASE WHEN t.estado = 'completada' THEN 1 ELSE 0 END) AS tareas_completadas,
    SUM(CASE WHEN t.estado = 'en_revision' THEN 1 ELSE 0 END) AS tareas_en_revision,
    SUM(CASE WHEN DATEDIFF(t.fecha_limite, CURDATE()) < 0 AND t.estado NOT IN ('completada', 'cancelada') THEN 1 ELSE 0 END) AS tareas_vencidas,
    AVG(t.progreso) AS progreso_promedio
FROM Usuarios u
LEFT JOIN Tareas t ON u.id = t.asignado_a
GROUP BY u.id, u.username, u.nombre_completo;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT 'Tablas de Tareas creadas correctamente' AS mensaje;
SELECT COUNT(*) AS total_permisos_tareas FROM Permisos WHERE categoria = 'tasks';
SELECT * FROM Aplicaciones WHERE nombre = 'Tareas';
