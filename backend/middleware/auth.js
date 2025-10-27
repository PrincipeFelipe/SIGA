// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ============================================================================
// Verifica que el usuario esté autenticado mediante JWT en cookies HttpOnly
// Protege todas las rutas excepto login
// ============================================================================

const { verifyToken, extractToken } = require('../config/jwt');
const { query } = require('../config/database');

/**
 * Middleware de autenticación
 * Verifica el token JWT y añade los datos del usuario a req.user
 */
async function authenticate(req, res, next) {
    try {
        // 1. Extraer token desde cookies o header
        const token = extractToken(req);
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }
        
        // 2. Verificar y decodificar el token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Token inválido o expirado'
            });
        }
        
        // 3. Verificar que el usuario existe y está activo
        const [usuario] = await query(
            `SELECT 
                u.id,
                u.username,
                u.nombre_completo,
                u.email,
                u.unidad_destino_id,
                u.activo,
                u.require_password_change,
                un.nombre as unidad_destino_nombre,
                un.codigo_unidad as unidad_destino_codigo
            FROM Usuarios u
            INNER JOIN Unidades un ON u.unidad_destino_id = un.id
            WHERE u.id = ? AND u.activo = TRUE`,
            [decoded.usuario_id]
        );
        
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }
        
        // 4. Actualizar último acceso (async, no bloqueante)
        query(
            'UPDATE Usuarios SET ultimo_acceso = NOW() WHERE id = ?',
            [usuario.id]
        ).catch(err => console.error('Error actualizando último acceso:', err));
        
        // 5. Añadir datos del usuario al request
        req.user = {
            id: usuario.id,
            username: usuario.username,
            nombre_completo: usuario.nombre_completo,
            email: usuario.email,
            unidad_destino_id: usuario.unidad_destino_id,
            unidad_destino_nombre: usuario.unidad_destino_nombre,
            unidad_destino_codigo: usuario.unidad_destino_codigo,
            require_password_change: usuario.require_password_change === 1
        };
        
        // 6. Continuar con el siguiente middleware/ruta
        next();
        
    } catch (error) {
        console.error('❌ Error en middleware de autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Middleware opcional de autenticación
 * Similar a authenticate pero no falla si no hay token
 * Útil para rutas públicas que pueden variar según autenticación
 */
async function optionalAuthenticate(req, res, next) {
    try {
        const token = extractToken(req);
        
        if (!token) {
            req.user = null;
            return next();
        }
        
        const decoded = verifyToken(token);
        
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
            WHERE u.id = ? AND u.activo = TRUE`,
            [decoded.usuario_id]
        );
        
        req.user = usuario || null;
        next();
        
    } catch (error) {
        req.user = null;
        next();
    }
}

/**
 * Middleware para verificar si el usuario requiere cambio de contraseña
 * Si require_password_change=true, solo permite acceso a /api/auth/change-password
 */
function requirePasswordChange(req, res, next) {
    if (req.user && req.user.require_password_change) {
        // Permitir solo el endpoint de cambio de contraseña
        if (req.path !== '/api/auth/change-password' && req.path !== '/api/auth/logout') {
            return res.status(403).json({
                success: false,
                message: 'Debe cambiar su contraseña antes de continuar',
                require_password_change: true
            });
        }
    }
    next();
}

module.exports = {
    authenticate,
    optionalAuthenticate,
    requirePasswordChange
};
