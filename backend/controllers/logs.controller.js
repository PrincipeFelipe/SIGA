// ============================================================================
// CONTROLADOR DE LOGS DE AUDITORÍA
// ============================================================================

const { query } = require('../config/database');

/**
 * Listar logs con filtros
 * Solo accesible para administradores
 */
const listar = async (req, res) => {
    try {
        const {
            usuario_id,
            accion,
            recurso_tipo,
            fecha_desde,
            fecha_hasta,
            ip_address,
            page = 1,
            limit = 50,
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        let sql = `
            SELECT 
                l.id,
                l.usuario_id,
                u.username,
                u.nombre_completo,
                l.accion,
                l.recurso_tipo,
                l.recurso_id,
                l.descripcion,
                l.detalles_json as detalles,
                l.ip_address,
                l.user_agent,
                l.created_at
            FROM Logs l
            LEFT JOIN Usuarios u ON l.usuario_id = u.id
            WHERE 1=1
        `;

        const params = [];

        // Filtro por usuario
        if (usuario_id) {
            sql += ' AND l.usuario_id = ?';
            params.push(usuario_id);
        }

        // Filtro por acción (CREATE, UPDATE, DELETE, LOGIN, etc.)
        if (accion) {
            sql += ' AND l.accion = ?';
            params.push(accion);
        }

        // Filtro por tipo de recurso (Usuario, Unidad, Rol, etc.)
        if (recurso_tipo) {
            sql += ' AND l.recurso_tipo = ?';
            params.push(recurso_tipo);
        }

        // Filtro por rango de fechas
        if (fecha_desde) {
            sql += ' AND l.created_at >= ?';
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ' AND l.created_at <= ?';
            params.push(fecha_hasta);
        }

        // Filtro por IP
        if (ip_address) {
            sql += ' AND l.ip_address = ?';
            params.push(ip_address);
        }

        // Ordenar por fecha
        const orderBy = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        sql += ` ORDER BY l.created_at ${orderBy}`;

        // Paginación
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const logs = await query(sql, params);

        // Contar total
        let countSql = 'SELECT COUNT(*) as total FROM Logs l WHERE 1=1';
        const countParams = [];

        if (usuario_id) {
            countSql += ' AND l.usuario_id = ?';
            countParams.push(usuario_id);
        }
        if (accion) {
            countSql += ' AND l.accion = ?';
            countParams.push(accion);
        }
        if (recurso_tipo) {
            countSql += ' AND l.recurso_tipo = ?';
            countParams.push(recurso_tipo);
        }
        if (fecha_desde) {
            countSql += ' AND l.created_at >= ?';
            countParams.push(fecha_desde);
        }
        if (fecha_hasta) {
            countSql += ' AND l.created_at <= ?';
            countParams.push(fecha_hasta);
        }
        if (ip_address) {
            countSql += ' AND l.ip_address = ?';
            countParams.push(ip_address);
        }

        const [{ total }] = await query(countSql, countParams);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: Number(total),
                pages: Math.ceil(Number(total) / limit)
            }
        });
    } catch (error) {
        console.error('❌ Error al listar logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener logs',
            error: error.message
        });
    }
};

/**
 * Obtener detalle de un log específico
 */
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [log] = await query(`
            SELECT 
                l.id,
                l.usuario_id,
                u.username,
                u.nombre_completo,
                l.accion,
                l.recurso_tipo,
                l.recurso_id,
                l.descripcion,
                l.detalles_json as detalles,
                l.ip_address,
                l.user_agent,
                l.created_at
            FROM Logs l
            LEFT JOIN Usuarios u ON l.usuario_id = u.id
            WHERE l.id = ?
        `, [id]);

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Log no encontrado'
            });
        }

        res.json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error('❌ Error al obtener log:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener log',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de logs
 */
const obtenerEstadisticas = async (req, res) => {
    try {
        const { fecha_desde, fecha_hasta } = req.query;

        let whereClause = '';
        const params = [];

        if (fecha_desde && fecha_hasta) {
            whereClause = 'WHERE created_at BETWEEN ? AND ?';
            params.push(fecha_desde, fecha_hasta);
        } else if (fecha_desde) {
            whereClause = 'WHERE created_at >= ?';
            params.push(fecha_desde);
        } else if (fecha_hasta) {
            whereClause = 'WHERE created_at <= ?';
            params.push(fecha_hasta);
        }

        // Total de logs
        const [{ total_logs }] = await query(
            `SELECT COUNT(*) as total_logs FROM Logs ${whereClause}`,
            params
        );

        // Logs por acción
        const logsPorAccion = await query(
            `SELECT accion, COUNT(*) as total FROM Logs ${whereClause} GROUP BY accion ORDER BY total DESC`,
            params
        );

        // Logs por tipo de recurso
        const logsPorRecurso = await query(
            `SELECT recurso_tipo, COUNT(*) as total FROM Logs ${whereClause} GROUP BY recurso_tipo ORDER BY total DESC`,
            params
        );

        // Usuarios más activos
        const usuariosMasActivos = await query(
            `SELECT 
                u.id, 
                u.username, 
                u.nombre_completo, 
                COUNT(l.id) as total_acciones
            FROM Logs l
            INNER JOIN Usuarios u ON l.usuario_id = u.id
            ${whereClause}
            GROUP BY u.id
            ORDER BY total_acciones DESC
            LIMIT 10`,
            params
        );

        // Actividad por día (últimos 7 días)
        const actividadPorDia = await query(`
            SELECT 
                DATE(created_at) as fecha,
                COUNT(*) as total
            FROM Logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY fecha DESC
        `);

        res.json({
            success: true,
            data: {
                total_logs,
                logs_por_accion: logsPorAccion,
                logs_por_recurso: logsPorRecurso,
                usuarios_mas_activos: usuariosMasActivos,
                actividad_por_dia: actividadPorDia
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

/**
 * Obtener logs de un recurso específico (historial)
 */
const obtenerPorRecurso = async (req, res) => {
    try {
        const { recurso_tipo, recurso_id } = req.params;
        const { limit = 50 } = req.query;

        const logs = await query(`
            SELECT 
                l.id,
                l.usuario_id,
                u.username,
                u.nombre_completo,
                l.accion,
                l.descripcion,
                l.detalles_json as detalles,
                l.ip_address,
                l.created_at
            FROM Logs l
            LEFT JOIN Usuarios u ON l.usuario_id = u.id
            WHERE l.recurso_tipo = ? AND l.recurso_id = ?
            ORDER BY l.created_at DESC
            LIMIT ?
        `, [recurso_tipo, recurso_id, parseInt(limit)]);

        res.json({
            success: true,
            data: {
                recurso: { tipo: recurso_tipo, id: recurso_id },
                historial: logs,
                total: logs.length
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener logs del recurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial del recurso',
            error: error.message
        });
    }
};

module.exports = {
    listar,
    obtenerPorId,
    obtenerEstadisticas,
    obtenerPorRecurso
};
