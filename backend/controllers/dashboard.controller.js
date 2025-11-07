// ============================================================================
// CONTROLADOR DE DASHBOARD - Estadísticas generales según rol y permisos
// ============================================================================

const { query: db_query } = require('../config/database');
const conn = require('../config/database');

/**
 * Obtener estadísticas del dashboard según permisos del usuario
 * GET /api/dashboard/estadisticas
 */
const obtenerEstadisticas = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        
        // Obtener permisos del usuario
        const permisos = await db_query(
            `SELECT DISTINCT p.accion
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles r ON ura.rol_id = r.id
            INNER JOIN Roles_Permisos rp ON r.id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ?
              AND ura.activo = TRUE
              AND r.activo = TRUE
              AND p.activo = TRUE`,
            [usuario_id]
        );
        
        const permisosMap = {};
        permisos.forEach(p => {
            permisosMap[p.accion] = true;
        });
        
        const estadisticas = {
            usuarios: null,
            unidades: null,
            tareas: null,
            tareasPropias: null,
        };
        
        // =====================================================================
        // ESTADÍSTICAS DE USUARIOS (si tiene permisos)
        // =====================================================================
        if (permisosMap['users:view_all'] || permisosMap['users:view']) {
            let whereUsuarios = '';
            let paramsUsuarios = [];
            
            if (permisosMap['users:view_all']) {
                // Ver todos los usuarios
                whereUsuarios = '';
            } else if (permisosMap['users:view']) {
                // Ver usuarios del alcance jerárquico
                const { obtenerUnidadesAccesibles } = require('../middleware/authorize');
                const unidadesAccesibles = await obtenerUnidadesAccesibles(usuario_id, 'users:view');
                
                if (unidadesAccesibles.length > 0) {
                    const placeholders = unidadesAccesibles.map(() => '?').join(',');
                    whereUsuarios = `WHERE unidad_destino_id IN (${placeholders})`;
                    paramsUsuarios = unidadesAccesibles;
                } else {
                    whereUsuarios = 'WHERE 1=0'; // No puede ver ningún usuario
                }
            }
            
            const statsUsuarios = await conn.query(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END) as activos,
                    SUM(CASE WHEN activo = FALSE THEN 1 ELSE 0 END) as inactivos
                FROM Usuarios
                ${whereUsuarios}`,
                paramsUsuarios
            );
            
            estadisticas.usuarios = {
                total: parseInt(statsUsuarios[0].total),
                activos: parseInt(statsUsuarios[0].activos),
                inactivos: parseInt(statsUsuarios[0].inactivos),
            };
        }
        
        // =====================================================================
        // ESTADÍSTICAS DE UNIDADES (si tiene permisos)
        // =====================================================================
        if (permisosMap['units:view_all'] || permisosMap['units:view']) {
            let whereUnidades = '';
            let paramsUnidades = [];
            
            if (permisosMap['units:view_all']) {
                // Ver todas las unidades
                whereUnidades = '';
            } else if (permisosMap['units:view']) {
                // Ver unidades del alcance jerárquico
                const { obtenerUnidadesAccesibles } = require('../middleware/authorize');
                const unidadesAccesibles = await obtenerUnidadesAccesibles(usuario_id, 'units:view');
                
                if (unidadesAccesibles.length > 0) {
                    const placeholders = unidadesAccesibles.map(() => '?').join(',');
                    whereUnidades = `WHERE id IN (${placeholders})`;
                    paramsUnidades = unidadesAccesibles;
                } else {
                    whereUnidades = 'WHERE 1=0';
                }
            }
            
            const statsUnidades = await conn.query(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN tipo_unidad = 'Zona' THEN 1 ELSE 0 END) as zonas,
                    SUM(CASE WHEN tipo_unidad = 'Comandancia' THEN 1 ELSE 0 END) as comandancias,
                    SUM(CASE WHEN tipo_unidad = 'Compañia' THEN 1 ELSE 0 END) as companias,
                    SUM(CASE WHEN tipo_unidad = 'Puesto' THEN 1 ELSE 0 END) as puestos
                FROM Unidades
                ${whereUnidades}`,
                paramsUnidades
            );
            
            estadisticas.unidades = {
                total: parseInt(statsUnidades[0].total),
                zonas: parseInt(statsUnidades[0].zonas),
                comandancias: parseInt(statsUnidades[0].comandancias),
                companias: parseInt(statsUnidades[0].companias),
                puestos: parseInt(statsUnidades[0].puestos),
            };
        }
        
        // =====================================================================
        // ESTADÍSTICAS DE TAREAS JERÁRQUICAS (si tiene permisos)
        // =====================================================================
        if (permisosMap['tasks:view_all'] || permisosMap['tasks:view']) {
            let whereTareas = '';
            let paramsTareas = [];
            
            if (permisosMap['tasks:view_all']) {
                // Ver todas las tareas
                whereTareas = '';
            } else if (permisosMap['tasks:view']) {
                // Ver tareas del alcance jerárquico
                const { obtenerUnidadesAccesibles } = require('../middleware/authorize');
                const unidadesAccesibles = await obtenerUnidadesAccesibles(usuario_id, 'tasks:view');
                
                if (unidadesAccesibles.length > 0) {
                    const placeholders = unidadesAccesibles.map(() => '?').join(',');
                    whereTareas = `WHERE t.id IN (
                        SELECT t.id 
                        FROM Tareas t
                        INNER JOIN Usuarios ua ON t.asignado_a = ua.id
                        WHERE ua.unidad_destino_id IN (${placeholders})
                           OR t.asignado_a = ?
                           OR t.asignado_por = ?
                    )`;
                    paramsTareas = [...unidadesAccesibles, usuario_id, usuario_id];
                } else {
                    whereTareas = 'WHERE asignado_a = ? OR asignado_por = ?';
                    paramsTareas = [usuario_id, usuario_id];
                }
            }
            
            const statsTareas = await conn.query(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
                    SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                    SUM(CASE WHEN fecha_limite < CURDATE() AND estado NOT IN ('completada', 'cancelada') THEN 1 ELSE 0 END) as vencidas
                FROM Tareas t
                ${whereTareas}`,
                paramsTareas
            );
            
            estadisticas.tareas = {
                total: parseInt(statsTareas[0].total),
                pendientes: parseInt(statsTareas[0].pendientes || 0),
                en_progreso: parseInt(statsTareas[0].en_progreso || 0),
                completadas: parseInt(statsTareas[0].completadas || 0),
                vencidas: parseInt(statsTareas[0].vencidas || 0),
            };
        }
        
        // =====================================================================
        // ESTADÍSTICAS DE TAREAS PROPIAS (siempre disponible)
        // =====================================================================
        const statsTareasPropias = await conn.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN fecha_limite < CURDATE() AND estado NOT IN ('completada', 'cancelada') THEN 1 ELSE 0 END) as vencidas
            FROM Tareas
            WHERE asignado_a = ?`,
            [usuario_id]
        );
        
        estadisticas.tareasPropias = {
            total: parseInt(statsTareasPropias[0].total),
            pendientes: parseInt(statsTareasPropias[0].pendientes || 0),
            en_progreso: parseInt(statsTareasPropias[0].en_progreso || 0),
            completadas: parseInt(statsTareasPropias[0].completadas || 0),
            vencidas: parseInt(statsTareasPropias[0].vencidas || 0),
        };
        
        res.json({
            success: true,
            data: estadisticas,
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas del dashboard',
            error: error.message,
        });
    }
};

module.exports = {
    obtenerEstadisticas,
};
