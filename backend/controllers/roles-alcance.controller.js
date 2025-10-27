// ============================================================================
// CONTROLADOR DE USUARIO_ROLES_ALCANCE
// ============================================================================

const { query, transaction } = require('../config/database');
const { obtenerUnidadesAccesibles } = require('../middleware/authorize');

/**
 * Listar roles y alcances de un usuario
 */
const listarPorUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // Verificar que el usuario existe
        const [usuario] = await query(
            'SELECT id, username, nombre_completo FROM Usuarios WHERE id = ?',
            [usuarioId]
        );

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que el usuario autenticado tiene permiso para ver este usuario
        // (debe estar dentro de su alcance jerárquico)
        const unidadesAccesibles = await obtenerUnidadesAccesibles(
            req.user.id,
            'user_roles:view'
        );

        const [usuarioTarget] = await query(
            'SELECT unidad_destino_id FROM Usuarios WHERE id = ?',
            [usuarioId]
        );

        if (!unidadesAccesibles.includes(usuarioTarget.unidad_destino_id)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver los roles de este usuario'
            });
        }

        // Obtener roles y alcances del usuario
        const rolesAlcance = await query(`
            SELECT 
                ura.id,
                ura.usuario_id,
                ura.rol_id,
                r.nombre as rol_nombre,
                r.descripcion as rol_descripcion,
                ura.unidad_alcance_id,
                u.nombre as unidad_nombre,
                u.tipo_unidad,
                u.codigo_unidad,
                ura.created_at
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Unidades u ON ura.unidad_alcance_id = u.id
            WHERE ura.usuario_id = ?
            ORDER BY u.codigo_unidad, r.nombre
        `, [usuarioId]);

        res.json({
            success: true,
            data: {
                usuario,
                roles_alcance: rolesAlcance,
                total: rolesAlcance.length
            }
        });
    } catch (error) {
        console.error('❌ Error al listar roles-alcance:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener roles y alcances del usuario',
            error: error.message
        });
    }
};

/**
 * Asignar rol con alcance a un usuario
 */
