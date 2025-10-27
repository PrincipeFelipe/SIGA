// ============================================================================
// CONTROLADOR DE NOTIFICACIONES
// ============================================================================

const { query } = require('../config/database');

/**
 * Listar notificaciones del usuario autenticado
 */
const listar = async (req, res) => {
    try {
        const { leida, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT 
                n.id,
                n.usuario_id,
                n.tipo,
                n.titulo,
                n.mensaje,
                n.leida,
                n.leida_at,
                n.url,
                n.created_at
            FROM Notificaciones n
            WHERE n.usuario_id = ?
        `;

        const params = [req.user.id];

        // Filtro por estado leída/no leída
        if (leida !== undefined) {
            sql += ' AND n.leida = ?';
            params.push(leida === 'true' || leida === '1' ? 1 : 0);
        }

        // Ordenar por más reciente primero
        sql += ' ORDER BY n.created_at DESC';

        // Paginación
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const notificaciones = await query(sql, params);

        // Contar total de notificaciones
        let countSql = 'SELECT COUNT(*) as total FROM Notificaciones WHERE usuario_id = ?';
        const countParams = [req.user.id];

        if (leida !== undefined) {
            countSql += ' AND leida = ?';
            countParams.push(leida === 'true' || leida === '1' ? 1 : 0);
        }

        const [{ total }] = await query(countSql, countParams);

        // Contar notificaciones no leídas
        const [{ no_leidas }] = await query(
            'SELECT COUNT(*) as no_leidas FROM Notificaciones WHERE usuario_id = ? AND leida = 0',
            [req.user.id]
        );

        res.json({
            success: true,
            data: notificaciones,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: Number(total),
                pages: Math.ceil(Number(total) / limit)
            },
            stats: {
                no_leidas: Number(no_leidas)
            }
        });
    } catch (error) {
        console.error('❌ Error al listar notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
};

/**
 * Obtener detalle de una notificación
 */
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [notificacion] = await query(
            'SELECT * FROM Notificaciones WHERE id = ? AND usuario_id = ?',
            [id, req.user.id]
        );

        if (!notificacion) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }

        res.json({
            success: true,
            data: notificacion
        });
    } catch (error) {
        console.error('❌ Error al obtener notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificación',
            error: error.message
        });
    }
};

/**
 * Marcar notificación como leída
 */
const marcarComoLeida = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la notificación existe y pertenece al usuario
        const [notificacion] = await query(
            'SELECT id, leida FROM Notificaciones WHERE id = ? AND usuario_id = ?',
            [id, req.user.id]
        );

        if (!notificacion) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }

        if (notificacion.leida) {
            return res.json({
                success: true,
                message: 'La notificación ya estaba marcada como leída'
            });
        }

        // Marcar como leída
        await query(
            'UPDATE Notificaciones SET leida = 1, fecha_leida = NOW() WHERE id = ?',
            [id]
        );

        // Obtener notificación actualizada
        const [actualizada] = await query(
            'SELECT * FROM Notificaciones WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Notificación marcada como leída',
            data: actualizada
        });
    } catch (error) {
        console.error('❌ Error al marcar notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar notificación como leída',
            error: error.message
        });
    }
};

/**
 * Marcar todas las notificaciones como leídas
 */
const marcarTodasComoLeidas = async (req, res) => {
    try {
        const result = await query(
            'UPDATE Notificaciones SET leida = 1, fecha_leida = NOW() WHERE usuario_id = ? AND leida = 0',
            [req.user.id]
        );

        res.json({
            success: true,
            message: `${result.affectedRows} notificación(es) marcada(s) como leída(s)`
        });
    } catch (error) {
        console.error('❌ Error al marcar todas las notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar todas las notificaciones',
            error: error.message
        });
    }
};

/**
 * Eliminar notificación
 */
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la notificación existe y pertenece al usuario
        const [notificacion] = await query(
            'SELECT id FROM Notificaciones WHERE id = ? AND usuario_id = ?',
            [id, req.user.id]
        );

        if (!notificacion) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }

        await query('DELETE FROM Notificaciones WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Notificación eliminada'
        });
    } catch (error) {
        console.error('❌ Error al eliminar notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar notificación',
            error: error.message
        });
    }
};

/**
 * Obtener conteo de notificaciones no leídas
 */
const contarNoLeidas = async (req, res) => {
    try {
        const [{ total }] = await query(
            'SELECT COUNT(*) as total FROM Notificaciones WHERE usuario_id = ? AND leida = 0',
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                no_leidas: total
            }
        });
    } catch (error) {
        console.error('❌ Error al contar notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al contar notificaciones',
            error: error.message
        });
    }
};

module.exports = {
    listar,
    obtenerPorId,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminar,
    contarNoLeidas
};
