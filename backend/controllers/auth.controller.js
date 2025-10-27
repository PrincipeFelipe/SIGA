// ============================================================================
// CONTROLADOR DE AUTENTICACIÓN
// ============================================================================
// Maneja login, logout, verificación de sesión y cambio de contraseña
// ============================================================================

const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { generateToken, getCookieOptions, JWT_COOKIE_NAME } = require('../config/jwt');
const { logManual } = require('../middleware/auditLog');

/**
 * POST /api/auth/login
 * Iniciar sesión con username y password
 */
async function login(req, res) {
    try {
        const { username, password } = req.body;
        
        // Validación básica
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }
        
        // Buscar usuario por username
        const [usuario] = await query(
            `SELECT 
                u.id,
                u.username,
                u.password_hash,
                u.nombre_completo,
                u.email,
                u.unidad_destino_id,
                u.activo,
                u.require_password_change,
                un.nombre as unidad_destino_nombre,
                un.codigo_unidad
            FROM Usuarios u
            INNER JOIN Unidades un ON u.unidad_destino_id = un.id
            WHERE u.username = ?`,
            [username]
        );
        
        // Verificar que el usuario existe
        if (!usuario) {
            await logManual(
                req,
                'LOGIN_FAILED',
                'Usuario',
                null,
                `Intento de login fallido: usuario no encontrado (${username})`,
                { username }
            );
            
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Verificar que el usuario está activo
        if (!usuario.activo) {
            await logManual(
                req,
                'LOGIN_FAILED',
                'Usuario',
                usuario.id,
                `Intento de login de usuario inactivo (${username})`,
                { username }
            );
            
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo. Contacte al administrador.'
            });
        }
        
        // Verificar la contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordValida) {
            await logManual(
                req,
                'LOGIN_FAILED',
                'Usuario',
                usuario.id,
                `Intento de login fallido: contraseña incorrecta (${username})`,
                { username }
            );
            
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Generar token JWT
        const token = generateToken({
            usuario_id: usuario.id,
            username: usuario.username
        });
        
        // Configurar cookie con el token
        const cookieOptions = getCookieOptions(process.env.NODE_ENV === 'production');
        res.cookie(JWT_COOKIE_NAME, token, cookieOptions);
        
        // Log de éxito (pasamos usuario.id como último parámetro porque req.user aún no existe)
        await logManual(
            req,
            'LOGIN_SUCCESS',
            'Usuario',
            usuario.id,
            `Login exitoso: ${usuario.username}`,
            { username: usuario.username },
            usuario.id // Pasar explícitamente el ID porque req.user no existe en login
        );
        
        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: usuario.id,
                username: usuario.username,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                activo: usuario.activo === 1,
                unidad_destino: {
                    id: usuario.unidad_destino_id,
                    nombre: usuario.unidad_destino_nombre,
                    codigo: usuario.codigo_unidad
                },
                require_password_change: usuario.require_password_change === 1
            }
        });
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * POST /api/auth/logout
 * Cerrar sesión eliminando la cookie
 */
async function logout(req, res) {
    try {
        // Log de logout
        if (req.user) {
            await logManual(
                req,
                'LOGOUT',
                'Usuario',
                req.user.id,
                `Logout: ${req.user.username}`,
                {}
            );
        }
        
        // Eliminar la cookie
        res.clearCookie(JWT_COOKIE_NAME);
        
        res.json({
            success: true,
            message: 'Logout exitoso'
        });
        
    } catch (error) {
        console.error('❌ Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * GET /api/auth/me
 * Obtener información del usuario actual (sesión activa)
 */
async function me(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }
        
        // Obtener información completa del usuario incluyendo roles y permisos
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
                un.nombre as unidad_destino_nombre,
                un.codigo_unidad,
                un.tipo_unidad
            FROM Usuarios u
            INNER JOIN Unidades un ON u.unidad_destino_id = un.id
            WHERE u.id = ? AND u.activo = TRUE`,
            [req.user.id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Obtener roles y alcances del usuario
        const rolesAlcance = await query(
            `SELECT 
                r.id as rol_id,
                r.nombre as rol_nombre,
                ura.unidad_alcance_id,
                un.nombre as unidad_alcance_nombre,
                un.codigo_unidad as unidad_alcance_codigo,
                un.tipo_unidad as unidad_alcance_tipo
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
            WHERE ura.usuario_id = ?
              AND ura.activo = TRUE
              AND (ura.fecha_fin IS NULL OR ura.fecha_fin >= CURDATE())`,
            [usuario.id]
        );
        
        res.json({
            success: true,
            user: {
                id: usuario.id,
                username: usuario.username,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                activo: usuario.activo === 1,
                unidad_destino: {
                    id: usuario.unidad_destino_id,
                    nombre: usuario.unidad_destino_nombre,
                    codigo: usuario.codigo_unidad,
                    tipo: usuario.tipo_unidad
                },
                roles_alcance: rolesAlcance,
                require_password_change: usuario.require_password_change === 1,
                ultimo_acceso: usuario.ultimo_acceso
            }
        });
        
    } catch (error) {
        console.error('❌ Error en /me:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * POST /api/auth/change-password
 * Cambiar contraseña (propia o forzada)
 */
async function changePassword(req, res) {
    try {
        const { current_password, new_password } = req.body;
        
        // Validación
        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }
        
        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }
        
        // Obtener usuario
        const [usuario] = await query(
            'SELECT id, username, password_hash FROM Usuarios WHERE id = ?',
            [req.user.id]
        );
        
        // Verificar contraseña actual
        const passwordValida = await bcrypt.compare(current_password, usuario.password_hash);
        
        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }
        
        // Hashear nueva contraseña
        const new_password_hash = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
        
        // Actualizar contraseña
        await query(
            'UPDATE Usuarios SET password_hash = ?, require_password_change = FALSE WHERE id = ?',
            [new_password_hash, usuario.id]
        );
        
        // Log
        await logManual(
            req,
            'PASSWORD_CHANGE',
            'Usuario',
            usuario.id,
            `Cambio de contraseña: ${usuario.username}`,
            {}
        );
        
        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

module.exports = {
    login,
    logout,
    me,
    changePassword
};
