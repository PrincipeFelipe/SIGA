// ============================================================================
// CONTROLADOR DE ROLES
// ============================================================================

const { query, transaction } = require('../config/database');

/**
 * Listar todos los roles
 */
const listar = async (req, res) => {
    try {
        const { activo } = req.query;

        let sql = `
            SELECT 
                r.id,
                r.nombre,
                r.descripcion,
                r.activo,
                COUNT(DISTINCT rp.permiso_id) as total_permisos,
                COUNT(DISTINCT ura.id) as total_usuarios,
                r.created_at,
                r.updated_at
            FROM Roles r
            LEFT JOIN Roles_Permisos rp ON r.id = rp.rol_id
            LEFT JOIN Usuario_Roles_Alcance ura ON r.id = ura.rol_id
        `;

        const params = [];

        // Filtro por estado activo
        if (activo !== undefined) {
            sql += ' WHERE r.activo = ?';
            params.push(activo === 'true' || activo === '1' ? 1 : 0);
        }

        sql += ' GROUP BY r.id ORDER BY r.nombre ASC';

        const roles = await query(sql, params);

        res.json({
            success: true,
            data: roles,
            total: roles.length
        });
    } catch (error) {
        console.error('❌ Error al listar roles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la lista de roles',
            error: error.message
        });
    }
};

/**
 * Obtener detalle de un rol con sus permisos
 */
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener información del rol
        const [rol] = await query(`
            SELECT 
                r.id,
                r.nombre,
                r.descripcion,
                r.activo,
                r.created_at,
                r.updated_at
            FROM Roles r
            WHERE r.id = ?
        `, [id]);

        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        // Obtener permisos asociados al rol
        const permisos = await query(`
            SELECT 
                p.id,
                p.accion,
                p.descripcion,
                p.categoria
            FROM Permisos p
            INNER JOIN Roles_Permisos rp ON p.id = rp.permiso_id
            WHERE rp.rol_id = ?
            ORDER BY p.categoria, p.accion
        `, [id]);

        // Obtener estadísticas de uso
        const [stats] = await query(`
            SELECT 
                COUNT(DISTINCT ura.usuario_id) as total_usuarios,
                COUNT(DISTINCT ura.unidad_alcance_id) as total_alcances
            FROM Usuario_Roles_Alcance ura
            WHERE ura.rol_id = ?
        `, [id]);

        res.json({
            success: true,
            data: {
                ...rol,
                permisos,
                estadisticas: stats || { total_usuarios: 0, total_alcances: 0 }
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el rol',
            error: error.message
        });
    }
};

/**
 * Crear nuevo rol
 */
const crear = async (req, res) => {
    try {
        const { nombre, descripcion, activo = true } = req.body;

        // Validar campos requeridos
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del rol es requerido'
            });
        }

        // Verificar que no exista un rol con el mismo nombre
        const [rolExistente] = await query(
            'SELECT id FROM Roles WHERE nombre = ?',
            [nombre]
        );

        if (rolExistente) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un rol con ese nombre'
            });
        }

        // Crear el rol
        const result = await query(
            'INSERT INTO Roles (nombre, descripcion, activo) VALUES (?, ?, ?)',
            [nombre, descripcion || null, activo ? 1 : 0]
        );

        // Obtener el rol recién creado
        const [nuevoRol] = await query(
            'SELECT * FROM Roles WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Rol creado exitosamente',
            data: nuevoRol
        });
    } catch (error) {
        console.error('❌ Error al crear rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el rol',
            error: error.message
        });
    }
};

/**
 * Actualizar rol existente
 */
const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, activo } = req.body;

        // Verificar que el rol existe
        const [rolExistente] = await query('SELECT id FROM Roles WHERE id = ?', [id]);
        if (!rolExistente) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        // Si se actualiza el nombre, verificar que no esté duplicado
        if (nombre) {
            const [duplicado] = await query(
                'SELECT id FROM Roles WHERE nombre = ? AND id != ?',
                [nombre, id]
            );
            if (duplicado) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro rol con ese nombre'
                });
            }
        }

        // Construir query de actualización dinámica
        const updates = [];
        const params = [];

        if (nombre !== undefined) {
            updates.push('nombre = ?');
            params.push(nombre);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
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
            `UPDATE Roles SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            params
        );

        // Obtener el rol actualizado
        const [rolActualizado] = await query('SELECT * FROM Roles WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Rol actualizado exitosamente',
            data: rolActualizado
        });
    } catch (error) {
        console.error('❌ Error al actualizar rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el rol',
            error: error.message
        });
    }
};

/**
 * Eliminar rol (soft delete)
 */
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el rol existe
        const [rol] = await query('SELECT id, nombre FROM Roles WHERE id = ?', [id]);
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        // Verificar si hay usuarios asignados a este rol
        const [usuariosAsignados] = await query(
            'SELECT COUNT(*) as total FROM Usuario_Roles_Alcance WHERE rol_id = ?',
            [id]
        );

        if (usuariosAsignados.total > 0) {
            return res.status(409).json({
                success: false,
                message: `No se puede eliminar el rol porque tiene ${usuariosAsignados.total} usuario(s) asignado(s)`
            });
        }

        // Soft delete
        await query('UPDATE Roles SET activo = 0, updated_at = NOW() WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Rol desactivado exitosamente',
            data: { id, nombre: rol.nombre }
        });
    } catch (error) {
        console.error('❌ Error al eliminar rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el rol',
            error: error.message
        });
    }
};

/**
 * Asignar permisos a un rol
 */
const asignarPermisos = async (req, res) => {
    try {
        const { id } = req.params;
        const { permisos } = req.body; // Array de IDs de permisos

        if (!Array.isArray(permisos) || permisos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se debe proporcionar un array de permisos'
            });
        }

        // Verificar que el rol existe
        const [rol] = await query('SELECT id FROM Roles WHERE id = ?', [id]);
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        await transaction(async (conn) => {
            // Eliminar permisos actuales del rol
            await conn.query('DELETE FROM Roles_Permisos WHERE rol_id = ?', [id]);

            // Insertar nuevos permisos
            const values = permisos.map(permisoId => [id, permisoId]);
            await conn.query(
                'INSERT INTO Roles_Permisos (rol_id, permiso_id) VALUES ?',
                [values]
            );
        });

        // Obtener los permisos asignados
        const permisosAsignados = await query(`
            SELECT 
                p.id,
                p.accion,
                p.descripcion,
                p.categoria
            FROM Permisos p
            INNER JOIN Roles_Permisos rp ON p.id = rp.permiso_id
            WHERE rp.rol_id = ?
            ORDER BY p.categoria, p.accion
        `, [id]);

        res.json({
            success: true,
            message: 'Permisos asignados exitosamente',
            data: {
                rol_id: id,
                permisos: permisosAsignados
            }
        });
    } catch (error) {
        console.error('❌ Error al asignar permisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar permisos al rol',
            error: error.message
        });
    }
};

/**
 * Obtener permisos de un rol
 */
const obtenerPermisos = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el rol existe
        const [rol] = await query('SELECT id, nombre FROM Roles WHERE id = ?', [id]);
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        const permisos = await query(`
            SELECT 
                p.id,
                p.accion,
                p.descripcion,
                p.categoria
            FROM Permisos p
            INNER JOIN Roles_Permisos rp ON p.id = rp.permiso_id
            WHERE rp.rol_id = ?
            ORDER BY p.categoria, p.accion
        `, [id]);

        res.json({
            success: true,
            data: {
                rol,
                permisos
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener permisos del rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener permisos',
            error: error.message
        });
    }
};

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    asignarPermisos,
    obtenerPermisos
};
