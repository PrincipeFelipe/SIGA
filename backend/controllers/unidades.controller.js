// ============================================================================
// CONTROLADOR DE UNIDADES
// ============================================================================
// Gestión del árbol jerárquico organizacional
// ============================================================================

const { query } = require('../config/database');
const { logManual } = require('../middleware/auditLog');

/**
 * GET /api/unidades
 * Obtener árbol completo de unidades
 */
async function obtenerArbol(req, res) {
    try {
        const { tipo_unidad, activo = 'true' } = req.query;
        
        let sql = `
            SELECT 
                id,
                nombre,
                tipo_unidad,
                codigo_unidad,
                parent_id,
                descripcion,
                activo,
                created_at
            FROM Unidades
            WHERE 1=1
        `;
        
        const params = [];
        
        if (tipo_unidad) {
            sql += ` AND tipo_unidad = ?`;
            params.push(tipo_unidad);
        }
        
        if (activo !== 'all') {
            sql += ` AND activo = ?`;
            params.push(activo === 'true');
        }
        
        sql += ` ORDER BY tipo_unidad, codigo_unidad, nombre`;
        
        const unidades = await query(sql, params);
        
        // Organizar en estructura de árbol
        const arbol = construirArbol(unidades);
        
        res.json({
            success: true,
            data: arbol,
            total: unidades.length
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo árbol de unidades:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * GET /api/unidades/lista
 * Obtener lista plana de unidades (para selects/dropdowns)
 */
async function obtenerLista(req, res) {
    try {
        const { activo = 'true' } = req.query;
        
        let sql = `
            SELECT 
                id,
                nombre,
                tipo_unidad,
                codigo_unidad,
                parent_id
            FROM Unidades
        `;
        
        if (activo !== 'all') {
            sql += ` WHERE activo = ?`;
        }
        
        sql += ` ORDER BY codigo_unidad, nombre`;
        
        const params = activo !== 'all' ? [activo === 'true'] : [];
        const unidades = await query(sql, params);
        
        res.json({
            success: true,
            data: unidades,
            total: unidades.length
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo lista de unidades:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * GET /api/unidades/:id
 * Obtener detalle de una unidad
 */
async function obtenerPorId(req, res) {
    try {
        const { id } = req.params;
        
        const [unidad] = await query(
            `SELECT 
                u.*,
                p.nombre as parent_nombre,
                p.codigo_unidad as parent_codigo
            FROM Unidades u
            LEFT JOIN Unidades p ON u.parent_id = p.id
            WHERE u.id = ?`,
            [id]
        );
        
        if (!unidad) {
            return res.status(404).json({
                success: false,
                message: 'Unidad no encontrada'
            });
        }
        
        // Obtener estadísticas
        const [stats] = await query(
            `SELECT 
                (SELECT COUNT(*) FROM Unidades WHERE parent_id = ?) as hijos_directos,
                (SELECT COUNT(*) FROM Usuarios WHERE unidad_destino_id = ? AND activo = TRUE) as usuarios_asignados
            `,
            [id, id]
        );
        
        res.json({
            success: true,
            data: {
                ...unidad,
                stats
            }
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo unidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * GET /api/unidades/:id/descendientes
 * Obtener todos los descendientes de una unidad (usando CTE recursivo)
 */
async function obtenerDescendientes(req, res) {
    try {
        const { id } = req.params;
        
        const descendientes = await query(
            `WITH RECURSIVE unidades_tree AS (
                -- Caso base: la unidad raíz
                SELECT 
                    id,
                    nombre,
                    tipo_unidad,
                    codigo_unidad,
                    parent_id,
                    0 as nivel
                FROM Unidades
                WHERE id = ?
                
                UNION ALL
                
                -- Caso recursivo: hijos de las unidades en el árbol
                SELECT 
                    u.id,
                    u.nombre,
                    u.tipo_unidad,
                    u.codigo_unidad,
                    u.parent_id,
                    ut.nivel + 1 as nivel
                FROM Unidades u
                INNER JOIN unidades_tree ut ON u.parent_id = ut.id
                WHERE u.activo = TRUE
            )
            SELECT * FROM unidades_tree
            ORDER BY nivel, codigo_unidad`,
            [id]
        );
        
        res.json({
            success: true,
            data: descendientes,
            total: descendientes.length
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo descendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * POST /api/unidades
 * Crear nueva unidad
 */
async function crear(req, res) {
    try {
        const {
            nombre,
            tipo_unidad,
            codigo_unidad,
            parent_id,
            descripcion
        } = req.body;
        
        // Validación
        if (!nombre || !tipo_unidad) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y tipo de unidad son requeridos'
            });
        }
        
        // Validar tipo de unidad
        const tiposValidos = ['Zona', 'Comandancia', 'Compañia', 'Puesto'];
        if (!tiposValidos.includes(tipo_unidad)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de unidad inválido'
            });
        }
        
        // Validar jerarquía (Zona no puede tener padre, otros sí)
        if (tipo_unidad === 'Zona' && parent_id) {
            return res.status(400).json({
                success: false,
                message: 'Una Zona no puede tener unidad padre'
            });
        }
        
        if (tipo_unidad !== 'Zona' && !parent_id) {
            return res.status(400).json({
                success: false,
                message: `Un ${tipo_unidad} debe tener una unidad padre`
            });
        }
        
        // Validar que el código no exista (si se proporciona)
        if (codigo_unidad) {
            const [existe] = await query(
                'SELECT id FROM Unidades WHERE codigo_unidad = ?',
                [codigo_unidad]
            );
            
            if (existe) {
                return res.status(400).json({
                    success: false,
                    message: 'El código de unidad ya existe'
                });
            }
        }
        
        // Crear unidad
        const resultado = await query(
            `INSERT INTO Unidades 
            (nombre, tipo_unidad, codigo_unidad, parent_id, descripcion)
            VALUES (?, ?, ?, ?, ?)`,
            [nombre, tipo_unidad, codigo_unidad, parent_id, descripcion]
        );
        
        const nuevaUnidadId = Number(resultado.insertId);
        
        // Log de auditoría
        await logManual(
            req,
            'CREATE',
            'Unidad',
            nuevaUnidadId,
            `Unidad creada: ${nombre}`,
            { nombre, tipo_unidad, codigo_unidad, parent_id }
        );
        
        // Obtener unidad completa
        const [unidad] = await query(
            'SELECT * FROM Unidades WHERE id = ?',
            [nuevaUnidadId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Unidad creada correctamente',
            data: unidad
        });
        
    } catch (error) {
        console.error('❌ Error creando unidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * PUT /api/unidades/:id
 * Actualizar unidad
 */
async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const { nombre, codigo_unidad, descripcion, activo } = req.body;
        
        // Verificar que la unidad existe
        const [unidad] = await query('SELECT id FROM Unidades WHERE id = ?', [id]);
        
        if (!unidad) {
            return res.status(404).json({
                success: false,
                message: 'Unidad no encontrada'
            });
        }
        
        // Construir query de actualización
        const updates = [];
        const params = [];
        
        if (nombre !== undefined) {
            updates.push('nombre = ?');
            params.push(nombre);
        }
        if (codigo_unidad !== undefined) {
            updates.push('codigo_unidad = ?');
            params.push(codigo_unidad);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
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
            `UPDATE Unidades SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        
        // Log de auditoría
        await logManual(
            req,
            'UPDATE',
            'Unidad',
            id,
            `Unidad actualizada: ID ${id}`,
            { nombre, codigo_unidad, descripcion, activo }
        );
        
        // Obtener unidad actualizada
        const [unidadActualizada] = await query(
            'SELECT * FROM Unidades WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Unidad actualizada correctamente',
            data: unidadActualizada
        });
        
    } catch (error) {
        console.error('❌ Error actualizando unidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * DELETE /api/unidades/:id
 * Eliminar unidad (solo si no tiene hijos ni usuarios asignados)
 */
async function eliminar(req, res) {
    try {
        const { id } = req.params;
        
        // Verificar que la unidad existe
        const [unidad] = await query(
            'SELECT nombre FROM Unidades WHERE id = ?',
            [id]
        );
        
        if (!unidad) {
            return res.status(404).json({
                success: false,
                message: 'Unidad no encontrada'
            });
        }
        
        // Verificar que no tiene hijos
        const [hijos] = await query(
            'SELECT COUNT(*) as count FROM Unidades WHERE parent_id = ?',
            [id]
        );
        
        if (hijos.count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una unidad que tiene sub-unidades'
            });
        }
        
        // Verificar que no tiene usuarios asignados
        const [usuarios] = await query(
            'SELECT COUNT(*) as count FROM Usuarios WHERE unidad_destino_id = ?',
            [id]
        );
        
        if (usuarios.count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una unidad que tiene usuarios asignados'
            });
        }
        
        // Eliminar (desactivar)
        await query('UPDATE Unidades SET activo = FALSE WHERE id = ?', [id]);
        
        // Log de auditoría
        await logManual(
            req,
            'DELETE',
            'Unidad',
            id,
            `Unidad desactivada: ${unidad.nombre}`,
            { nombre: unidad.nombre }
        );
        
        res.json({
            success: true,
            message: 'Unidad desactivada correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error eliminando unidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Construir estructura de árbol desde lista plana
 */
function construirArbol(unidades) {
    const map = new Map();
    const roots = [];
    
    // Crear mapa de unidades
    unidades.forEach(u => {
        map.set(u.id, { ...u, children: [] });
    });
    
    // Construir árbol
    unidades.forEach(u => {
        const node = map.get(u.id);
        if (u.parent_id === null) {
            roots.push(node);
        } else {
            const parent = map.get(u.parent_id);
            if (parent) {
                parent.children.push(node);
            }
        }
    });
    
    return roots;
}

module.exports = {
    obtenerArbol,
    obtenerLista,
    obtenerPorId,
    obtenerDescendientes,
    crear,
    actualizar,
    eliminar
};
