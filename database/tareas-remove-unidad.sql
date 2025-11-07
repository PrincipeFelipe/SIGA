-- ============================================================================
-- ELIMINACIÓN DE CAMPO UNIDAD_ID DE TAREAS
-- ============================================================================
-- Fecha: 6 de noviembre de 2025
-- Motivo: La unidad se obtiene del usuario asignado
-- ============================================================================

USE siga_db;

-- Eliminar foreign key constraint primero
ALTER TABLE Tareas 
DROP FOREIGN KEY Tareas_ibfk_3;

-- Eliminar campo unidad_id
ALTER TABLE Tareas 
DROP COLUMN unidad_id;

-- Verificar cambios
DESCRIBE Tareas;

SELECT 'Campo unidad_id eliminado correctamente de Tareas' AS resultado;
