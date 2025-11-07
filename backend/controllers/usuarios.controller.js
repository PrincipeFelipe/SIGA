// ============================================================================
// CONTROLADOR DE USUARIOS
// ============================================================================
// CRUD completo con autorización jerárquica
// ============================================================================

const bcrypt = require('bcrypt');
const { query, transaction } = require('../config/database');
const { obtenerUnidadesAccesibles } = require('../middleware/authorize');
const { logManual } = require('../middleware/auditLog');

/**
 * GET /api/usuarios
 * Listar usuarios (filtrado por alcance del usuario actual)
 */
async function listar(req, res) {
    try {
        const { search, unidad_id, activo, page = 1, limit = 50 } = req.query;
        
        // Verificar si el usuario tiene permiso para ver todos los usuarios
        const permisoVerTodos = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ?
              AND p.accion = 'users:view_all'
              AND ura.activo = TRUE
              AND r.activo = TRUE
              AND p.activo = TRUE`,
            [req.user.id]
        );
        
        const puedeVerTodos = permisoVerTodos[0].tiene_permiso > 0;
        
        console.log('[USUARIOS] Usuario:', req.user.id, 'Puede ver todos:', puedeVerTodos);
        
        // Construir query base
        let sql = `
            SELECT 
                u.id,
                u.username,
                u.nombre_completo,
                u.email,
                u.unidad_destino_id,
                u.activo,
                u.ultimo_acceso,
                u.created_at,
                un.nombre as unidad_destino_nombre,
                un.codigo_unidad,
                un.tipo_unidad
            FROM Usuarios u
            INNER JOIN Unidades un ON u.unidad_destino_id = un.id
            WHERE 1=1
        `;
        
        // Si NO tiene permiso para ver todos, aplicar filtrado jerárquico
        if (!puedeVerTodos) {
            const unidades_accesibles = await obtenerUnidadesAccesibles(
                req.user.id,
                'users:view'
            );
            
            if (unidades_accesibles.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    total: 0,
                    message: 'No tiene acceso a ninguna unidad'
                });
            }
            
            sql += ` AND u.unidad_destino_id IN (${unidades_accesibles.join(',')})`;
        }
        
        const params = [];
        
        // Filtro de búsqueda
        if (search) {
            sql += ` AND (u.username LIKE ? OR u.nombre_completo LIKE ? OR u.email LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        
        // Filtro por unidad específica
        if (unidad_id) {
            sql += ` AND u.unidad_destino_id = ?`;
            params.push(unidad_id);
        }
        
        // Filtro por estado activo
        if (activo !== undefined) {
            sql += ` AND u.activo = ?`;
            params.push(activo === 'true' || activo === '1');
        }
        
        // Ordenar
        sql += ` ORDER BY un.tipo_unidad, u.nombre_completo`;
        
        // Paginación
        const offset = (page - 1) * limit;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        console.log('[USUARIOS] SQL:', sql.replace(/\s+/g, ' '));
        console.log('[USUARIOS] Params:', params);
        
        const usuarios = await query(sql, params);
        console.log('[USUARIOS] Usuarios encontrados:', usuarios.length);
        
        // Obtener total (sin paginación)
        let countSql = `
            SELECT COUNT(*) as total
            FROM Usuarios u
            WHERE 1=1
        `;
        
        // Aplicar mismo filtro jerárquico que en la query principal
        if (!puedeVerTodos) {
            const unidades_accesibles = await obtenerUnidadesAccesibles(
                req.user.id,
                'users:view'
            );
            countSql += ` AND u.unidad_destino_id IN (${unidades_accesibles.join(',')})`;
        }
        
        if (search) {
            countSql += ` AND (u.username LIKE ? OR u.nombre_completo LIKE ? OR u.email LIKE ?)`;
        }
        if (unidad_id) {
            countSql += ` AND u.unidad_destino_id = ?`;
        }
        if (activo !== undefined) {
            countSql += ` AND u.activo = ?`;
        }
        
        const [{ total }] = await query(countSql, params.slice(0, -2));
        
        res.json({
            success: true,
            data: usuarios,
            total: Number(total),
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(Number(total) / limit)
        });
        
    } catch (error) {
        console.error('❌ Error listando usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * GET /api/usuarios/:id
 * Obtener detalle de un usuario
 */
async function obtenerPorId(req, res) {
    try {
        const { id } = req.params;
        
        const [usuario] = await query(
            `SELECT 
                u.id,
                u.username,
                u.nombre_completo,
                u.email,
                u.unidad_destino_id,
                u.activo,
                u.require_password_change,
                u.ultimo_acceso,
                u.created_at,
                u.updated_at,
                un.nombre as unidad_destino_nombre,
                un.codigo_unidad,
                un.tipo_unidad
            FROM Usuarios u
            INNER JOIN Unidades un ON u.unidad_destino_id = un.id
            WHERE u.id = ?`,
            [id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Obtener roles y alcances
        const roles_alcance = await query(
            `SELECT 
                ura.id as asignacion_id,
                r.id as rol_id,
                r.nombre as rol_nombre,
                r.descripcion as rol_descripcion,
                ura.unidad_alcance_id,
                un.nombre as unidad_alcance_nombre,
                un.codigo_unidad as unidad_alcance_codigo,
                un.tipo_unidad as unidad_alcance_tipo,
                ura.fecha_inicio,
                ura.fecha_fin,
                ura.activo as asignacion_activa
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
            WHERE ura.usuario_id = ?
            ORDER BY ura.created_at DESC`,
            [id]
        );
        
        res.json({
            success: true,
            data: {
                ...usuario,
                roles_alcance
            }
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * POST /api/usuarios
 * Crear nuevo usuario
 */
async function crear(req, res) {
    try {
        const {
            username,
            password,
            nombre_completo,
            email,
            unidad_destino_id
        } = req.body;
        
        // Validación básica
        if (!username || !password || !nombre_completo || !unidad_destino_id) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }
        
        // Validar que el username no exista
        const [existe] = await query(
            'SELECT id FROM Usuarios WHERE username = ?',
            [username]
        );
        
        if (existe) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya existe'
            });
        }
        
        // Hashear contraseña
        const password_hash = await bcrypt.hash(
            password,
            parseInt(process.env.BCRYPT_ROUNDS) || 10
        );
        
        // Crear usuario
        const resultado = await query(
            `INSERT INTO Usuarios 
            (username, password_hash, nombre_completo, email, unidad_destino_id, require_password_change)
            VALUES (?, ?, ?, ?, ?, TRUE)`,
            [username, password_hash, nombre_completo, email, unidad_destino_id]
        );
        
        const nuevoUsuarioId = Number(resultado.insertId);
        
        // Log de auditoría
        await logManual(
            req,
            'CREATE',
            'Usuario',
            nuevoUsuarioId,
            `Usuario creado: ${username}`,
            { username, nombre_completo, unidad_destino_id }
        );
        
        // Obtener usuario completo
        const [usuario] = await query(
            `SELECT 
                u.id,
                u.username,
                u.nombre_completo,
                u.email,
                u.unidad_destino_id,
                un.nombre as unidad_destino_nombre
            FROM Usuarios u
            INNER JOIN Unidades un ON u.unidad_destino_id = un.id
            WHERE u.id = ?`,
            [nuevoUsuarioId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: usuario
        });
        
    } catch (error) {
        console.error('❌ Error creando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * PUT /api/usuarios/:id
 * Actualizar usuario
 */
async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const { nombre_completo, email, unidad_destino_id, activo } = req.body;
        
        // Verificar que el usuario existe
        const [usuario] = await query('SELECT id FROM Usuarios WHERE id = ?', [id]);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Construir query de actualización dinámicamente
        const updates = [];
        const params = [];
        
        if (nombre_completo !== undefined) {
            updates.push('nombre_completo = ?');
            params.push(nombre_completo);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }
        if (unidad_destino_id !== undefined) {
            updates.push('unidad_destino_id = ?');
            params.push(unidad_destino_id);
        }
        if (activo !== undefined) {
            updates.push('activo = ?');
            params.push(activo);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }
        
        params.push(id);
        
        await query(
            `UPDATE Usuarios SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        
        // Log de auditoría
        await logManual(
            req,
            'UPDATE',
            'Usuario',
            id,
            `Usuario actualizado: ID ${id}`,
            { nombre_completo, email, unidad_destino_id, activo }
        );
        
        // Obtener usuario actualizado
        const [usuarioActualizado] = await query(
            `SELECT 
                u.id,
                u.username,
                u.nombre_completo,
                u.email,
                u.unidad_destino_id,
                u.activo,
                un.nombre as unidad_destino_nombre
            FROM Usuarios u
            INNER JOIN Unidades un ON u.unidad_destino_id = un.id
            WHERE u.id = ?`,
            [id]
        );
        
        res.json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: usuarioActualizado
        });
        
    } catch (error) {
        console.error('❌ Error actualizando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * DELETE /api/usuarios/:id
 * Desactivar usuario (eliminación lógica)
 */
async function eliminar(req, res) {
    try {
        const { id } = req.params;
        
        // No permitir eliminar al propio usuario
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'No puede desactivar su propio usuario'
            });
        }
        
        // Verificar que el usuario existe
        const [usuario] = await query(
            'SELECT id, username FROM Usuarios WHERE id = ?',
            [id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Desactivar (eliminación lógica)
        await query('UPDATE Usuarios SET activo = FALSE WHERE id = ?', [id]);
        
        // Log de auditoría
        await logManual(
            req,
            'DELETE',
            'Usuario',
            id,
            `Usuario desactivado: ${usuario.username}`,
            { username: usuario.username }
        );
        
        res.json({
            success: true,
            message: 'Usuario desactivado correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * POST /api/usuarios/:id/reset-password
 * Resetear contraseña de un usuario
 */
async function resetPassword(req, res) {
    try {
        const { id } = req.params;
        const { new_password } = req.body;
        
        if (!new_password || new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }
        
        // Verificar que el usuario existe
        const [usuario] = await query(
            'SELECT id, username FROM Usuarios WHERE id = ?',
            [id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Hashear nueva contraseña
        const password_hash = await bcrypt.hash(
            new_password,
            parseInt(process.env.BCRYPT_ROUNDS) || 10
        );
        
        // Actualizar contraseña y forzar cambio en próximo login
        await query(
            'UPDATE Usuarios SET password_hash = ?, require_password_change = TRUE WHERE id = ?',
            [password_hash, id]
        );
        
        // Log de auditoría
        await logManual(
            req,
            'PASSWORD_RESET',
            'Usuario',
            id,
            `Contraseña reseteada para: ${usuario.username}`,
            { username: usuario.username }
        );
        
        res.json({
            success: true,
            message: 'Contraseña reseteada correctamente. El usuario deberá cambiarla en su próximo inicio de sesión.'
        });
        
    } catch (error) {
        console.error('❌ Error reseteando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    resetPassword
};
