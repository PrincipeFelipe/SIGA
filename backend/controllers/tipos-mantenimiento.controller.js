const { query } = require('../config/database');

// ============================================================================
// CONTROLADOR DE TIPOS DE MANTENIMIENTO
// ============================================================================

/**
 * Obtener todos los tipos de mantenimiento
 */
exports.getAll = async (req, res) => {
    try {
        const { activo, categoria } = req.query;

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (activo !== undefined) {
            whereClause += ' AND activo = ?';
            params.push(activo === 'true' || activo === '1' ? 1 : 0);
        }

        if (categoria) {
            whereClause += ' AND categoria = ?';
            params.push(categoria);
        }

        const tipos = await query(
            `SELECT 
                tm.*,
                uc.nombre_completo as creador_nombre,
                ua.nombre_completo as actualizador_nombre
            FROM TiposMantenimiento tm
            LEFT JOIN Usuarios uc ON tm.creado_por = uc.id
            LEFT JOIN Usuarios ua ON tm.actualizado_por = ua.id
            ${whereClause}
            ORDER BY tm.categoria ASC, tm.prioridad ASC, tm.nombre ASC`,
            params
        );

        res.json({
            success: true,
            data: tipos
        });

    } catch (error) {
        console.error('Error en getAll tipos mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de mantenimiento',
            error: error.message
        });
    }
};

/**
 * Obtener tipos activos (para selección)
 */
exports.getActivos = async (req, res) => {
    try {
        const tipos = await query(
            `SELECT id, nombre, descripcion, frecuencia_km, frecuencia_meses, 
                    categoria, prioridad, costo_estimado, duracion_estimada_minutos
            FROM TiposMantenimiento
            WHERE activo = 1
            ORDER BY categoria ASC, prioridad ASC, nombre ASC`
        );

        res.json({
            success: true,
            data: tipos
        });

    } catch (error) {
        console.error('Error en getActivos tipos mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos activos',
            error: error.message
        });
    }
};

/**
 * Obtener un tipo por ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const tipos = await query(
            `SELECT 
                tm.*,
                uc.nombre_completo as creador_nombre,
                ua.nombre_completo as actualizador_nombre
            FROM TiposMantenimiento tm
            LEFT JOIN Usuarios uc ON tm.creado_por = uc.id
            LEFT JOIN Usuarios ua ON tm.actualizado_por = ua.id
            WHERE tm.id = ?`,
            [id]
        );

        if (tipos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de mantenimiento no encontrado'
            });
        }

        res.json({
            success: true,
            data: tipos[0]
        });

    } catch (error) {
        console.error('Error en getById tipos mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipo de mantenimiento',
            error: error.message
        });
    }
};

/**
 * Crear un tipo de mantenimiento
 */
exports.create = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            frecuencia_km,
            margen_km_aviso,
            frecuencia_meses,
            margen_dias_aviso,
            prioridad,
            categoria,
            costo_estimado,
            duracion_estimada_minutos,
            activo
        } = req.body;

        const userId = req.user.id;

        // Validaciones
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio'
            });
        }

        // Al menos una frecuencia debe estar definida
        if (!frecuencia_km && !frecuencia_meses) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar al menos una frecuencia (kilómetros o meses)'
            });
        }

        // Verificar nombre único
        const nombreExiste = await query(
            'SELECT COUNT(*) as count FROM TiposMantenimiento WHERE nombre = ?',
            [nombre]
        );

        if (nombreExiste[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un tipo de mantenimiento con ese nombre'
            });
        }

        // Insertar
        const result = await query(
            `INSERT INTO TiposMantenimiento (
                nombre, descripcion, frecuencia_km, margen_km_aviso,
                frecuencia_meses, margen_dias_aviso, prioridad, categoria,
                costo_estimado, duracion_estimada_minutos, activo, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre,
                descripcion || null,
                frecuencia_km || null,
                margen_km_aviso || 1000,
                frecuencia_meses || null,
                margen_dias_aviso || 30,
                prioridad || 'normal',
                categoria || 'general',
                costo_estimado || null,
                duracion_estimada_minutos || 60,
                activo !== undefined ? activo : 1,
                userId
            ]
        );

        const tipo = await query(
            'SELECT * FROM TiposMantenimiento WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Tipo de mantenimiento creado exitosamente',
            data: tipo[0]
        });

    } catch (error) {
        console.error('Error en create tipos mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear tipo de mantenimiento',
            error: error.message
        });
    }
};

/**
 * Actualizar un tipo de mantenimiento
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            frecuencia_km,
            margen_km_aviso,
            frecuencia_meses,
            margen_dias_aviso,
            prioridad,
            categoria,
            costo_estimado,
            duracion_estimada_minutos,
            activo
        } = req.body;

        const userId = req.user.id;

        // Verificar que existe
        const tipoExiste = await query(
            'SELECT * FROM TiposMantenimiento WHERE id = ?',
            [id]
        );

        if (tipoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de mantenimiento no encontrado'
            });
        }

        // Verificar nombre único si se cambió
        if (nombre && nombre !== tipoExiste[0].nombre) {
            const nombreExiste = await query(
                'SELECT COUNT(*) as count FROM TiposMantenimiento WHERE nombre = ? AND id != ?',
                [nombre, id]
            );

            if (nombreExiste[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro tipo de mantenimiento con ese nombre'
                });
            }
        }

        // Actualizar
        await query(
            `UPDATE TiposMantenimiento SET
                nombre = COALESCE(?, nombre),
                descripcion = ?,
                frecuencia_km = ?,
                margen_km_aviso = COALESCE(?, margen_km_aviso),
                frecuencia_meses = ?,
                margen_dias_aviso = COALESCE(?, margen_dias_aviso),
                prioridad = COALESCE(?, prioridad),
                categoria = COALESCE(?, categoria),
                costo_estimado = ?,
                duracion_estimada_minutos = COALESCE(?, duracion_estimada_minutos),
                activo = COALESCE(?, activo),
                actualizado_por = ?
            WHERE id = ?`,
            [
                nombre,
                descripcion !== undefined ? descripcion : null,
                frecuencia_km !== undefined ? frecuencia_km : null,
                margen_km_aviso,
                frecuencia_meses !== undefined ? frecuencia_meses : null,
                margen_dias_aviso,
                prioridad,
                categoria,
                costo_estimado !== undefined ? costo_estimado : null,
                duracion_estimada_minutos,
                activo,
                userId,
                id
            ]
        );

        const tipo = await query(
            'SELECT * FROM TiposMantenimiento WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Tipo de mantenimiento actualizado exitosamente',
            data: tipo[0]
        });

    } catch (error) {
        console.error('Error en update tipos mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar tipo de mantenimiento',
            error: error.message
        });
    }
};

/**
 * Eliminar un tipo de mantenimiento
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que existe
        const tipoExiste = await query(
            'SELECT * FROM TiposMantenimiento WHERE id = ?',
            [id]
        );

        if (tipoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de mantenimiento no encontrado'
            });
        }

        // Verificar si tiene mantenimientos asociados
        const tieneMantenimientos = await query(
            'SELECT COUNT(*) as count FROM MantenimientosVehiculo WHERE tipo_mantenimiento_id = ?',
            [id]
        );

        if (tieneMantenimientos[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el tipo porque tiene mantenimientos registrados. Considera desactivarlo en su lugar.'
            });
        }

        await query('DELETE FROM TiposMantenimiento WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Tipo de mantenimiento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error en delete tipos mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar tipo de mantenimiento',
            error: error.message
        });
    }
};
