// ============================================================================
// CONTROLADOR DE PERMISOS
// ============================================================================

const { query } = require('../config/database');

/**
 * Listar todos los permisos
 */
const listar = async (req, res) => {
    try {
        const { recurso, activo } = req.query;

        let sql = `
            SELECT 
                p.id,
                p.accion,
                p.descripcion,
                p.categoria,
                p.activo,
                COUNT(DISTINCT rp.rol_id) as total_roles,
                p.created_at,
                p.updated_at
            FROM Permisos p
            LEFT JOIN Roles_Permisos rp ON p.id = rp.permiso_id
        `;

        const params = [];
        const conditions = [];

        // Filtro por categoria
        if (recurso) {
            conditions.push('p.categoria = ?');
            params.push(recurso);
        }

        // Filtro por estado activo
        if (activo !== undefined) {
            conditions.push('p.activo = ?');
            params.push(activo === 'true' || activo === '1' ? 1 : 0);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' GROUP BY p.id ORDER BY p.categoria, p.accion';

        const permisos = await query(sql, params);

        res.json({
            success: true,
            data: permisos,
            total: permisos.length
        });
    } catch (error) {
        console.error('❌ Error al listar permisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la lista de permisos',
            error: error.message
        });
    }
};

/**
 * Listar permisos agrupados por recurso
 */
const listarPorRecurso = async (req, res) => {
    try {
        const permisos = await query(`
            SELECT 
                p.id,
                p.accion,
                p.descripcion,
                p.categoria,
                p.activo
            FROM Permisos p
            WHERE p.activo = 1
            ORDER BY p.categoria, p.accion
        `);

        // Agrupar por categoria
        const agrupadoPorRecurso = permisos.reduce((acc, permiso) => {
            const categoria = permiso.categoria || 'Sin categoría';
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            acc[categoria].push(permiso);
            return acc;
        }, {});

        res.json({
            success: true,
            data: agrupadoPorRecurso
        });
    } catch (error) {
        console.error('❌ Error al listar permisos por recurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener permisos agrupados',
            error: error.message
        });
    }
};

/**
 * Obtener detalle de un permiso
 */
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [permiso] = await query(`
            SELECT 
                p.id,
                p.accion,
                p.descripcion,
                p.categoria,
                p.activo,
                p.created_at,
                p.updated_at
            FROM Permisos p
            WHERE p.id = ?
        `, [id]);

        if (!permiso) {
            return res.status(404).json({
                success: false,
                message: 'Permiso no encontrado'
            });
        }

        // Obtener roles que tienen este permiso
        const roles = await query(`
            SELECT 
                r.id,
                r.nombre,
                r.descripcion
            FROM Roles r
            INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
            WHERE rp.permiso_id = ? AND r.activo = 1
            ORDER BY r.nombre
        `, [id]);

        res.json({
            success: true,
            data: {
                ...permiso,
                roles
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener permiso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el permiso',
            error: error.message
        });
    }
};

/**
 * Crear nuevo permiso
 */
const crear = async (req, res) => {
    try {
        const { accion, descripcion, categoria, activo = true } = req.body;

        // Validar campos requeridos
        if (!accion) {
            return res.status(400).json({
                success: false,
                message: 'El campo acción es requerido'
            });
        }

        // Verificar que no exista un permiso con la misma acción
        const [permisoExistente] = await query(
            'SELECT id FROM Permisos WHERE accion = ?',
            [accion]
        );

        if (permisoExistente) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un permiso con esa acción'
            });
        }

        // Crear el permiso
        const result = await query(
            'INSERT INTO Permisos (accion, descripcion, categoria, activo) VALUES (?, ?, ?, ?)',
            [accion, descripcion || null, categoria || null, activo ? 1 : 0]
        );

        // Obtener el permiso recién creado
        const [nuevoPermiso] = await query(
            'SELECT * FROM Permisos WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Permiso creado exitosamente',
            data: nuevoPermiso
        });
    } catch (error) {
        console.error('❌ Error al crear permiso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el permiso',
            error: error.message
        });
    }
};

/**
 * Actualizar permiso existente
 */
const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { accion, descripcion, categoria, activo } = req.body;

        // Verificar que el permiso existe
        const [permisoExistente] = await query('SELECT id FROM Permisos WHERE id = ?', [id]);
        if (!permisoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Permiso no encontrado'
            });
        }

        // Si se actualiza la acción, verificar que no esté duplicada
        if (accion) {
            const [duplicado] = await query(
                'SELECT id FROM Permisos WHERE accion = ? AND id != ?',
                [accion, id]
            );
            if (duplicado) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro permiso con esa acción'
                });
            }
        }

        // Construir query de actualización dinámica
        const updates = [];
        const params = [];

        if (accion !== undefined) {
            updates.push('accion = ?');
            params.push(accion);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
        }
        if (categoria !== undefined) {
            updates.push('categoria = ?');
            params.push(categoria);
        }
        if (activo !== undefined) {
            updates.push('activo = ?');
            params.push(activo ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }

        params.push(id);
        await query(
            `UPDATE Permisos SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            params
        );

        // Obtener el permiso actualizado
        const [permisoActualizado] = await query('SELECT * FROM Permisos WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Permiso actualizado exitosamente',
            data: permisoActualizado
        });
    } catch (error) {
        console.error('❌ Error al actualizar permiso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el permiso',
            error: error.message
        });
    }
};

/**
 * Eliminar permiso (soft delete)
 */
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el permiso existe
        const [permiso] = await query('SELECT id, accion FROM Permisos WHERE id = ?', [id]);
        if (!permiso) {
            return res.status(404).json({
                success: false,
                message: 'Permiso no encontrado'
            });
        }

        // Verificar si hay roles con este permiso
        const [rolesAsignados] = await query(
            'SELECT COUNT(*) as total FROM Roles_Permisos WHERE permiso_id = ?',
            [id]
        );

        if (rolesAsignados.total > 0) {
            return res.status(409).json({
                success: false,
                message: `No se puede eliminar el permiso porque está asignado a ${rolesAsignados.total} rol(es)`
            });
        }

        // Soft delete
        await query('UPDATE Permisos SET activo = 0, updated_at = NOW() WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Permiso desactivado exitosamente',
            data: { id, accion: permiso.accion }
        });
    } catch (error) {
        console.error('❌ Error al eliminar permiso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el permiso',
            error: error.message
        });
    }
};

module.exports = {
    listar,
    listarPorRecurso,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};
