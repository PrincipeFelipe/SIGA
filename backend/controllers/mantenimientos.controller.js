const { query } = require('../config/database');

// ============================================================================
// CONTROLADOR DE MANTENIMIENTOS
// ============================================================================

/**
 * Obtener todos los mantenimientos con filtrado jerárquico
 */
exports.getAll = async (req, res) => {
    try {
        const { vehiculo_id, tipo_mantenimiento_id, fecha_desde, fecha_hasta, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const userId = req.user.id;

        // Verificar si tiene permiso para ver todos
        const permisoVerTodos = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ? AND p.accion = 'maintenance:view_all' AND p.activo = 1`,
            [userId]
        );

        const puedeVerTodos = permisoVerTodos[0].tiene_permiso > 0;

        let whereClause = 'WHERE 1=1';
        let params = [];

        // Filtrar por alcance jerárquico si no puede ver todos
        if (!puedeVerTodos) {
            const unidadesAcceso = await query(
                `WITH RECURSIVE unidades_accesibles AS (
                    SELECT DISTINCT ura.unidad_destino_id as unidad_id
                    FROM Usuario_Roles_Alcance ura
                    WHERE ura.usuario_id = ?
                    UNION
                    SELECT u.id
                    FROM Unidades u
                    INNER JOIN unidades_accesibles ua ON es_unidad_descendiente(u.id, ua.unidad_id)
                )
                SELECT DISTINCT unidad_id FROM unidades_accesibles`,
                [userId]
            );

            if (unidadesAcceso.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    total: 0,
                    page: parseInt(page),
                    totalPages: 0
                });
            }

            const unidadIds = unidadesAcceso.map(u => u.unidad_id);
            whereClause += ` AND v.unidad_id IN (${unidadIds.join(',')})`;
        }

        // Filtros adicionales
        if (vehiculo_id) {
            whereClause += ` AND mv.vehiculo_id = ?`;
            params.push(vehiculo_id);
        }

        if (tipo_mantenimiento_id) {
            whereClause += ` AND mv.tipo_mantenimiento_id = ?`;
            params.push(tipo_mantenimiento_id);
        }

        if (fecha_desde) {
            whereClause += ` AND mv.fecha_realizado >= ?`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            whereClause += ` AND mv.fecha_realizado <= ?`;
            params.push(fecha_hasta);
        }

        // Consulta principal
        const mantenimientos = await query(
            `SELECT 
                mv.*,
                v.matricula,
                v.marca,
                v.modelo,
                v.unidad_id,
                u.nombre as unidad_nombre,
                u.codigo_unidad,
                tm.nombre as tipo_nombre,
                tm.categoria,
                tm.prioridad,
                uc.nombre_completo as creador_nombre
            FROM MantenimientosVehiculo mv
            INNER JOIN Vehiculos v ON mv.vehiculo_id = v.id
            INNER JOIN Unidades u ON v.unidad_id = u.id
            INNER JOIN TiposMantenimiento tm ON mv.tipo_mantenimiento_id = tm.id
            LEFT JOIN Usuarios uc ON mv.creado_por = uc.id
            ${whereClause}
            ORDER BY mv.fecha_realizado DESC, mv.created_at DESC
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Contar total
        const totalResult = await query(
            `SELECT COUNT(*) as total
            FROM MantenimientosVehiculo mv
            INNER JOIN Vehiculos v ON mv.vehiculo_id = v.id
            ${whereClause}`,
            params
        );

        const total = totalResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: mantenimientos,
            total,
            page: parseInt(page),
            totalPages
        });

    } catch (error) {
        console.error('Error en getAll mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mantenimientos',
            error: error.message
        });
    }
};

/**
 * Obtener un mantenimiento por ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const mantenimientos = await query(
            `SELECT 
                mv.*,
                v.matricula,
                v.marca,
                v.modelo,
                v.unidad_id,
                u.nombre as unidad_nombre,
                tm.nombre as tipo_nombre,
                tm.categoria,
                tm.prioridad,
                uc.nombre_completo as creador_nombre,
                ua.nombre_completo as actualizador_nombre
            FROM MantenimientosVehiculo mv
            INNER JOIN Vehiculos v ON mv.vehiculo_id = v.id
            INNER JOIN Unidades u ON v.unidad_id = u.id
            INNER JOIN TiposMantenimiento tm ON mv.tipo_mantenimiento_id = tm.id
            LEFT JOIN Usuarios uc ON mv.creado_por = uc.id
            LEFT JOIN Usuarios ua ON mv.actualizado_por = ua.id
            WHERE mv.id = ?`,
            [id]
        );

        if (mantenimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mantenimiento no encontrado'
            });
        }

        res.json({
            success: true,
            data: mantenimientos[0]
        });

    } catch (error) {
        console.error('Error en getById mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mantenimiento',
            error: error.message
        });
    }
};

/**
 * Obtener mantenimientos de un vehículo
 */
