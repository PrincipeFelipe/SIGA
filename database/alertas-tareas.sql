-- ============================================================================
-- SISTEMA DE ALERTAS PARA TAREAS
-- ============================================================================
-- Fecha: 10 de noviembre de 2025
-- Descripción: Triggers y procedimientos para notificaciones automáticas
-- ============================================================================

USE siga_db;

-- ============================================================================
-- PROCEDIMIENTO: Crear notificación
-- ============================================================================
DROP PROCEDURE IF EXISTS crear_notificacion_tarea;

DELIMITER //

CREATE PROCEDURE crear_notificacion_tarea(
    IN p_usuario_id INT,
    IN p_titulo VARCHAR(255),
    IN p_mensaje TEXT,
    IN p_tipo ENUM('info', 'warning', 'error', 'success'),
    IN p_url VARCHAR(255)
)
BEGIN
    INSERT INTO Notificaciones (usuario_id, titulo, mensaje, tipo, url)
    VALUES (p_usuario_id, p_titulo, p_mensaje, p_tipo, p_url);
END//

DELIMITER ;

-- ============================================================================
-- TRIGGER: Notificar cuando se crea una tarea
-- ============================================================================
DROP TRIGGER IF EXISTS after_tarea_insert;

DELIMITER //

CREATE TRIGGER after_tarea_insert
AFTER INSERT ON Tareas
FOR EACH ROW
BEGIN
    DECLARE v_usuario_nombre VARCHAR(255);
    DECLARE v_asignador_nombre VARCHAR(255);
    DECLARE v_titulo_notif VARCHAR(255);
    DECLARE v_mensaje TEXT;
    
    -- Obtener nombre del usuario asignado
    SELECT nombre_completo INTO v_usuario_nombre
    FROM Usuarios WHERE id = NEW.asignado_a;
    
    -- Obtener nombre del usuario que asignó
    SELECT nombre_completo INTO v_asignador_nombre
    FROM Usuarios WHERE id = NEW.asignado_por;
    
    -- Crear título de notificación
    SET v_titulo_notif = CONCAT('Nueva tarea asignada: ', NEW.titulo);
    
    -- Crear mensaje
    SET v_mensaje = CONCAT(
        v_asignador_nombre, 
        ' te ha asignado una nueva tarea',
        IF(NEW.es_241 = 1, ' (Procedimiento 24.1 - 90 días)', ''),
        '. ',
        'Prioridad: ', NEW.prioridad,
        '. Fecha límite: ', DATE_FORMAT(NEW.fecha_limite, '%d/%m/%Y')
    );
    
    -- Crear notificación para el usuario asignado
    -- Solo si no es auto-asignación
    IF NEW.asignado_a != NEW.asignado_por THEN
        CALL crear_notificacion_tarea(
            NEW.asignado_a,
            v_titulo_notif,
            v_mensaje,
            CASE NEW.prioridad
                WHEN 'urgente' THEN 'error'
                WHEN 'alta' THEN 'warning'
                ELSE 'info'
            END,
            CONCAT('/tareas/', NEW.id)
        );
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- TRIGGER: Notificar cuando se reasigna una tarea
-- ============================================================================
DROP TRIGGER IF EXISTS after_tarea_update;

DELIMITER //

CREATE TRIGGER after_tarea_update
AFTER UPDATE ON Tareas
FOR EACH ROW
BEGIN
    DECLARE v_usuario_nombre VARCHAR(255);
    DECLARE v_titulo_notif VARCHAR(255);
    DECLARE v_mensaje TEXT;
    
    -- Si cambió el usuario asignado
    IF OLD.asignado_a != NEW.asignado_a THEN
        -- Obtener nombre del nuevo usuario asignado
        SELECT nombre_completo INTO v_usuario_nombre
        FROM Usuarios WHERE id = NEW.asignado_a;
        
        SET v_titulo_notif = CONCAT('Tarea reasignada: ', NEW.titulo);
        SET v_mensaje = CONCAT(
            'Se te ha reasignado la tarea: ', NEW.titulo,
            '. Prioridad: ', NEW.prioridad,
            '. Fecha límite: ', DATE_FORMAT(NEW.fecha_limite, '%d/%m/%Y')
        );
        
        -- Notificar al nuevo usuario asignado
        CALL crear_notificacion_tarea(
            NEW.asignado_a,
            v_titulo_notif,
            v_mensaje,
            'warning',
            CONCAT('/tareas/', NEW.id)
        );
        
        -- Notificar al usuario anterior (opcional)
        IF OLD.asignado_a != NEW.asignado_por THEN
            CALL crear_notificacion_tarea(
                OLD.asignado_a,
                CONCAT('Tarea reasignada: ', NEW.titulo),
                CONCAT('La tarea "', NEW.titulo, '" ha sido reasignada a otro usuario.'),
                'info',
                CONCAT('/tareas/', NEW.id)
            );
        END IF;
    END IF;
    
    -- Si cambió el estado a completada
    IF OLD.estado != 'completada' AND NEW.estado = 'completada' THEN
        -- Notificar al usuario que asignó la tarea
        IF NEW.asignado_por != NEW.asignado_a THEN
            SELECT nombre_completo INTO v_usuario_nombre
            FROM Usuarios WHERE id = NEW.asignado_a;
            
            CALL crear_notificacion_tarea(
                NEW.asignado_por,
                CONCAT('Tarea completada: ', NEW.titulo),
                CONCAT(v_usuario_nombre, ' ha completado la tarea "', NEW.titulo, '"'),
                'success',
                CONCAT('/tareas/', NEW.id)
            );
        END IF;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- EVENTO: Verificar tareas próximas a vencer