const asignar = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { rol_id, unidad_alcance_id } = req.body;

        // Validar campos requeridos
        if (!rol_id || !unidad_alcance_id) {
            return res.status(400).json({
                success: false,
                message: 'Los campos rol_id y unidad_alcance_id son requeridos'
            });
        }

        // Verificar que el usuario existe
        const [usuario] = await query('SELECT id FROM Usuarios WHERE id = ?', [usuarioId]);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que el rol existe y está activo
        const [rol] = await query(
            'SELECT id, nombre FROM Roles WHERE id = ? AND activo = 1',
            [rol_id]
        );
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado o inactivo'
            });
        }

        // Verificar que la unidad existe
        const [unidad] = await query(
            'SELECT id, nombre FROM Unidades WHERE id = ?',
            [unidad_alcance_id]
        );
        if (!unidad) {
            return res.status(404).json({
                success: false,
                message: 'Unidad no encontrada'
            });
        }

        // Verificar que el usuario autenticado tiene permiso sobre la unidad de alcance
        const unidadesAccesibles = await obtenerUnidadesAccesibles(
            req.user.id,
            'user_roles:assign'
        );

        if (!unidadesAccesibles.includes(unidad_alcance_id)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para asignar roles en esta unidad'
            });
        }

        // Verificar que no exista ya esta asignación
        const [existente] = await query(
            'SELECT id FROM Usuario_Roles_Alcance WHERE usuario_id = ? AND rol_id = ? AND unidad_alcance_id = ?',
            [usuarioId, rol_id, unidad_alcance_id]
        );

        if (existente) {
            return res.status(409).json({
                success: false,
                message: 'Esta asignación de rol y alcance ya existe para el usuario'
            });
        }

        // Crear la asignación
        const result = await query(
            'INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id) VALUES (?, ?, ?)',
            [usuarioId, rol_id, unidad_alcance_id]
        );

        // Obtener la asignación creada
        const [nuevaAsignacion] = await query(`
            SELECT 
                ura.id,
                ura.usuario_id,
                ura.rol_id,
                r.nombre as rol_nombre,
                ura.unidad_alcance_id,
                u.nombre as unidad_nombre,
                u.tipo_unidad,
                ura.created_at
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Unidades u ON ura.unidad_alcance_id = u.id
            WHERE ura.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Rol asignado exitosamente',
            data: nuevaAsignacion
        });
    } catch (error) {
        console.error('❌ Error al asignar rol-alcance:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar rol y alcance',
            error: error.message
        });
    }
};

/**
 * Revocar asignación de rol con alcance
 */
const revocar = async (req, res) => {
    try {
        const { usuarioId, asignacionId } = req.params;

        // Verificar que la asignación existe y pertenece al usuario
        const [asignacion] = await query(`
            SELECT 
                ura.id,
                ura.usuario_id,
                ura.unidad_alcance_id,
                r.nombre as rol_nombre,
                u.nombre as unidad_nombre
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Unidades u ON ura.unidad_alcance_id = u.id
            WHERE ura.id = ? AND ura.usuario_id = ?
        `, [asignacionId, usuarioId]);

        if (!asignacion) {
            return res.status(404).json({
                success: false,
                message: 'Asignación no encontrada'
            });
        }

        // Verificar que el usuario autenticado tiene permiso sobre la unidad de alcance
        const unidadesAccesibles = await obtenerUnidadesAccesibles(
            req.user.id,
            'user_roles:revoke'
        );

        if (!unidadesAccesibles.includes(asignacion.unidad_alcance_id)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para revocar roles en esta unidad'
            });
        }

        // Eliminar la asignación
        await query('DELETE FROM Usuario_Roles_Alcance WHERE id = ?', [asignacionId]);

        res.json({
            success: true,
            message: 'Asignación de rol revocada exitosamente',
            data: {
                id: asignacionId,
                rol: asignacion.rol_nombre,
                unidad: asignacion.unidad_nombre
            }
        });
    } catch (error) {
        console.error('❌ Error al revocar rol-alcance:', error);
        res.status(500).json({
            success: false,
            message: 'Error al revocar asignación',
            error: error.message
        });
    }
};

/**
 * Actualizar múltiples asignaciones de un usuario (reemplaza todas)
 */
const actualizarAsignaciones = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { asignaciones } = req.body; // Array de { rol_id, unidad_alcance_id }

        if (!Array.isArray(asignaciones)) {
            return res.status(400).json({
                success: false,
                message: 'Se debe proporcionar un array de asignaciones'
            });
        }

        // Verificar que el usuario existe
        const [usuario] = await query('SELECT id FROM Usuarios WHERE id = ?', [usuarioId]);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar permisos sobre todas las unidades involucradas
        const unidadesAccesibles = await obtenerUnidadesAccesibles(
            req.user.id,
            'user_roles:assign'
        );

        for (const asig of asignaciones) {
            if (!unidadesAccesibles.includes(asig.unidad_alcance_id)) {
                return res.status(403).json({
                    success: false,
                    message: `No tienes permiso para asignar roles en la unidad ${asig.unidad_alcance_id}`
                });
            }
        }

        await transaction(async (conn) => {
            // Eliminar asignaciones actuales
            await conn.query('DELETE FROM Usuario_Roles_Alcance WHERE usuario_id = ?', [usuarioId]);

            // Insertar nuevas asignaciones
            if (asignaciones.length > 0) {
                const values = asignaciones.map(a => [usuarioId, a.rol_id, a.unidad_alcance_id]);
                await conn.query(
                    'INSERT INTO Usuario_Roles_Alcance (usuario_id, rol_id, unidad_alcance_id) VALUES ?',
                    [values]
                );
            }
        });

        // Obtener las asignaciones actualizadas
        const nuevasAsignaciones = await query(`
            SELECT 
                ura.id,
                ura.rol_id,
                r.nombre as rol_nombre,
                ura.unidad_alcance_id,
                u.nombre as unidad_nombre,
                u.tipo_unidad
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Unidades u ON ura.unidad_alcance_id = u.id
            WHERE ura.usuario_id = ?
            ORDER BY u.codigo_unidad, r.nombre
        `, [usuarioId]);

        res.json({
            success: true,
            message: 'Asignaciones actualizadas exitosamente',
            data: {
                usuario_id: usuarioId,
                asignaciones: nuevasAsignaciones
            }
        });
    } catch (error) {
        console.error('❌ Error al actualizar asignaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar asignaciones',
            error: error.message
        });
    }
};

module.exports = {
    listarPorUsuario,
    asignar,
    revocar,
    actualizarAsignaciones
};
