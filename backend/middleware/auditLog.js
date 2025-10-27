// ============================================================================
// MIDDLEWARE DE LOGS DE AUDITORÍA
// ============================================================================
// Registra todas las acciones CUD (Crear, Actualizar, Eliminar) en la base de datos
// ============================================================================

const { query } = require('../config/database');

/**
 * Registrar una acción en los logs de auditoría
 * @param {Object} params - Parámetros del log
 * @param {number} params.usuario_id - ID del usuario que realizó la acción
 * @param {string} params.accion - Tipo de acción (CREATE, UPDATE, DELETE, etc)
 * @param {string} params.recurso_tipo - Tipo de recurso afectado
 * @param {string|number} params.recurso_id - ID del recurso
 * @param {string} params.descripcion - Descripción de la acción
 * @param {Object} params.detalles - Detalles adicionales (se guardará como JSON)
 * @param {string} params.ip_address - IP del cliente
 * @param {string} params.user_agent - User agent del navegador
 */
async function registrarLog(params) {
    try {
        await query(
            `INSERT INTO Logs 
            (usuario_id, accion, recurso_tipo, recurso_id, descripcion, detalles_json, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                params.usuario_id,
                params.accion,
                params.recurso_tipo,
                params.recurso_id?.toString() || null,
                params.descripcion,
                params.detalles ? JSON.stringify(params.detalles) : null,
                params.ip_address,
                params.user_agent
            ]
        );
    } catch (error) {
        // No fallar la operación principal si falla el log
        console.error('❌ Error registrando log de auditoría:', error);
    }
}

/**
 * Middleware para registrar automáticamente logs de auditoría
 * Se ejecuta después de la acción exitosa
 * @param {string} recurso_tipo - Tipo de recurso (Usuario, Unidad, Rol, etc)
 * @returns {Function} Middleware de Express
 */
function auditLog(recurso_tipo) {
    return function(req, res, next) {
        // Guardar el método send original
        const originalSend = res.send;
        
        // Sobrescribir el método send
        res.send = function(data) {
            // Intentar parsear la respuesta
            let responseData;
            try {
                responseData = typeof data === 'string' ? JSON.parse(data) : data;
            } catch {
                responseData = {};
            }
            
            // Solo registrar si la operación fue exitosa
            if (res.statusCode >= 200 && res.statusCode < 300 && responseData.success !== false) {
                // Determinar el tipo de acción según el método HTTP
                let accion;
                switch (req.method) {
                    case 'POST':
                        accion = 'CREATE';
                        break;
                    case 'PUT':
                    case 'PATCH':
                        accion = 'UPDATE';
                        break;
                    case 'DELETE':
                        accion = 'DELETE';
                        break;
                    default:
                        accion = req.method;
                }
                
                // Obtener ID del recurso desde params, body o response
                const recurso_id = req.params.id || 
                                  req.body.id || 
                                  responseData.data?.id ||
                                  responseData.id;
                
                // Generar descripción
                const descripcion = generarDescripcion(accion, recurso_tipo, req);
                
                // Registrar el log (async, no bloqueante)
                registrarLog({
                    usuario_id: req.user?.id,
                    accion,
                    recurso_tipo,
                    recurso_id,
                    descripcion,
                    detalles: {
                        path: req.path,
                        method: req.method,
                        params: req.params,
                        query: req.query,
                        body: sanitizarBody(req.body),
                        response: sanitizarResponse(responseData)
                    },
                    ip_address: obtenerIP(req),
                    user_agent: req.headers['user-agent']
                });
            }
            
            // Llamar al método original
            return originalSend.call(this, data);
        };
        
        next();
    };
}

/**
 * Generar descripción legible de la acción
 */
function generarDescripcion(accion, recurso_tipo, req) {
    const usuario = req.user?.username || 'Sistema';
    
    switch (accion) {
        case 'CREATE':
            return `${usuario} creó un nuevo ${recurso_tipo}`;
        case 'UPDATE':
            return `${usuario} actualizó ${recurso_tipo} ID ${req.params.id}`;
        case 'DELETE':
            return `${usuario} eliminó ${recurso_tipo} ID ${req.params.id}`;
        default:
            return `${usuario} realizó ${accion} en ${recurso_tipo}`;
    }
}

/**
 * Sanitizar el body eliminando información sensible
 */
function sanitizarBody(body) {
    if (!body) return {};
    
    const sanitizado = { ...body };
    
    // Eliminar campos sensibles
    const camposSensibles = ['password', 'password_hash', 'token', 'secret', 'api_key'];
    camposSensibles.forEach(campo => {
        if (sanitizado[campo]) {
            sanitizado[campo] = '[REDACTED]';
        }
    });
    
    return sanitizado;
}

/**
 * Sanitizar response eliminando información sensible
 */
function sanitizarResponse(response) {
    if (!response) return {};
    
    // Si es un array grande, solo guardar el count
    if (Array.isArray(response.data) && response.data.length > 10) {
        return {
            ...response,
            data: `[${response.data.length} registros]`
        };
    }
    
    return response;
}

/**
 * Obtener IP del cliente considerando proxies
 */
function obtenerIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.ip;
}

/**
 * Función helper para registrar logs manualmente desde controllers
 * @param {Object} req - Request object
 * @param {string} accion - Acción realizada
 * @param {string} recurso_tipo - Tipo de recurso
 * @param {number} recurso_id - ID del recurso
 * @param {string} descripcion - Descripción del log
 * @param {Object} detalles - Detalles adicionales
 * @param {number} usuario_id_override - ID del usuario (opcional, para casos como login)
 */
async function logManual(req, accion, recurso_tipo, recurso_id, descripcion, detalles = {}, usuario_id_override = null) {
    await registrarLog({
        usuario_id: usuario_id_override || req.user?.id,
        accion,
        recurso_tipo,
        recurso_id,
        descripcion,
        detalles,
        ip_address: obtenerIP(req),
        user_agent: req.headers['user-agent']
    });
}

module.exports = {
    auditLog,
    registrarLog,
    logManual
};
