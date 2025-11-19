const { query } = require('../config/database');

// ============================================================================
// CONTROLADOR DE VEHÍCULOS
// ============================================================================

/**
 * Obtener todos los vehículos con filtrado jerárquico
 */
exports.getAll = async (req, res) => {
    try {
        const { unidad_id, tipo_vehiculo, estado, search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const userId = req.user.id;

        // Verificar si el usuario tiene permiso para ver todos los vehículos
        const permisoVerTodos = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ? AND p.accion = 'vehicles:view_all' AND p.activo = 1`,
            [userId]
        );

        const puedeVerTodos = permisoVerTodos[0].tiene_permiso > 0;

        let whereClause = 'WHERE 1=1';
        let params = [];

        // Si no puede ver todos, filtrar por alcance jerárquico
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
        if (unidad_id) {
            whereClause += ` AND v.unidad_id = ?`;
            params.push(unidad_id);
        }

        if (tipo_vehiculo) {
            whereClause += ` AND v.tipo_vehiculo = ?`;
            params.push(tipo_vehiculo);
        }

        if (estado) {
            whereClause += ` AND v.estado = ?`;
            params.push(estado);
        }

        if (search) {
            whereClause += ` AND (v.matricula LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Consulta de datos
        const vehiculos = await query(
            `SELECT 
                v.*,
                u.nombre as unidad_nombre,
                u.codigo_unidad,
                uc.nombre_completo as creador_nombre
            FROM Vehiculos v
            INNER JOIN Unidades u ON v.unidad_id = u.id
            LEFT JOIN Usuarios uc ON v.creado_por = uc.id
            ${whereClause}
            ORDER BY v.created_at DESC
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Contar total
        const totalResult = await query(
            `SELECT COUNT(*) as total
            FROM Vehiculos v
            ${whereClause}`,
            params
        );

        const total = totalResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: vehiculos,
            total,
            page: parseInt(page),
            totalPages
        });

    } catch (error) {
        console.error('Error en getAll vehiculos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículos',
            error: error.message
        });
    }
};

/**
 * Obtener un vehículo por ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verificar si tiene permiso para ver todos
        const permisoVerTodos = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ? AND p.accion = 'vehicles:view_all' AND p.activo = 1`,
            [userId]
        );

        const puedeVerTodos = permisoVerTodos[0].tiene_permiso > 0;

        let whereClause = 'WHERE v.id = ?';
        let params = [id];

        // Si no puede ver todos, verificar alcance
        if (!puedeVerTodos) {
            const tieneAcceso = await query(
                `SELECT COUNT(*) as tiene_acceso
                FROM Vehiculos v
                INNER JOIN Usuario_Roles_Alcance ura ON (
                    v.unidad_id = ura.unidad_destino_id 
                    OR es_unidad_descendiente(v.unidad_id, ura.unidad_destino_id)
                )
                WHERE v.id = ? AND ura.usuario_id = ?`,
                [id, userId]
            );

            if (tieneAcceso[0].tiene_acceso === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver este vehículo'
                });
            }
        }

        const vehiculos = await query(
            `SELECT 
                v.*,
                u.nombre as unidad_nombre,
                u.codigo_unidad,
                uc.nombre_completo as creador_nombre,
                ua.nombre_completo as actualizador_nombre
            FROM Vehiculos v
            INNER JOIN Unidades u ON v.unidad_id = u.id
            LEFT JOIN Usuarios uc ON v.creado_por = uc.id
            LEFT JOIN Usuarios ua ON v.actualizado_por = ua.id
            ${whereClause}`,
            params
        );

        if (vehiculos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        res.json({
            success: true,
            data: vehiculos[0]
        });

    } catch (error) {
        console.error('Error en getById vehiculos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículo',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo vehículo
 */
exports.create = async (req, res) => {
    try {
        const {
            unidad_id,
            matricula,
            marca,
            modelo,
            tipo_vehiculo,
            ano_fabricacion,
            kilometraje,
            numero_bastidor,
            fecha_alta,
            notas
        } = req.body;

        const userId = req.user.id;

        // Validaciones
        if (!unidad_id || !matricula || !marca || !modelo) {
            return res.status(400).json({
                success: false,
                message: 'Los campos unidad, matrícula, marca y modelo son obligatorios'
            });
        }

        // Verificar que la matrícula no exista
        const matriculaExiste = await query(
            'SELECT COUNT(*) as count FROM Vehiculos WHERE matricula = ?',
            [matricula]
        );

        if (matriculaExiste[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un vehículo con esta matrícula'
            });
        }

        // Verificar que la unidad existe
        const unidadExiste = await query(
            'SELECT COUNT(*) as count FROM Unidades WHERE id = ?',
            [unidad_id]
        );

        if (unidadExiste[0].count === 0) {
            return res.status(400).json({
                success: false,
                message: 'La unidad especificada no existe'
            });
        }

        // Insertar vehículo
        const result = await query(
            `INSERT INTO Vehiculos (
                unidad_id, matricula, marca, modelo, tipo_vehiculo,
                ano_fabricacion, kilometraje, numero_bastidor, 
                fecha_alta, notas, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                unidad_id,
                matricula.toUpperCase(),
                marca,
                modelo,
                tipo_vehiculo || 'turismo',
                ano_fabricacion || null,
                kilometraje || 0,
                numero_bastidor || null,
                fecha_alta || new Date().toISOString().split('T')[0],
                notas || null,
                userId
            ]
        );

        // Obtener el vehículo creado
        const vehiculo = await query(
            `SELECT 
                v.*,
                u.nombre as unidad_nombre,
                u.codigo_unidad
            FROM Vehiculos v
            INNER JOIN Unidades u ON v.unidad_id = u.id
            WHERE v.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Vehículo creado exitosamente',
            data: vehiculo[0]
        });

    } catch (error) {
        console.error('Error en create vehiculos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear vehículo',
            error: error.message
        });
    }
};

/**
 * Actualizar un vehículo
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            unidad_id,
            matricula,
            marca,
            modelo,
            tipo_vehiculo,
            ano_fabricacion,
            kilometraje,
            numero_bastidor,
            estado,
            fecha_baja,
            notas
        } = req.body;

        const userId = req.user.id;

        // Verificar que el vehículo existe
        const vehiculoExiste = await query(
            'SELECT * FROM Vehiculos WHERE id = ?',
            [id]
        );

        if (vehiculoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Si se cambia la matrícula, verificar que no exista otra con ese valor
        if (matricula && matricula !== vehiculoExiste[0].matricula) {
            const matriculaExiste = await query(
                'SELECT COUNT(*) as count FROM Vehiculos WHERE matricula = ? AND id != ?',
                [matricula, id]
            );

            if (matriculaExiste[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro vehículo con esta matrícula'
                });
            }
        }

        // Actualizar vehículo
        await query(
            `UPDATE Vehiculos SET
                unidad_id = COALESCE(?, unidad_id),
                matricula = COALESCE(?, matricula),
                marca = COALESCE(?, marca),
                modelo = COALESCE(?, modelo),
                tipo_vehiculo = COALESCE(?, tipo_vehiculo),
                ano_fabricacion = COALESCE(?, ano_fabricacion),
                kilometraje = COALESCE(?, kilometraje),
                numero_bastidor = COALESCE(?, numero_bastidor),
                estado = COALESCE(?, estado),
                fecha_baja = ?,
                notas = COALESCE(?, notas),
                actualizado_por = ?
            WHERE id = ?`,
            [
                unidad_id,
                matricula ? matricula.toUpperCase() : null,
                marca,
                modelo,
                tipo_vehiculo,
                ano_fabricacion,
                kilometraje,
                numero_bastidor,
                estado,
                fecha_baja || null,
                notas,
                userId,
                id
            ]
        );

        // Obtener el vehículo actualizado
        const vehiculo = await query(
            `SELECT 
                v.*,
                u.nombre as unidad_nombre,
                u.codigo_unidad
            FROM Vehiculos v
            INNER JOIN Unidades u ON v.unidad_id = u.id
            WHERE v.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Vehículo actualizado exitosamente',
            data: vehiculo[0]
        });

    } catch (error) {
        console.error('Error en update vehiculos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar vehículo',
            error: error.message
        });
    }
};

/**
 * Eliminar un vehículo
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el vehículo existe
        const vehiculoExiste = await query(
            'SELECT * FROM Vehiculos WHERE id = ?',
            [id]
        );

        if (vehiculoExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Verificar si tiene citas asociadas
        const citasAsociadas = await query(
            'SELECT COUNT(*) as count FROM Citas WHERE vehiculo_id = ?',
            [id]
        );

        if (citasAsociadas[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el vehículo porque tiene citas asociadas'
            });
        }

        // Eliminar vehículo
        await query('DELETE FROM Vehiculos WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Vehículo eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error en delete vehiculos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar vehículo',
            error: error.message
        });
    }
};

/**
 * Obtener vehículos por unidad
 */
exports.getByUnidad = async (req, res) => {
    try {
        const { unidad_id } = req.params;
        const { estado } = req.query;

        let whereClause = 'WHERE v.unidad_id = ?';
        let params = [unidad_id];

        if (estado) {
            whereClause += ' AND v.estado = ?';
            params.push(estado);
        }

        const vehiculos = await query(
            `SELECT 
                v.*,
                u.nombre as unidad_nombre,
                u.codigo_unidad
            FROM Vehiculos v
            INNER JOIN Unidades u ON v.unidad_id = u.id
            ${whereClause}
            ORDER BY v.matricula ASC`,
            params
        );

        res.json({
            success: true,
            data: vehiculos
        });

    } catch (error) {
        console.error('Error en getByUnidad vehiculos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículos de la unidad',
            error: error.message
        });
    }
};