exports.getByVehiculo = async (req, res) => {
    try {
        const { vehiculo_id } = req.params;
        const { tipo_mantenimiento_id } = req.query;

        let whereClause = 'WHERE mv.vehiculo_id = ?';
        let params = [vehiculo_id];

        if (tipo_mantenimiento_id) {
            whereClause += ' AND mv.tipo_mantenimiento_id = ?';
            params.push(tipo_mantenimiento_id);
        }

        const mantenimientos = await query(
            `SELECT 
                mv.*,
                tm.nombre as tipo_nombre,
                tm.categoria,
                tm.prioridad,
                uc.nombre_completo as creador_nombre
            FROM MantenimientosVehiculo mv
            INNER JOIN TiposMantenimiento tm ON mv.tipo_mantenimiento_id = tm.id
            LEFT JOIN Usuarios uc ON mv.creado_por = uc.id
            ${whereClause}
            ORDER BY mv.fecha_realizado DESC`,
            params
        );

        res.json({
            success: true,
            data: mantenimientos
        });

    } catch (error) {
        console.error('Error en getByVehiculo mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mantenimientos del vehículo',
            error: error.message
        });
    }
};

/**
 * Obtener mantenimientos pendientes
 */
exports.getPendientes = async (req, res) => {
    try {
        const { vehiculo_id, estado, prioridad, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const userId = req.user.id;

        // Verificar permisos
        const permisoVerTodos = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ? AND p.accion = 'maintenance:view_all' AND p.activo = 1`,
            [userId]
        );

        const puedeVerTodos = permisoVerTodos[0].tiene_permiso > 0;

        let whereClause = 'WHERE 1=1';
        let params = [];

        // Filtrar por alcance si no puede ver todos
        if (!puedeVerTodos) {
            const unidadesAcceso = await query(
                `WITH RECURSIVE unidades_accesibles AS (
                    SELECT DISTINCT ura.unidad_destino_id as unidad_id
                    FROM Usuario_Roles_Alcance ura
                    WHERE ura.usuario_id = ?
                    UNION
                    SELECT u.id
                    FROM Unidades u
                    INNER JOIN unidades_accesibles ua ON es_unidad_descendiente(u.id, ua.unidad_id)
                )
                SELECT DISTINCT unidad_id FROM unidades_accesibles`,
                [userId]
            );

            if (unidadesAcceso.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    total: 0,
                    page: parseInt(page),
                    totalPages: 0
                });
            }

            const unidadIds = unidadesAcceso.map(u => u.unidad_id);
            whereClause += ` AND v.unidad_id IN (${unidadIds.join(',')})`;
        }

        // Filtros
        if (vehiculo_id) {
            whereClause += ` AND mp.vehiculo_id = ?`;
            params.push(vehiculo_id);
        }

        if (estado === 'vencido') {
            whereClause += ` AND (mp.estado_km = 'vencido' OR mp.estado_fecha = 'vencido')`;
        } else if (estado === 'proximo') {
            whereClause += ` AND (mp.estado_km = 'proximo' OR mp.estado_fecha = 'proximo')`;
        } else if (estado === 'ok') {
            whereClause += ` AND mp.estado_km = 'ok' AND mp.estado_fecha = 'ok'`;
        }

        if (prioridad) {
            whereClause += ` AND tm.prioridad = ?`;
            params.push(prioridad);
        }

        // Consulta principal
        const pendientes = await query(
            `SELECT 
                mp.*,
                v.matricula,
                v.marca,
                v.modelo,
                v.kilometraje as kilometraje_actual,
                u.nombre as unidad_nombre,
                u.codigo_unidad,
                tm.nombre as tipo_nombre,
                tm.categoria,
                tm.prioridad,
                tm.frecuencia_km,
                tm.frecuencia_meses,
                CASE 
                    WHEN mp.estado_km = 'vencido' OR mp.estado_fecha = 'vencido' THEN 'vencido'
                    WHEN mp.estado_km = 'proximo' OR mp.estado_fecha = 'proximo' THEN 'proximo'
                    ELSE 'ok'
                END as estado_general
            FROM MantenimientosPendientes mp
            INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
            INNER JOIN Unidades u ON v.unidad_id = u.id
            INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
            ${whereClause}
            ORDER BY 
                CASE 
                    WHEN mp.estado_km = 'vencido' OR mp.estado_fecha = 'vencido' THEN 1
                    WHEN mp.estado_km = 'proximo' OR mp.estado_fecha = 'proximo' THEN 2
                    ELSE 3
                END,
                CASE tm.prioridad
                    WHEN 'critico' THEN 1
                    WHEN 'importante' THEN 2
                    ELSE 3
                END,
                COALESCE(mp.dias_restantes, 999999) ASC,
                COALESCE(mp.km_restantes, 999999) ASC
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Contar total
        const totalResult = await query(
            `SELECT COUNT(*) as total
            FROM MantenimientosPendientes mp
            INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
            INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
            ${whereClause}`,
            params
        );

        const total = totalResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: pendientes,
            total,
            page: parseInt(page),
            totalPages
        });

    } catch (error) {
        console.error('Error en getPendientes mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mantenimientos pendientes',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo mantenimiento
 */
exports.create = async (req, res) => {
    try {
        const {
            vehiculo_id,
            tipo_mantenimiento_id,
            fecha_realizado,
            kilometraje_realizado,
            observaciones,
            costo_real,
            realizado_por,
            factura_numero
        } = req.body;

        const userId = req.user.id;

        // Validaciones
        if (!vehiculo_id || !tipo_mantenimiento_id || !fecha_realizado || !kilometraje_realizado) {
            return res.status(400).json({
                success: false,
                message: 'Los campos vehículo, tipo, fecha y kilometraje son obligatorios'
            });
        }

        // Verificar que el vehículo existe
        const vehiculoExiste = await query(
            'SELECT COUNT(*) as count FROM Vehiculos WHERE id = ?',
            [vehiculo_id]
        );

        if (vehiculoExiste[0].count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Verificar que el tipo de mantenimiento existe
        const tipoExiste = await query(
            'SELECT COUNT(*) as count FROM TiposMantenimiento WHERE id = ? AND activo = 1',
            [tipo_mantenimiento_id]
        );

        if (tipoExiste[0].count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de mantenimiento no encontrado o inactivo'
            });
        }

        // Insertar mantenimiento (el trigger calculará automáticamente el próximo)
        const result = await query(
            `INSERT INTO MantenimientosVehiculo (
                vehiculo_id, tipo_mantenimiento_id, fecha_realizado, kilometraje_realizado,
                observaciones, costo_real, realizado_por, factura_numero, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehiculo_id,
                tipo_mantenimiento_id,
                fecha_realizado,
                kilometraje_realizado,
                observaciones || null,
                costo_real || null,
                realizado_por || null,
                factura_numero || null,
                userId
            ]
        );

        // Actualizar kilometraje del vehículo si es mayor
        await query(
            `UPDATE Vehiculos 
            SET kilometraje = GREATEST(kilometraje, ?)
            WHERE id = ?`,
            [kilometraje_realizado, vehiculo_id]
        );

        // Obtener el mantenimiento creado con toda la info
        const mantenimiento = await query(
            `SELECT 
                mv.*,
                v.matricula,
                tm.nombre as tipo_nombre
            FROM MantenimientosVehiculo mv
            INNER JOIN Vehiculos v ON mv.vehiculo_id = v.id
            INNER JOIN TiposMantenimiento tm ON mv.tipo_mantenimiento_id = tm.id
            WHERE mv.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Mantenimiento registrado exitosamente',
            data: mantenimiento[0]
        });

    } catch (error) {
        console.error('Error en create mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear mantenimiento',
            error: error.message
        });
    }
};

