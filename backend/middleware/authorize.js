// ============================================================================
// MIDDLEWARE DE AUTORIZACIÓN JERÁRQUICA
// ============================================================================
// NÚCLEO DEL SISTEMA DE SEGURIDAD
// Verifica permisos y alcance jerárquico usando la tabla Usuario_Roles_Alcance
// ============================================================================

const { query } = require('../config/database');

/**
 * Verificar si el usuario tiene un permiso específico
 * @param {number} usuario_id - ID del usuario
 * @param {string} permiso_accion - Acción del permiso (ej: 'users:delete')
 * @returns {Promise<Array>} Array de alcances donde el usuario tiene el permiso
 */
async function obtenerAlcancesPermiso(usuario_id, permiso_accion) {
    const alcances = await query(
        `SELECT DISTINCT
            ura.unidad_alcance_id,
            un.nombre as unidad_alcance_nombre,
            un.tipo_unidad,
            un.codigo_unidad
        FROM Usuario_Roles_Alcance ura
        INNER JOIN Roles r ON ura.rol_id = r.id
        INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
        INNER JOIN Permisos p ON rp.permiso_id = p.id
        INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
        WHERE ura.usuario_id = ?
          AND p.accion = ?
          AND ura.activo = TRUE
          AND r.activo = TRUE
          AND p.activo = TRUE
          AND (ura.fecha_fin IS NULL OR ura.fecha_fin >= CURDATE())`,
        [usuario_id, permiso_accion]
    );
    
    return alcances;
}

/**
 * Verificar si una unidad objetivo está dentro del alcance permitido
 * Usa Recursive CTE para navegar el árbol jerárquico
 * @param {number} unidad_objetivo_id - ID de la unidad a verificar
 * @param {number} unidad_alcance_id - ID de la unidad de alcance
 * @returns {Promise<boolean>} True si la unidad objetivo es descendiente o igual a la de alcance
 */
async function esUnidadDentroDeAlcance(unidad_objetivo_id, unidad_alcance_id) {
    // Si son la misma unidad, siempre es verdadero
    if (unidad_objetivo_id === unidad_alcance_id) {
        return true;
    }
    
    // Consulta recursiva para obtener todos los descendientes
    const resultado = await query(
        `WITH RECURSIVE unidades_tree AS (
            -- Caso base: empezar con la unidad de alcance
            SELECT id, parent_id, nombre, tipo_unidad
            FROM Unidades
            WHERE id = ?
            
            UNION ALL
            
            -- Caso recursivo: obtener todos los hijos
            SELECT u.id, u.parent_id, u.nombre, u.tipo_unidad
            FROM Unidades u
            INNER JOIN unidades_tree ut ON u.parent_id = ut.id
        )
        SELECT COUNT(*) as encontrado
        FROM unidades_tree
        WHERE id = ?`,
        [unidad_alcance_id, unidad_objetivo_id]
    );
    
    return resultado[0].encontrado > 0;
}

/**
 * Verificar si el usuario puede acceder a múltiples unidades
 * @param {number} usuario_id - ID del usuario
 * @param {Array<number>} unidades_ids - Array de IDs de unidades
 * @param {string} permiso_accion - Acción del permiso
 * @returns {Promise<Object>} { permitido: boolean, unidades_accesibles: Array }
 */
async function verificarAccesoMultiplesUnidades(usuario_id, unidades_ids, permiso_accion) {
    const alcances = await obtenerAlcancesPermiso(usuario_id, permiso_accion);
    
    if (alcances.length === 0) {
        return { permitido: false, unidades_accesibles: [] };
    }
    
    const unidades_accesibles = [];
    
    for (const unidad_id of unidades_ids) {
        let tiene_acceso = false;
        
        for (const alcance of alcances) {
            const dentro_alcance = await esUnidadDentroDeAlcance(
                unidad_id,
                alcance.unidad_alcance_id
            );
            
            if (dentro_alcance) {
                tiene_acceso = true;
                break;
            }
        }
        
        if (tiene_acceso) {
            unidades_accesibles.push(unidad_id);
        }
    }
    
    return {
        permitido: unidades_accesibles.length === unidades_ids.length,
        unidades_accesibles
    };
}

/**
 * Middleware de autorización con verificación de alcance jerárquico
 * @param {string} permiso_requerido - Permiso necesario (ej: 'users:delete')
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.getRecursoUnidadId - Función para obtener la unidad del recurso
 * @returns {Function} Middleware de Express
 */
