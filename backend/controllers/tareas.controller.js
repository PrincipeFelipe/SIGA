// ============================================================================
// CONTROLADOR DE TAREAS
// ============================================================================
// Gestión completa de tareas del equipo con soporte para 24.1
// ============================================================================

const db = require('../config/database');

/**
 * Listar tareas con filtros
 * GET /api/tareas
 */
async function listar(req, res) {
    const conn = await db.getConnection();
    
    try {
        const {
            search,
            estado,
            prioridad,
            es_241,
            asignado_a,
            asignado_por,
            unidad_id,
            fecha_desde,
            fecha_hasta,
            vencidas,
            mis_tareas,
            page = 1,
            limit = 10
        } = req.query;

        const usuario_id = req.user.id;
        const offset = (page - 1) * limit;

        // Verificar si el usuario puede ver todas las tareas o solo las propias
        const { query: db_query } = require('../config/database');
        const permisoVerTodas = await db_query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ?
              AND p.accion = 'tasks:view_all'
              AND ura.activo = TRUE
              AND r.activo = TRUE
              AND p.activo = TRUE`,
            [usuario_id]
        );
        
        const puedeVerTodas = permisoVerTodas[0].tiene_permiso > 0;

        // Construir query base
        let whereConditions = [];
        let params = [];

        // Filtro por búsqueda
        if (search) {
            whereConditions.push('(t.titulo LIKE ? OR t.descripcion LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        // Filtro por estado
        if (estado) {
            whereConditions.push('t.estado = ?');
            params.push(estado);
        }

        // Filtro por prioridad
        if (prioridad) {
            whereConditions.push('t.prioridad = ?');
            params.push(prioridad);
        }

        // Filtro por 24.1
        if (es_241 !== undefined && es_241 !== '' && es_241 !== null) {
            whereConditions.push('t.es_241 = ?');
            params.push(es_241 === 'true' ? 1 : 0);
        }

        // Filtro por usuario asignado
        if (asignado_a) {
            whereConditions.push('t.asignado_a = ?');
            params.push(asignado_a);
        }

        // Filtro por quien asignó
        if (asignado_por) {
            whereConditions.push('t.asignado_por = ?');
            params.push(asignado_por);
        }

        // Filtro por unidad
        if (unidad_id) {
            whereConditions.push('t.unidad_id = ?');
            params.push(unidad_id);
        }

        // Filtro por rango de fechas
        if (fecha_desde) {
            whereConditions.push('t.fecha_inicio >= ?');
            params.push(fecha_desde);
        }
        if (fecha_hasta) {
            whereConditions.push('t.fecha_limite <= ?');
            params.push(fecha_hasta);
        }

        // Filtro por tareas vencidas
        if (vencidas === 'true') {
            whereConditions.push('t.fecha_limite < CURDATE()');
            whereConditions.push('t.estado NOT IN ("completada", "cancelada")');
        }

        // Filtro de mis tareas
        if (mis_tareas === 'true') {
            whereConditions.push('t.asignado_a = ?');
            params.push(usuario_id);
        } else if (!puedeVerTodas) {
            // Si no tiene permiso para ver todas, aplicar filtrado jerárquico
            // Obtener todas las unidades accesibles según el alcance del usuario
            const { obtenerUnidadesAccesibles } = require('../middleware/authorize');
            const unidadesAccesibles = await obtenerUnidadesAccesibles(usuario_id, 'tasks:view');
            
            if (unidadesAccesibles.length > 0) {
                // Ver tareas de usuarios en unidades accesibles O tareas propias
                const placeholders = unidadesAccesibles.map(() => '?').join(',');
                whereConditions.push(
                    `(ua.unidad_destino_id IN (${placeholders}) OR t.asignado_a = ? OR t.asignado_por = ?)`
                );
                params.push(...unidadesAccesibles, usuario_id, usuario_id);
            } else {
                // Sin alcance, solo ver tareas propias
                whereConditions.push('(t.asignado_a = ? OR t.asignado_por = ?)');
                params.push(usuario_id, usuario_id);
            }
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Query con toda la información
        const query = `
            SELECT 
                t.id,
                t.titulo,
                t.numero_registro,
                t.descripcion,
                t.prioridad,
                t.es_241,
                t.estado,
                t.fecha_inicio,
                t.fecha_limite,
                t.fecha_completada,
                DATEDIFF(t.fecha_limite, CURDATE()) AS dias_restantes,
                
                ua.id AS asignado_a_id,
                ua.username AS asignado_a_username,
                ua.nombre_completo AS asignado_a_nombre,
                ua_un.id AS unidad_id,
                ua_un.nombre AS unidad_nombre,
                ua_un.codigo_unidad,
                
                up.id AS asignado_por_id,
                up.username AS asignado_por_username,
                up.nombre_completo AS asignado_por_nombre,
                
                t.creado_en,
                t.actualizado_en
            FROM Tareas t
            INNER JOIN Usuarios ua ON t.asignado_a = ua.id
            INNER JOIN Usuarios up ON t.asignado_por = up.id
            LEFT JOIN Unidades ua_un ON ua.unidad_destino_id = ua_un.id
            ${whereClause}
            ORDER BY 
                CASE t.prioridad
                    WHEN 'urgente' THEN 1
                    WHEN 'alta' THEN 2
                    WHEN 'media' THEN 3
                    WHEN 'baja' THEN 4
                END,
                t.fecha_limite ASC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), parseInt(offset));

        const tareas = await conn.query(query, params);

        // Contar total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM Tareas t
            INNER JOIN Usuarios ua ON t.asignado_a = ua.id
            INNER JOIN Usuarios up ON t.asignado_por = up.id
            LEFT JOIN Unidades ua_un ON ua.unidad_destino_id = ua_un.id
            ${whereClause}
        `;

        const countResult = await conn.query(countQuery, params.slice(0, -2));
        const total = countResult[0]?.total || 0;

        // Deshabilitar caché para evitar problemas con permisos dinámicos
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.json({
            success: true,
            data: tareas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error al listar tareas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el listado de tareas'
        });
    } finally {
        conn.release();
    }
}

/**
 * Obtener una tarea por ID
 * GET /api/tareas/:id
 */
async function obtenerPorId(req, res) {
    const conn = await db.getConnection();
    
    try {
        const { id } = req.params;

        const tareas = await conn.query(`
            SELECT 
                t.*,
                ua.username AS asignado_a_username,
                ua.nombre_completo AS asignado_a_nombre,
                ua_un.id AS unidad_id,
                ua_un.nombre AS unidad_nombre,
                ua_un.codigo_unidad,
                up.username AS asignado_por_username,
                up.nombre_completo AS asignado_por_nombre,
                DATEDIFF(t.fecha_limite, CURDATE()) AS dias_restantes
            FROM Tareas t
            INNER JOIN Usuarios ua ON t.asignado_a = ua.id
            INNER JOIN Usuarios up ON t.asignado_por = up.id
            LEFT JOIN Unidades ua_un ON ua.unidad_destino_id = ua_un.id
            WHERE t.id = ?
        `, [id]);

        if (tareas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        // Obtener comentarios
        const comentarios = await conn.query(`
            SELECT 
                tc.id,
                tc.comentario,
                tc.creado_en,
                u.username AS usuario_username,
                u.nombre_completo AS usuario_nombre
            FROM Tareas_Comentarios tc
            INNER JOIN Usuarios u ON tc.usuario_id = u.id
            WHERE tc.tarea_id = ?
            ORDER BY tc.creado_en DESC
        `, [id]);

        // Obtener historial
        const historial = await conn.query(`
            SELECT 
                th.id,
                th.campo_modificado,
                th.valor_anterior,
                th.valor_nuevo,
                th.creado_en,
                u.username AS usuario_username,
                u.nombre_completo AS usuario_nombre
            FROM Tareas_Historial th
            INNER JOIN Usuarios u ON th.usuario_id = u.id
            WHERE th.tarea_id = ?
            ORDER BY th.creado_en DESC
            LIMIT 50
        `, [id]);

        const tarea = tareas[0];
        tarea.comentarios = comentarios;
        tarea.historial = historial;

        res.json({
            success: true,
            data: tarea
        });

    } catch (error) {
        console.error('Error al obtener tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la tarea'
        });
    } finally {
        conn.release();
    }
}

/**
 * Crear una nueva tarea
 * POST /api/tareas
 */
async function crear(req, res) {
    const conn = await db.getConnection();
    
    try {
        const {
            titulo,
            numero_registro,
            descripcion,
            asignado_a,
            prioridad = 'media',
            es_241 = false,
            fecha_inicio,
            fecha_limite,
            notas
        } = req.body;

        const usuario_id = req.user.id;

        // Validaciones
        if (!titulo || !asignado_a || !fecha_inicio) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: titulo, asignado_a, fecha_inicio'
            });
        }

        // Si NO es 24.1, fecha_limite es obligatoria
        if (!es_241 && !fecha_limite) {
            return res.status(400).json({
                success: false,
                message: 'La fecha límite es obligatoria cuando no es procedimiento 24.1'
            });
        }

        // Insertar tarea (el trigger calculará fecha_limite si es_241=true)
        const result = await conn.query(`
            INSERT INTO Tareas (
                titulo, numero_registro, descripcion, asignado_a, asignado_por,
                prioridad, es_241, fecha_inicio, fecha_limite, notas,
                estado, creado_por, actualizado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
        `, [
            titulo, 
            numero_registro || null,
            descripcion || null, 
            asignado_a, 
            usuario_id, 
            prioridad, 
            es_241, 
            fecha_inicio, 
            fecha_limite || null, 
            notas || null,
            usuario_id, 
            usuario_id
        ]);

        const tareaId = result.insertId;

        // Obtener la tarea creada (con fecha_limite calculada si es 24.1)
        const tareas = await conn.query(`
            SELECT 
                t.*,
                ua.nombre_completo AS asignado_a_nombre,
                ua_un.id AS unidad_id,
                ua_un.nombre AS unidad_nombre,
                ua_un.codigo_unidad,
                up.nombre_completo AS asignado_por_nombre
            FROM Tareas t
            INNER JOIN Usuarios ua ON t.asignado_a = ua.id
            INNER JOIN Usuarios up ON t.asignado_por = up.id
            LEFT JOIN Unidades ua_un ON ua.unidad_destino_id = ua_un.id
            WHERE t.id = ?
        `, [tareaId]);

        res.status(201).json({
            success: true,
            message: es_241 
                ? 'Tarea creada correctamente. Plazo automático de 90 días aplicado (Procedimiento 24.1)'
                : 'Tarea creada correctamente',
            data: tareas[0],
            es_241_aplicado: es_241
        });

    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la tarea'
        });
    } finally {
        conn.release();
    }
}

/**
 * Actualizar una tarea
 * PUT /api/tareas/:id
 */
async function actualizar(req, res) {
    const conn = await db.getConnection();
    
    try {
        const { id } = req.params;
        const {
            titulo,
            numero_registro,
            descripcion,
            asignado_a,
            prioridad,
            es_241,
            fecha_inicio,
            fecha_limite,
            estado,
            notas
        } = req.body;

        const usuario_id = req.user.id;

        // Verificar que la tarea existe
        const tareaExistente = await conn.query('SELECT * FROM Tareas WHERE id = ?', [id]);
        if (tareaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        // Construir query de actualización dinámicamente
        const updates = [];
        const params = [];

        if (titulo !== undefined) {
            updates.push('titulo = ?');
            params.push(titulo);
        }
        if (numero_registro !== undefined) {
            updates.push('numero_registro = ?');
            params.push(numero_registro || null);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion || null);
        }
        if (asignado_a !== undefined) {
            updates.push('asignado_a = ?');
            params.push(asignado_a);
        }
        if (prioridad !== undefined) {
            updates.push('prioridad = ?');
            params.push(prioridad);
        }
        if (es_241 !== undefined) {
            updates.push('es_241 = ?');
            params.push(es_241);
        }
        if (fecha_inicio !== undefined) {
            updates.push('fecha_inicio = ?');
            params.push(fecha_inicio);
        }
        if (fecha_limite !== undefined && !es_241) {
            updates.push('fecha_limite = ?');
            params.push(fecha_limite);
        }
        if (estado !== undefined) {
            updates.push('estado = ?');
            params.push(estado);
        }
        if (notas !== undefined) {
            updates.push('notas = ?');
            params.push(notas || null);
        }

        updates.push('actualizado_por = ?');
        params.push(usuario_id);

        params.push(id);

        await conn.query(`
            UPDATE Tareas 
            SET ${updates.join(', ')}
            WHERE id = ?
        `, params);

        // Obtener tarea actualizada
        const tareas = await conn.query(`
            SELECT 
                t.*,
                ua.nombre_completo AS asignado_a_nombre,
                up.nombre_completo AS asignado_por_nombre
            FROM Tareas t
            INNER JOIN Usuarios ua ON t.asignado_a = ua.id
            INNER JOIN Usuarios up ON t.asignado_por = up.id
            WHERE t.id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Tarea actualizada correctamente',
            data: tareas[0]
        });

    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la tarea'
        });
    } finally {
        conn.release();
    }
}