/**
 * Actualizar un mantenimiento
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fecha_realizado,
            kilometraje_realizado,
            observaciones,
            costo_real,
            realizado_por,
            factura_numero
        } = req.body;

        const userId = req.user.id;

        // Verificar que el mantenimiento existe
        const mantenimientoExiste = await query(
            'SELECT * FROM MantenimientosVehiculo WHERE id = ?',
            [id]
        );

        if (mantenimientoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mantenimiento no encontrado'
            });
        }

        // Actualizar
        await query(
            `UPDATE MantenimientosVehiculo SET
                fecha_realizado = COALESCE(?, fecha_realizado),
                kilometraje_realizado = COALESCE(?, kilometraje_realizado),
                observaciones = COALESCE(?, observaciones),
                costo_real = COALESCE(?, costo_real),
                realizado_por = COALESCE(?, realizado_por),
                factura_numero = COALESCE(?, factura_numero),
                actualizado_por = ?
            WHERE id = ?`,
            [
                fecha_realizado,
                kilometraje_realizado,
                observaciones,
                costo_real,
                realizado_por,
                factura_numero,
                userId,
                id
            ]
        );

        // Recalcular próximo mantenimiento si cambió la fecha o km
        if (fecha_realizado || kilometraje_realizado) {
            const mant = await query('SELECT * FROM MantenimientosVehiculo WHERE id = ?', [id]);
            const tipo = await query('SELECT * FROM TiposMantenimiento WHERE id = ?', [mant[0].tipo_mantenimiento_id]);

            await query(
                `UPDATE MantenimientosVehiculo
                SET 
                    proximo_kilometraje = CASE 
                        WHEN ? IS NOT NULL THEN ? + ?
                        ELSE proximo_kilometraje
                    END,
                    proxima_fecha = CASE 
                        WHEN ? IS NOT NULL THEN DATE_ADD(?, INTERVAL ? MONTH)
                        ELSE proxima_fecha
                    END
                WHERE id = ?`,
                [
                    tipo[0].frecuencia_km,
                    mant[0].kilometraje_realizado,
                    tipo[0].frecuencia_km,
                    tipo[0].frecuencia_meses,
                    mant[0].fecha_realizado,
                    tipo[0].frecuencia_meses,
                    id
                ]
            );
        }

        // Obtener mantenimiento actualizado
        const mantenimiento = await query(
            `SELECT 
                mv.*,
                v.matricula,
                tm.nombre as tipo_nombre
            FROM MantenimientosVehiculo mv
            INNER JOIN Vehiculos v ON mv.vehiculo_id = v.id
            INNER JOIN TiposMantenimiento tm ON mv.tipo_mantenimiento_id = tm.id
            WHERE mv.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Mantenimiento actualizado exitosamente',
            data: mantenimiento[0]
        });

    } catch (error) {
        console.error('Error en update mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar mantenimiento',
            error: error.message
        });
    }
};

/**
 * Eliminar un mantenimiento
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que existe
        const mantenimientoExiste = await query(
            'SELECT * FROM MantenimientosVehiculo WHERE id = ?',
            [id]
        );

        if (mantenimientoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mantenimiento no encontrado'
            });
        }

        await query('DELETE FROM MantenimientosVehiculo WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Mantenimiento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error en delete mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar mantenimiento',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de mantenimientos
 */
