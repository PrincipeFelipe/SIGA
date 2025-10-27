// ============================================================================
// CONFIGURACIÓN DE JWT (JSON WEB TOKENS)
// ============================================================================
// Configuración centralizada para generación y verificación de tokens
// ============================================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_CHANGE_THIS_IN_PRODUCTION';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'siga_token';

/**
 * Generar un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} payload.usuario_id - ID del usuario
 * @param {string} payload.username - Nombre de usuario
 * @returns {string} Token JWT firmado
 */
function generateToken(payload) {
    try {
        const token = jwt.sign(
            {
                usuario_id: payload.usuario_id,
                username: payload.username,
                iat: Math.floor(Date.now() / 1000) // Timestamp de creación
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN,
                issuer: 'SIGA',
                audience: 'SIGA-Users'
            }
        );
        
        return token;
    } catch (error) {
        console.error('❌ Error generando token JWT:', error);
        throw new Error('Error generando token de autenticación');
    }
}

/**
 * Verificar y decodificar un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado del token
 * @throws {Error} Si el token es inválido o ha expirado
 */
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'SIGA',
            audience: 'SIGA-Users'
        });
        
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        } else {
            console.error('❌ Error verificando token:', error);
            throw new Error('Error verificando token');
        }
    }
}

/**
 * Decodificar un token sin verificar (útil para debugging)
 * @param {string} token - Token a decodificar
 * @returns {Object|null} Payload decodificado o null si falla
 */
function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('❌ Error decodificando token:', error);
        return null;
    }
}

/**
 * Configuración de cookie para el token
 * @param {boolean} production - Si está en producción
 * @returns {Object} Opciones de cookie
 */
function getCookieOptions(production = false) {
    return {
        httpOnly: true, // No accesible desde JavaScript del cliente
        secure: production, // Solo HTTPS en producción
        sameSite: 'strict', // Protección CSRF
        maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
        path: '/' // Cookie disponible en toda la aplicación
    };
}

/**
 * Extraer token desde cookies o header Authorization
 * @param {Object} req - Request de Express
 * @returns {string|null} Token o null si no se encuentra
 */
function extractToken(req) {
    // 1. Intentar obtener desde cookie (preferido)
    if (req.cookies && req.cookies[JWT_COOKIE_NAME]) {
        return req.cookies[JWT_COOKIE_NAME];
    }
    
    // 2. Intentar obtener desde header Authorization (fallback)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    return null;
}

module.exports = {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_COOKIE_NAME,
    generateToken,
    verifyToken,
    decodeToken,
    getCookieOptions,
    extractToken
};
