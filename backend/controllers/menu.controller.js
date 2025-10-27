// ============================================================================
// CONTROLADOR DE MENÚ DINÁMICO
// ============================================================================
// Genera el menú del sidebar basado en los permisos del usuario
// ============================================================================

const { query } = require('../config/database');

/**
 * GET /api/menu
 * Obtener módulos/aplicaciones accesibles para el usuario actual
 */
async function obtenerMenu(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }
        
        // Obtener todas las aplicaciones para las cuales el usuario tiene el permiso requerido
        const aplicaciones = await query(
            `SELECT DISTINCT
                a.id,
                a.nombre,
                a.descripcion,
                a.ruta,
                a.icono,
                a.orden,
                a.parent_id
            FROM Aplicaciones a
            LEFT JOIN Permisos p ON a.permiso_requerido_id = p.id
            WHERE a.activo = TRUE
              AND (
                  a.permiso_requerido_id IS NULL  -- Aplicaciones públicas
                  OR EXISTS (
                      -- El usuario tiene el permiso requerido
                      SELECT 1
                      FROM Usuario_Roles_Alcance ura
                      INNER JOIN Roles r ON ura.rol_id = r.id
                      INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
                      WHERE ura.usuario_id = ?
                        AND rp.permiso_id = a.permiso_requerido_id
                        AND ura.activo = TRUE
                        AND r.activo = TRUE
                        AND (ura.fecha_fin IS NULL OR ura.fecha_fin >= CURDATE())
                  )
              )
            ORDER BY a.orden ASC, a.nombre ASC`,
            [req.user.id]
        );
        
        // Organizar en estructura de árbol (aplicaciones con sub-menús)
        const menuTree = organizarMenuTree(aplicaciones);
        
        res.json({
            success: true,
            menu: menuTree,
            total: aplicaciones.length
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo menú:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Organizar aplicaciones en estructura de árbol
 */
function organizarMenuTree(aplicaciones) {
    const itemsMap = new Map();
    const rootItems = [];
    
    // Crear mapa de items
    aplicaciones.forEach(app => {
        itemsMap.set(app.id, {
            ...app,
            children: []
        });
    });
    
    // Organizar en árbol
    aplicaciones.forEach(app => {
        const item = itemsMap.get(app.id);
        
        if (app.parent_id === null) {
            // Item de nivel raíz
            rootItems.push(item);
        } else {
            // Item hijo
            const parent = itemsMap.get(app.parent_id);
            if (parent) {
                parent.children.push(item);
            } else {
                // Si no existe el padre, agregar como raíz
                rootItems.push(item);
            }
        }
    });
    
    return rootItems;
}

module.exports = {
    obtenerMenu
};
