const { query } = require('../config/database');

// ============================================================================
// CONTROLADOR DE TIPOS DE CITA
// ============================================================================

/**
 * Obtener todos los tipos de cita
 */
exports.getAll = async (req, res) => {
    try {
        const { activo } = req.query;

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (activo !== undefined) {
            whereClause += ' AND tc.activo = ?';
            params.push(activo === 'true' || activo === '1' ? 1 : 0);
        }

        const tipos = await query(
            `SELECT 
                tc.*,
                uc.nombre_completo as creador_nombre,
                ua.nombre_completo as actualizador_nombre
            FROM TiposCita tc
            LEFT JOIN Usuarios uc ON tc.creado_por = uc.id
            LEFT JOIN Usuarios ua ON tc.actualizado_por = ua.id
            ${whereClause}
            ORDER BY tc.orden ASC, tc.nombre ASC`,
            params
        );

        res.json({
            success: true,
            data: tipos
        });

    } catch (error) {
        console.error('Error en getAll tipos-cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de cita',
            error: error.message
        });
    }
};

/**
 * Obtener un tipo de cita por ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const tipos = await query(
            `SELECT 
                tc.*,
                uc.nombre_completo as creador_nombre,
                ua.nombre_completo as actualizador_nombre
            FROM TiposCita tc
            LEFT JOIN Usuarios uc ON tc.creado_por = uc.id
            LEFT JOIN Usuarios ua ON tc.actualizado_por = ua.id
            WHERE tc.id = ?`,
            [id]
        );

        if (tipos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cita no encontrado'
            });
        }

        res.json({
            success: true,
            data: tipos[0]
        });

    } catch (error) {
        console.error('Error en getById tipos-cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipo de cita',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo tipo de cita
 */
exports.create = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            duracion_minutos,
            color,
            orden,
            activo
        } = req.body;

        const userId = req.user.id;

        // Validaciones
        if (!nombre || !duracion_minutos) {
            return res.status(400).json({
                success: false,
                message: 'El nombre y la duración son obligatorios'
            });
        }

        if (duracion_minutos < 15 || duracion_minutos > 480) {
            return res.status(400).json({
                success: false,
                message: 'La duración debe estar entre 15 y 480 minutos'
            });
        }

        // Verificar que el nombre no exista
        const nombreExiste = await query(
            'SELECT COUNT(*) as count FROM TiposCita WHERE nombre = ?',
            [nombre]
        );

        if (nombreExiste[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un tipo de cita con ese nombre'
            });
        }

        // Obtener el siguiente orden si no se especifica
        let ordenFinal = orden;
        if (!ordenFinal) {
            const maxOrden = await query(
                'SELECT COALESCE(MAX(orden), 0) + 1 as siguiente_orden FROM TiposCita'
            );
            ordenFinal = maxOrden[0].siguiente_orden;
        }

        // Insertar tipo de cita
        const result = await query(
            `INSERT INTO TiposCita (
                nombre, descripcion, duracion_minutos, color, orden, activo, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre,
                descripcion || null,
                duracion_minutos,
                color || '#3B82F6',
                ordenFinal,
                activo !== undefined ? activo : 1,
                userId
            ]
        );

        // Obtener el tipo de cita creado
        const tipo = await query(
            'SELECT * FROM TiposCita WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Tipo de cita creado exitosamente',
            data: tipo[0]
        });

    } catch (error) {
        console.error('Error en create tipos-cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear tipo de cita',
            error: error.message
        });
    }
};

/**
 * Actualizar un tipo de cita
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            duracion_minutos,
            color,
            orden,
            activo
        } = req.body;

        const userId = req.user.id;

        // Verificar que el tipo de cita existe
        const tipoExiste = await query(
            'SELECT * FROM TiposCita WHERE id = ?',
            [id]
        );

        if (tipoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cita no encontrado'
            });
        }

        // Si se cambia el nombre, verificar que no exista otro con ese nombre
        if (nombre && nombre !== tipoExiste[0].nombre) {
            const nombreExiste = await query(
                'SELECT COUNT(*) as count FROM TiposCita WHERE nombre = ? AND id != ?',
                [nombre, id]
            );

            if (nombreExiste[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro tipo de cita con ese nombre'
                });
            }
        }

        // Validar duración si se proporciona
        if (duracion_minutos && (duracion_minutos < 15 || duracion_minutos > 480)) {
            return res.status(400).json({
                success: false,
                message: 'La duración debe estar entre 15 y 480 minutos'
            });
        }

        // Actualizar tipo de cita
        await query(
            `UPDATE TiposCita SET
                nombre = COALESCE(?, nombre),
                descripcion = ?,
                duracion_minutos = COALESCE(?, duracion_minutos),
                color = COALESCE(?, color),
                orden = COALESCE(?, orden),
                activo = COALESCE(?, activo),
                actualizado_por = ?
            WHERE id = ?`,
            [
                nombre,
                descripcion !== undefined ? descripcion : null,
                duracion_minutos,
                color,
                orden,
                activo,
                userId,
                id
            ]
        );

        // Obtener el tipo de cita actualizado
        const tipo = await query(
            'SELECT * FROM TiposCita WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Tipo de cita actualizado exitosamente',
            data: tipo[0]
        });

    } catch (error) {
        console.error('Error en update tipos-cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar tipo de cita',
            error: error.message
        });
    }
};

/**
 * Eliminar un tipo de cita
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el tipo de cita existe
        const tipoExiste = await query(
            'SELECT * FROM TiposCita WHERE id = ?',
            [id]
        );

        if (tipoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cita no encontrado'
            });
        }

        // Verificar si tiene citas asociadas
        const citasAsociadas = await query(
            'SELECT COUNT(*) as count FROM Citas WHERE tipo_cita_id = ?',
            [id]
        );

        if (citasAsociadas[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el tipo de cita porque tiene citas asociadas. Considera desactivarlo en su lugar.'
            });
        }

        // Eliminar tipo de cita
        await query('DELETE FROM TiposCita WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Tipo de cita eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error en delete tipos-cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar tipo de cita',
            error: error.message
        });
    }
};

/**
 * Obtener tipos de cita activos (para selección en formularios)
 */
exports.getActivos = async (req, res) => {
    try {
        const tipos = await query(
            `SELECT id, nombre, descripcion, duracion_minutos, color, orden
            FROM TiposCita
            WHERE activo = 1
            ORDER BY orden ASC, nombre ASC`
        );

        res.json({
            success: true,
            data: tipos
        });

    } catch (error) {
        console.error('Error en getActivos tipos-cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de cita activos',
            error: error.message
        });
    }
};