/**
 * Eliminar una tarea
 * DELETE /api/tareas/:id
 */
async function eliminar(req, res) {
    const conn = await db.getConnection();
    
    try {
        const { id } = req.params;

        const result = await conn.query('DELETE FROM Tareas WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Tarea eliminada correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la tarea'
        });
    } finally {
        conn.release();
    }
}

/**
 * Agregar comentario a una tarea
 * POST /api/tareas/:id/comentarios
 */
async function agregarComentario(req, res) {
    const conn = await db.getConnection();
    
    try {
        const { id } = req.params;
        const { comentario } = req.body;
        const usuario_id = req.user.id;

        if (!comentario) {
            return res.status(400).json({
                success: false,
                message: 'El comentario no puede estar vacío'
            });
        }

        // Verificar que la tarea existe
        const tarea = await conn.query('SELECT id FROM Tareas WHERE id = ?', [id]);
        if (tarea.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        await conn.query(`
            INSERT INTO Tareas_Comentarios (tarea_id, usuario_id, comentario)
            VALUES (?, ?, ?)
        `, [id, usuario_id, comentario]);

        res.status(201).json({
            success: true,
            message: 'Comentario agregado correctamente'
        });

    } catch (error) {
        console.error('Error al agregar comentario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar el comentario'
        });
    } finally {
        conn.release();
    }
}