function authorize(permiso_requerido, options = {}) {
    return async function(req, res, next) {
        try {
            // 1. Verificar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }
            
            const usuario_id = req.user.id;
            
            // 2. Obtener los alcances donde el usuario tiene el permiso
            const alcances = await obtenerAlcancesPermiso(usuario_id, permiso_requerido);
            
            if (alcances.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta acción',
                    permiso_requerido
                });
            }
            
            // 3. Si no hay función para obtener unidad del recurso, solo verificar permiso
            if (!options.getRecursoUnidadId) {
                // El usuario tiene el permiso, permitir acceso
                req.authorization = {
                    alcances,
                    permiso: permiso_requerido
                };
                return next();
            }
            
            // 4. Obtener la unidad del recurso objetivo
            const recurso_unidad_id = await options.getRecursoUnidadId(req);
            
            if (!recurso_unidad_id) {
                // Si no se puede determinar la unidad, denegar por seguridad
                return res.status(403).json({
                    success: false,
                    message: 'No se pudo determinar la unidad del recurso'
                });
            }
            
            // 5. Verificar si el recurso está dentro de algún alcance permitido
            let acceso_permitido = false;
            let alcance_utilizado = null;
            
            for (const alcance of alcances) {
                const dentro_alcance = await esUnidadDentroDeAlcance(
                    recurso_unidad_id,
                    alcance.unidad_alcance_id
                );
                
                if (dentro_alcance) {
                    acceso_permitido = true;
                    alcance_utilizado = alcance;
                    break;
                }
            }
            
            if (!acceso_permitido) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para acceder a este recurso en esta unidad',
                    permiso_requerido
                });
            }
            
            // 6. Añadir información de autorización al request
            req.authorization = {
                alcances,
                alcance_utilizado,
                permiso: permiso_requerido,
                recurso_unidad_id
            };
            
            next();
            
        } catch (error) {
            console.error('❌ Error en middleware de autorización:', error);
            return res.status(500).json({
                success: false,
                message: 'Error verificando permisos'
            });
        }
    };
}

/**
 * Middleware simplificado que solo verifica permiso (sin alcance)
 * Útil para acciones que no requieren verificación jerárquica
 * @param {string} permiso_requerido - Permiso necesario
 * @returns {Function} Middleware de Express
 */
function requirePermission(permiso_requerido) {
    return async function(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }
            
            const alcances = await obtenerAlcancesPermiso(req.user.id, permiso_requerido);
            
            if (alcances.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta acción',
                    permiso_requerido
                });
            }
            
            req.authorization = {
                alcances,
                permiso: permiso_requerido
            };
            
            next();
            
        } catch (error) {
            console.error('❌ Error verificando permiso:', error);
            return res.status(500).json({
                success: false,
                message: 'Error verificando permisos'
            });
        }
    };
}

/**
 * Obtener todas las unidades accesibles para un usuario con un permiso específico
 * @param {number} usuario_id - ID del usuario
 * @param {string} permiso_accion - Acción del permiso
 * @returns {Promise<Array>} Array de IDs de unidades accesibles
 */
async function obtenerUnidadesAccesibles(usuario_id, permiso_accion) {
    const alcances = await obtenerAlcancesPermiso(usuario_id, permiso_accion);
    
    if (alcances.length === 0) {
        return [];
    }
    
    // Obtener todas las unidades descendientes de cada alcance
    const unidades_accesibles = new Set();
    
    for (const alcance of alcances) {
        const descendientes = await query(
            `WITH RECURSIVE unidades_tree AS (
                SELECT id FROM Unidades WHERE id = ?
                UNION ALL
                SELECT u.id FROM Unidades u
                INNER JOIN unidades_tree ut ON u.parent_id = ut.id
            )
            SELECT id FROM unidades_tree`,
            [alcance.unidad_alcance_id]
        );
        
        descendientes.forEach(u => unidades_accesibles.add(u.id));
    }
    
    return Array.from(unidades_accesibles);
}

module.exports = {
    authorize,
    requirePermission,
    obtenerAlcancesPermiso,
    esUnidadDentroDeAlcance,
    verificarAccesoMultiplesUnidades,
    obtenerUnidadesAccesibles
};
