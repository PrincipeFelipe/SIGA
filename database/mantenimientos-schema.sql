-- ============================================================================
-- MÓDULO DE MANTENIMIENTO PREVENTIVO DE VEHÍCULOS
-- ============================================================================
-- Fecha: 19 de noviembre de 2025
-- Descripción: Sistema completo de gestión de mantenimientos periódicos
-- ============================================================================

USE siga_db;

-- ============================================================================
-- TABLA: TiposMantenimiento
-- ============================================================================
-- Define los tipos de mantenimientos preventivos y sus frecuencias
-- ============================================================================

CREATE TABLE IF NOT EXISTS TiposMantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    
    -- Frecuencia por kilómetros
    frecuencia_km INT DEFAULT NULL,
    margen_km_aviso INT DEFAULT 1000, -- Alertar 1000 km antes
    
    -- Frecuencia por tiempo
    frecuencia_meses INT DEFAULT NULL,
    margen_dias_aviso INT DEFAULT 30, -- Alertar 30 días antes
    
    -- Prioridad (1=crítico, 2=importante, 3=normal)
    prioridad ENUM('critico', 'importante', 'normal') DEFAULT 'normal',
    
    -- Categoría (para agrupar)
    categoria ENUM('motor', 'frenos', 'neumaticos', 'fluidos', 'filtros', 'electrico', 'general') DEFAULT 'general',
    
    -- Costo estimado
    costo_estimado DECIMAL(10,2) DEFAULT NULL,
    duracion_estimada_minutos INT DEFAULT 60,
    
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    actualizado_por INT,
    
    FOREIGN KEY (creado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_activo (activo),
    INDEX idx_categoria (categoria),
    INDEX idx_prioridad (prioridad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: MantenimientosVehiculo
-- ============================================================================
-- Historial de mantenimientos realizados a cada vehículo
-- ============================================================================

CREATE TABLE IF NOT EXISTS MantenimientosVehiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    tipo_mantenimiento_id INT NOT NULL,
    
    -- Datos del mantenimiento
    fecha_realizado DATE NOT NULL,
    kilometraje_realizado INT NOT NULL,
    
    -- Próximo mantenimiento calculado automáticamente
    proximo_kilometraje INT DEFAULT NULL,
    proxima_fecha DATE DEFAULT NULL,
    
    -- Detalles
    observaciones TEXT,
    costo_real DECIMAL(10,2) DEFAULT NULL,
    realizado_por VARCHAR(200), -- Taller o mecánico
    
    -- Documentación
    factura_numero VARCHAR(50),
    adjuntos JSON DEFAULT NULL, -- Array de rutas de archivos
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    actualizado_por INT,
    
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_mantenimiento_id) REFERENCES TiposMantenimiento(id) ON DELETE RESTRICT,
    FOREIGN KEY (creado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES Usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_tipo (tipo_mantenimiento_id),
    INDEX idx_fecha (fecha_realizado),
    INDEX idx_proximo_km (proximo_kilometraje),
    INDEX idx_proxima_fecha (proxima_fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: MantenimientosPendientes (Vista Materializada)
-- ============================================================================
-- Mantenimientos pendientes o próximos con estado de alerta
-- ============================================================================

CREATE TABLE IF NOT EXISTS MantenimientosPendientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    tipo_mantenimiento_id INT NOT NULL,
    
    -- Último mantenimiento
    ultimo_mantenimiento_id INT DEFAULT NULL,
    ultimo_mantenimiento_fecha DATE DEFAULT NULL,
    ultimo_mantenimiento_km INT DEFAULT NULL,
    
    -- Próximo mantenimiento
    proximo_kilometraje INT DEFAULT NULL,
    proxima_fecha DATE DEFAULT NULL,
    
    -- Estado de alerta (calculado dinámicamente)
    estado_km ENUM('ok', 'proximo', 'vencido') DEFAULT 'ok',
    estado_fecha ENUM('ok', 'proximo', 'vencido') DEFAULT 'ok',
    
    -- Diferencias para ordenamiento
    km_restantes INT DEFAULT NULL,
    dias_restantes INT DEFAULT NULL,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_mantenimiento_id) REFERENCES TiposMantenimiento(id) ON DELETE CASCADE,
    FOREIGN KEY (ultimo_mantenimiento_id) REFERENCES MantenimientosVehiculo(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_vehiculo_tipo (vehiculo_id, tipo_mantenimiento_id),
    INDEX idx_estado_km (estado_km),
    INDEX idx_estado_fecha (estado_fecha),
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_km_restantes (km_restantes),
    INDEX idx_dias_restantes (dias_restantes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRIGGER: Calcular próximo mantenimiento al insertar
-- ============================================================================

DELIMITER $$

CREATE TRIGGER after_mantenimiento_insert
AFTER INSERT ON MantenimientosVehiculo
FOR EACH ROW
BEGIN
    DECLARE v_frecuencia_km INT;
    DECLARE v_frecuencia_meses INT;
    DECLARE v_prioridad VARCHAR(20);
    
    -- Obtener frecuencias del tipo de mantenimiento
    SELECT frecuencia_km, frecuencia_meses, prioridad
    INTO v_frecuencia_km, v_frecuencia_meses, v_prioridad
    FROM TiposMantenimiento
    WHERE id = NEW.tipo_mantenimiento_id;
    
    -- Calcular próximo mantenimiento
    UPDATE MantenimientosVehiculo
    SET 
        proximo_kilometraje = CASE 
            WHEN v_frecuencia_km IS NOT NULL THEN NEW.kilometraje_realizado + v_frecuencia_km
            ELSE NULL
        END,
        proxima_fecha = CASE 
            WHEN v_frecuencia_meses IS NOT NULL THEN DATE_ADD(NEW.fecha_realizado, INTERVAL v_frecuencia_meses MONTH)
            ELSE NULL
        END
    WHERE id = NEW.id;
    
    -- Actualizar MantenimientosPendientes
    INSERT INTO MantenimientosPendientes (
        vehiculo_id,
        tipo_mantenimiento_id,
        ultimo_mantenimiento_id,
        ultimo_mantenimiento_fecha,
        ultimo_mantenimiento_km,
        proximo_kilometraje,
        proxima_fecha
    ) VALUES (
        NEW.vehiculo_id,
        NEW.tipo_mantenimiento_id,
        NEW.id,
        NEW.fecha_realizado,
        NEW.kilometraje_realizado,
        CASE WHEN v_frecuencia_km IS NOT NULL THEN NEW.kilometraje_realizado + v_frecuencia_km ELSE NULL END,
        CASE WHEN v_frecuencia_meses IS NOT NULL THEN DATE_ADD(NEW.fecha_realizado, INTERVAL v_frecuencia_meses MONTH) ELSE NULL END
    )
    ON DUPLICATE KEY UPDATE
        ultimo_mantenimiento_id = NEW.id,
        ultimo_mantenimiento_fecha = NEW.fecha_realizado,
        ultimo_mantenimiento_km = NEW.kilometraje_realizado,
        proximo_kilometraje = CASE WHEN v_frecuencia_km IS NOT NULL THEN NEW.kilometraje_realizado + v_frecuencia_km ELSE proximo_kilometraje END,
        proxima_fecha = CASE WHEN v_frecuencia_meses IS NOT NULL THEN DATE_ADD(NEW.fecha_realizado, INTERVAL v_frecuencia_meses MONTH) ELSE proxima_fecha END;
    
    -- Crear notificación si el mantenimiento está próximo
    IF v_prioridad = 'critico' THEN
        INSERT INTO Notificaciones (
            usuario_id,
            tipo,
            titulo,
            mensaje,
            recurso_tipo,
            recurso_id
        )
        SELECT 
            u.id,
            'info',
            'Mantenimiento registrado',
            CONCAT('Se ha registrado un mantenimiento de tipo ', 
                   (SELECT nombre FROM TiposMantenimiento WHERE id = NEW.tipo_mantenimiento_id),
                   ' para el vehículo ', v.matricula),
            'mantenimiento',
            NEW.id
        FROM Vehiculos v
        INNER JOIN Usuario_Roles_Alcance ura ON (v.unidad_id = ura.unidad_destino_id OR es_unidad_descendiente(v.unidad_id, ura.unidad_destino_id))
        INNER JOIN Usuarios u ON ura.usuario_id = u.id
        INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
        INNER JOIN Permisos p ON rp.permiso_id = p.id
        WHERE v.id = NEW.vehiculo_id
          AND p.accion IN ('maintenance:manage', 'vehicles:manage')
          AND u.activo = 1;
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- EVENT: Actualizar estados de alertas diariamente
-- ============================================================================

DELIMITER $$

CREATE EVENT IF NOT EXISTS actualizar_estados_mantenimientos
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 6 HOUR) -- 6:00 AM cada día
DO
BEGIN
    -- Actualizar estados basados en kilómetros actuales
    UPDATE MantenimientosPendientes mp
    INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
    INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
    SET 
        mp.km_restantes = CASE 
            WHEN mp.proximo_kilometraje IS NOT NULL THEN mp.proximo_kilometraje - v.kilometraje
            ELSE NULL
        END,
        mp.estado_km = CASE
            WHEN mp.proximo_kilometraje IS NULL THEN 'ok'
            WHEN v.kilometraje >= mp.proximo_kilometraje THEN 'vencido'
            WHEN v.kilometraje >= (mp.proximo_kilometraje - tm.margen_km_aviso) THEN 'proximo'
            ELSE 'ok'
        END;
    
    -- Actualizar estados basados en fechas
    UPDATE MantenimientosPendientes mp
    INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
    SET 
        mp.dias_restantes = CASE 
            WHEN mp.proxima_fecha IS NOT NULL THEN DATEDIFF(mp.proxima_fecha, CURDATE())
            ELSE NULL
        END,
        mp.estado_fecha = CASE
            WHEN mp.proxima_fecha IS NULL THEN 'ok'
            WHEN CURDATE() >= mp.proxima_fecha THEN 'vencido'
            WHEN CURDATE() >= DATE_SUB(mp.proxima_fecha, INTERVAL tm.margen_dias_aviso DAY) THEN 'proximo'
            ELSE 'ok'
        END;
END$$

DELIMITER ;

-- ============================================================================
-- EVENT: Generar notificaciones de mantenimientos vencidos
-- ============================================================================

DELIMITER $$

CREATE EVENT IF NOT EXISTS notificar_mantenimientos_vencidos
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 7 HOUR) -- 7:00 AM cada día
DO
BEGIN
    -- Notificar mantenimientos vencidos por kilómetros
    INSERT INTO Notificaciones (usuario_id, tipo, titulo, mensaje, recurso_tipo, recurso_id)
    SELECT DISTINCT
        u.id,
        'error',
        'Mantenimiento vencido',
        CONCAT('El vehículo ', v.matricula, ' tiene vencido el mantenimiento de ',
               tm.nombre, '. Km actuales: ', v.kilometraje, ', Km esperados: ', mp.proximo_kilometraje),
        'mantenimiento_pendiente',
        mp.id
    FROM MantenimientosPendientes mp
    INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
    INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
    INNER JOIN Usuario_Roles_Alcance ura ON (v.unidad_id = ura.unidad_destino_id OR es_unidad_descendiente(v.unidad_id, ura.unidad_destino_id))
    INNER JOIN Usuarios u ON ura.usuario_id = u.id
    INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
    INNER JOIN Permisos p ON rp.permiso_id = p.id
    WHERE mp.estado_km = 'vencido'
      AND p.accion IN ('maintenance:manage', 'vehicles:manage')
      AND u.activo = 1
      AND tm.activo = 1
      -- Evitar duplicados (solo notificar una vez al día)
      AND NOT EXISTS (
          SELECT 1 FROM Notificaciones n2
          WHERE n2.usuario_id = u.id
            AND n2.recurso_tipo = 'mantenimiento_pendiente'
            AND n2.recurso_id = mp.id
            AND DATE(n2.created_at) = CURDATE()
      );
    
    -- Notificar mantenimientos vencidos por fecha
    INSERT INTO Notificaciones (usuario_id, tipo, titulo, mensaje, recurso_tipo, recurso_id)
    SELECT DISTINCT
        u.id,
        'error',
        'Mantenimiento vencido por fecha',
        CONCAT('El vehículo ', v.matricula, ' tiene vencido el mantenimiento de ',
               tm.nombre, '. Fecha esperada: ', DATE_FORMAT(mp.proxima_fecha, '%d/%m/%Y')),
        'mantenimiento_pendiente',
        mp.id
    FROM MantenimientosPendientes mp
    INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
    INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
    INNER JOIN Usuario_Roles_Alcance ura ON (v.unidad_id = ura.unidad_destino_id OR es_unidad_descendiente(v.unidad_id, ura.unidad_destino_id))
    INNER JOIN Usuarios u ON ura.usuario_id = u.id
    INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
    INNER JOIN Permisos p ON rp.permiso_id = p.id
    WHERE mp.estado_fecha = 'vencido'
      AND mp.estado_km != 'vencido' -- No duplicar si ya se notificó por km
      AND p.accion IN ('maintenance:manage', 'vehicles:manage')
      AND u.activo = 1
      AND tm.activo = 1
      -- Evitar duplicados
      AND NOT EXISTS (
          SELECT 1 FROM Notificaciones n2
          WHERE n2.usuario_id = u.id
            AND n2.recurso_tipo = 'mantenimiento_pendiente'
            AND n2.recurso_id = mp.id
            AND DATE(n2.created_at) = CURDATE()
      );
    
    -- Notificar mantenimientos próximos (solo warning)
    INSERT INTO Notificaciones (usuario_id, tipo, titulo, mensaje, recurso_tipo, recurso_id)
    SELECT DISTINCT
        u.id,
        'warning',
        'Mantenimiento próximo',
        CONCAT('El vehículo ', v.matricula, ' pronto necesitará mantenimiento de ',
               tm.nombre, '. Quedan ', 
               COALESCE(CONCAT(mp.km_restantes, ' km'), CONCAT(mp.dias_restantes, ' días'))),
        'mantenimiento_pendiente',
        mp.id
    FROM MantenimientosPendientes mp
    INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
    INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
    INNER JOIN Usuario_Roles_Alcance ura ON (v.unidad_id = ura.unidad_destino_id OR es_unidad_descendiente(v.unidad_id, ura.unidad_destino_id))
    INNER JOIN Usuarios u ON ura.usuario_id = u.id
    INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
    INNER JOIN Permisos p ON rp.permiso_id = p.id
    WHERE (mp.estado_km = 'proximo' OR mp.estado_fecha = 'proximo')
      AND mp.estado_km != 'vencido'
      AND mp.estado_fecha != 'vencido'
      AND p.accion IN ('maintenance:manage', 'vehicles:manage')
      AND u.activo = 1
      AND tm.activo = 1
      -- Solo una notificación a la semana para próximos
      AND NOT EXISTS (
          SELECT 1 FROM Notificaciones n2
          WHERE n2.usuario_id = u.id
            AND n2.recurso_tipo = 'mantenimiento_pendiente'
            AND n2.recurso_id = mp.id
            AND n2.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      );
END$$

DELIMITER ;

-- ============================================================================
-- DATOS INICIALES: Tipos de Mantenimiento
-- ============================================================================

INSERT INTO TiposMantenimiento (nombre, descripcion, frecuencia_km, frecuencia_meses, categoria, prioridad, costo_estimado, duracion_estimada_minutos, creado_por) VALUES
-- Filtros y aceite
('Aceite + Filtro', 'Cambio de aceite y filtro de aceite', 12500, 12, 'motor', 'importante', 60.00, 30, 1),
('Filtro Aire', 'Sustitución de filtro de aire del motor', 17500, NULL, 'filtros', 'normal', 20.00, 15, 1),
('Filtro Habitáculo', 'Cambio de filtro de habitáculo (polen)', 17500, 12, 'filtros', 'normal', 25.00, 15, 1),
('Filtro Combustible', 'Sustitución de filtro de combustible', 45000, NULL, 'filtros', 'importante', 35.00, 30, 1),

-- Fluidos
('Refrigerante', 'Cambio de líquido refrigerante', NULL, 36, 'fluidos', 'importante', 50.00, 45, 1),
('Líquido Frenos', 'Renovación de líquido de frenos', NULL, 24, 'fluidos', 'critico', 40.00, 30, 1),

-- Frenos
('Pastillas Freno', 'Sustitución de pastillas de freno', 37500, NULL, 'frenos', 'critico', 120.00, 60, 1),
('Discos Freno', 'Cambio de discos de freno', 75000, NULL, 'frenos', 'critico', 180.00, 90, 1),

-- Neumáticos
('Neumáticos', 'Sustitución de neumáticos por desgaste o edad', 60000, 48, 'neumaticos', 'critico', 300.00, 60, 1),
('Rotación Neumáticos', 'Rotación de neumáticos para desgaste uniforme', 10000, NULL, 'neumaticos', 'normal', 25.00, 30, 1),
('Alineación + Equilibrado', 'Alineación y equilibrado de ruedas', 20000, NULL, 'neumaticos', 'normal', 45.00, 45, 1),

-- Eléctrico
('Batería', 'Revisión y eventual sustitución de batería', NULL, 36, 'electrico', 'importante', 100.00, 30, 1),

-- Motor
('Distribución', 'Cambio de kit de distribución', 115000, 84, 'motor', 'critico', 650.00, 240, 1),
('Bujías', 'Sustitución de bujías', 30000, NULL, 'motor', 'importante', 80.00, 45, 1),

-- General
('Revisión General', 'Revisión completa del vehículo (multisistema)', 22500, 12, 'general', 'importante', 150.00, 120, 1),
('Pre-ITV', 'Revisión pre-ITV completa', NULL, 24, 'general', 'importante', 80.00, 90, 1);

-- ============================================================================
-- PERMISOS DEL MÓDULO
-- ============================================================================

INSERT INTO Permisos (accion, descripcion, categoria, activo) VALUES
('maintenance:view', 'Ver mantenimientos de vehículos de la unidad', 'mantenimientos', 1),
('maintenance:view_all', 'Ver todos los mantenimientos del sistema', 'mantenimientos', 1),
('maintenance:create', 'Registrar nuevos mantenimientos', 'mantenimientos', 1),
('maintenance:edit', 'Editar mantenimientos existentes', 'mantenimientos', 1),
('maintenance:delete', 'Eliminar registros de mantenimientos', 'mantenimientos', 1),
('maintenance:manage', 'Gestión completa de mantenimientos', 'mantenimientos', 1),
('maintenance_types:view', 'Ver tipos de mantenimiento', 'mantenimientos', 1),
('maintenance_types:create', 'Crear tipos de mantenimiento', 'mantenimientos', 1),
('maintenance_types:edit', 'Editar tipos de mantenimiento', 'mantenimientos', 1),
('maintenance_types:delete', 'Eliminar tipos de mantenimiento', 'mantenimientos', 1);

-- Asignar permisos al Admin
SET @admin_rol_id = (SELECT id FROM Roles WHERE nombre = 'Admin Total' LIMIT 1);

INSERT INTO Roles_Permisos (rol_id, permiso_id)
SELECT @admin_rol_id, id FROM Permisos 
WHERE categoria = 'mantenimientos'
ON DUPLICATE KEY UPDATE rol_id = @admin_rol_id;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT '✅ Tabla TiposMantenimiento creada' AS resultado;
SELECT '✅ Tabla MantenimientosVehiculo creada' AS resultado;
SELECT '✅ Tabla MantenimientosPendientes creada' AS resultado;
SELECT '✅ Trigger after_mantenimiento_insert creado' AS resultado;
SELECT '✅ Event actualizar_estados_mantenimientos creado' AS resultado;
SELECT '✅ Event notificar_mantenimientos_vencidos creado' AS resultado;
SELECT '✅ 16 tipos de mantenimiento insertados' AS resultado;
SELECT '✅ 10 permisos del módulo creados' AS resultado;

SELECT 
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT 
    '📊 RESUMEN DEL MÓDULO DE MANTENIMIENTOS' AS '';
SELECT 
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

SELECT CONCAT('Tipos de mantenimiento: ', COUNT(*)) AS info
FROM TiposMantenimiento WHERE activo = 1;

SELECT CONCAT('Permisos del módulo: ', COUNT(*)) AS info
FROM Permisos WHERE categoria = 'mantenimientos';

SELECT 
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT 
    '✨ Módulo de Mantenimientos creado exitosamente' AS '';