/**
 * Obtener estadísticas de tareas
 * GET /api/tareas/estadisticas
 */
async function obtenerEstadisticas(req, res) {
    const conn = await db.getConnection();
    
    try {
        const usuario_id = req.user.id;
        const { global = false } = req.query;

        let whereClause = '';
        let params = [];

        if (global === 'true') {
            // Estadísticas jerárquicas: aplicar filtrado por alcance
            // Verificar si el usuario puede ver todas las tareas
            const { query: db_query } = require('../config/database');
            const permisoVerTodas = await db_query(
                `SELECT COUNT(*) as tiene_permiso
                FROM Usuario_Roles_Alcance ura
                INNER JOIN Roles r ON ura.rol_id = r.id
                INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
                INNER JOIN Permisos p ON rp.permiso_id = p.id
                WHERE ura.usuario_id = ?
                  AND p.accion = 'tasks:view_all'
                  AND ura.activo = TRUE
                  AND r.activo = TRUE
                  AND p.activo = TRUE`,
                [usuario_id]
            );
            
            const puedeVerTodas = permisoVerTodas[0].tiene_permiso > 0;
            
            if (!puedeVerTodas) {
                // Aplicar filtrado jerárquico
                const { obtenerUnidadesAccesibles } = require('../middleware/authorize');
                const unidadesAccesibles = await obtenerUnidadesAccesibles(usuario_id, 'tasks:view');
                
                if (unidadesAccesibles.length > 0) {
                    const placeholders = unidadesAccesibles.map(() => '?').join(',');
                    whereClause = `WHERE t.id IN (
                        SELECT t.id 
                        FROM Tareas t
                        INNER JOIN Usuarios ua ON t.asignado_a = ua.id
                        WHERE ua.unidad_destino_id IN (${placeholders})
                           OR t.asignado_a = ?
                           OR t.asignado_por = ?
                    )`;
                    params = [...unidadesAccesibles, usuario_id, usuario_id];
                } else {
                    // Sin alcance, solo ver tareas propias
                    whereClause = 'WHERE asignado_a = ? OR asignado_por = ?';
                    params = [usuario_id, usuario_id];
                }
            }
            // Si tiene tasks:view_all, whereClause queda vacío (ve todo)
        } else {
            // Estadísticas propias
            whereClause = 'WHERE asignado_a = ?';
            params = [usuario_id];
        }

        const stats = await conn.query(`
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
                SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) AS en_progreso,
                SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) AS en_revision,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) AS completadas,
                SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
                SUM(CASE WHEN fecha_limite < CURDATE() AND estado NOT IN ('completada', 'cancelada') THEN 1 ELSE 0 END) AS vencidas,
                SUM(CASE WHEN es_241 = TRUE THEN 1 ELSE 0 END) AS total_241
            FROM Tareas t
            ${whereClause}
        `, params);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    } finally {
        conn.release();
    }
}

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    agregarComentario,
    obtenerEstadisticas
};