-- ============================================================================
-- Se ejecuta diariamente para enviar alertas de tareas próximas a vencer
-- ============================================================================

-- Activar el event scheduler si no está activado
SET GLOBAL event_scheduler = ON;

-- Eliminar evento si existe
DROP EVENT IF EXISTS check_tareas_proximas_vencer;

DELIMITER //

CREATE EVENT check_tareas_proximas_vencer
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 8 HOUR) -- 8:00 AM
DO
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_tarea_id INT;
    DECLARE v_usuario_id INT;
    DECLARE v_titulo VARCHAR(255);
    DECLARE v_dias_restantes INT;
    DECLARE v_prioridad VARCHAR(20);
    
    -- Cursor para tareas que vencen en 3 días o menos
    DECLARE cur CURSOR FOR
        SELECT 
            id,
            asignado_a,
            titulo,
            DATEDIFF(fecha_limite, CURDATE()) as dias_restantes,
            prioridad
        FROM Tareas
        WHERE estado NOT IN ('completada', 'cancelada')
          AND DATEDIFF(fecha_limite, CURDATE()) BETWEEN 0 AND 3
          AND DATEDIFF(fecha_limite, CURDATE()) >= 0;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_tarea_id, v_usuario_id, v_titulo, v_dias_restantes, v_prioridad;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Crear notificación de alerta
        CALL crear_notificacion_tarea(
            v_usuario_id,
            CONCAT('⚠️ Tarea próxima a vencer: ', v_titulo),
            CONCAT(
                'La tarea "', v_titulo, '" vence en ',
                v_dias_restantes, 
                IF(v_dias_restantes = 1, ' día', ' días'),
                '. Por favor, complétala antes de la fecha límite.'
            ),
            CASE 
                WHEN v_dias_restantes = 0 THEN 'error'
                WHEN v_dias_restantes <= 1 THEN 'error'
                ELSE 'warning'
            END,
            CONCAT('/tareas/', v_tarea_id)
        );
    END LOOP;
    
    CLOSE cur;
END//

DELIMITER ;

-- ============================================================================
-- EVENTO: Verificar tareas vencidas
-- ============================================================================
-- Se ejecuta diariamente para enviar alertas de tareas vencidas
-- ============================================================================

DROP EVENT IF EXISTS check_tareas_vencidas;

DELIMITER //

CREATE EVENT check_tareas_vencidas
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 9 HOUR) -- 9:00 AM
DO
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_tarea_id INT;
    DECLARE v_usuario_id INT;
    DECLARE v_titulo VARCHAR(255);
    DECLARE v_dias_vencidos INT;
    
    -- Cursor para tareas vencidas (que vencieron ayer o antes)
    DECLARE cur CURSOR FOR
        SELECT 
            id,
            asignado_a,
            titulo,
            ABS(DATEDIFF(fecha_limite, CURDATE())) as dias_vencidos
        FROM Tareas
        WHERE estado NOT IN ('completada', 'cancelada')
          AND fecha_limite < CURDATE();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_tarea_id, v_usuario_id, v_titulo, v_dias_vencidos;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Crear notificación de alerta (solo una vez por día)
        -- Verificar si ya existe notificación de hoy
        IF NOT EXISTS (
            SELECT 1 FROM Notificaciones 
            WHERE usuario_id = v_usuario_id 
              AND titulo LIKE CONCAT('%', v_titulo, '%')
              AND DATE(created_at) = CURDATE()
        ) THEN
            CALL crear_notificacion_tarea(
                v_usuario_id,
                CONCAT('🔴 Tarea VENCIDA: ', v_titulo),
                CONCAT(
                    'La tarea "', v_titulo, '" está vencida desde hace ',
                    v_dias_vencidos,
                    IF(v_dias_vencidos = 1, ' día', ' días'),
                    '. Actualiza su estado o complétala urgentemente.'
                ),
                'error',
                CONCAT('/tareas/', v_tarea_id)
            );
        END IF;
    END LOOP;
    
    CLOSE cur;
END//

DELIMITER ;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'Procedimiento crear_notificacion_tarea creado' AS resultado;
SELECT 'Trigger after_tarea_insert creado' AS resultado;
SELECT 'Trigger after_tarea_update creado' AS resultado;
SELECT 'Evento check_tareas_proximas_vencer creado' AS resultado;
SELECT 'Evento check_tareas_vencidas creado' AS resultado;

-- Verificar que los eventos estén activos
SHOW EVENTS WHERE Db = 'siga_db';

-- Verificar estado del event scheduler
SHOW VARIABLES LIKE 'event_scheduler';

SELECT '✅ Sistema de alertas para tareas implementado correctamente' AS estado;
