-- ============================================================================
-- ACTUALIZACIÓN DE TABLA TAREAS
-- ============================================================================
-- Fecha: 5 de noviembre de 2025
-- Cambios:
--   1. Agregar campo numero_registro (alfanumérico)
--   2. Eliminar campo progreso
-- ============================================================================

USE siga_db;

-- 1. Agregar campo numero_registro después de titulo
ALTER TABLE Tareas 
ADD COLUMN numero_registro VARCHAR(50) NULL COMMENT 'Número de registro alfanumérico (ej: 000000000x00X0000000-X)' 
AFTER titulo;

-- 2. Crear índice para numero_registro (único si no es NULL)
ALTER TABLE Tareas 
ADD UNIQUE INDEX idx_numero_registro (numero_registro);

-- 3. Eliminar campo progreso
ALTER TABLE Tareas 
DROP COLUMN progreso;

-- Verificar cambios
DESCRIBE Tareas;

SELECT 'Tabla Tareas actualizada correctamente' AS resultado;