exports.getEstadisticas = async (req, res) => {
    try {
        const userId = req.user.id;

        // Verificar permisos
        const permisoVerTodos = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ? AND p.accion = 'maintenance:view_all' AND p.activo = 1`,
            [userId]
        );

        const puedeVerTodos = permisoVerTodos[0].tiene_permiso > 0;

        let whereClause = '';
        let params = [];

        if (!puedeVerTodos) {
            const unidadesAcceso = await query(
                `WITH RECURSIVE unidades_accesibles AS (
                    SELECT DISTINCT ura.unidad_destino_id as unidad_id
                    FROM Usuario_Roles_Alcance ura
                    WHERE ura.usuario_id = ?
                    UNION
                    SELECT u.id
                    FROM Unidades u
                    INNER JOIN unidades_accesibles ua ON es_unidad_descendiente(u.id, ua.unidad_id)
                )
                SELECT DISTINCT unidad_id FROM unidades_accesibles`,
                [userId]
            );

            if (unidadesAcceso.length > 0) {
                const unidadIds = unidadesAcceso.map(u => u.unidad_id);
                whereClause = ` AND v.unidad_id IN (${unidadIds.join(',')})`;
            }
        }

        // Estadísticas de mantenimientos pendientes
        const pendientes = await query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN mp.estado_km = 'vencido' OR mp.estado_fecha = 'vencido' THEN 1 ELSE 0 END) as vencidos,
                SUM(CASE WHEN mp.estado_km = 'proximo' OR mp.estado_fecha = 'proximo' THEN 1 ELSE 0 END) as proximos,
                SUM(CASE WHEN mp.estado_km = 'ok' AND mp.estado_fecha = 'ok' THEN 1 ELSE 0 END) as al_dia
            FROM MantenimientosPendientes mp
            INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
            WHERE 1=1 ${whereClause}`,
            params
        );

        // Mantenimientos por categoría
        const porCategoria = await query(
            `SELECT 
                tm.categoria,
                COUNT(*) as total,
                SUM(CASE WHEN mp.estado_km = 'vencido' OR mp.estado_fecha = 'vencido' THEN 1 ELSE 0 END) as vencidos
            FROM MantenimientosPendientes mp
            INNER JOIN Vehiculos v ON mp.vehiculo_id = v.id
            INNER JOIN TiposMantenimiento tm ON mp.tipo_mantenimiento_id = tm.id
            WHERE 1=1 ${whereClause}
            GROUP BY tm.categoria`,
            params
        );

        // Mantenimientos realizados últimos 30 días
        const realizados = await query(
            `SELECT COUNT(*) as total
            FROM MantenimientosVehiculo mv
            INNER JOIN Vehiculos v ON mv.vehiculo_id = v.id
            WHERE mv.fecha_realizado >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ${whereClause}`,
            params
        );

        res.json({
            success: true,
            data: {
                pendientes: pendientes[0],
                porCategoria,
                realizadosUltimoMes: realizados[0].total
            }
        });

    } catch (error) {
        console.error('Error en getEstadisticas mantenimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};
