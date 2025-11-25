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
        
        // Validar jerarquía estricta según tipo de padre
        if (parent_id) {
            const [padre] = await query(
                'SELECT tipo_unidad FROM Unidades WHERE id = ?',
                [parent_id]
            );
            
            if (!padre) {
                return res.status(400).json({
                    success: false,
                    message: 'La unidad padre no existe'
                });
            }
            
            // Definir jerarquía permitida
            const jerarquiaPermitida = {
                'Zona': ['Comandancia'],
                'Comandancia': ['Compañia'],
                'Compañia': ['Puesto']
            };
            
            const tiposPermitidos = jerarquiaPermitida[padre.tipo_unidad];
            
            if (!tiposPermitidos) {
                return res.status(400).json({
                    success: false,
                    message: `Una unidad tipo ${padre.tipo_unidad} no puede tener unidades subordinadas`
                });
            }
            
            if (!tiposPermitidos.includes(tipo_unidad)) {
                const tipoEsperado = tiposPermitidos[0]; // Primer tipo permitido
                return res.status(400).json({
                    success: false,
                    message: `Una unidad subordinada a ${padre.tipo_unidad} solo puede ser de tipo ${tipoEsperado}`
                });
            }
        }
        
        // Para Zona: validar que el código se proporcione
        if (tipo_unidad === 'Zona' && !codigo_unidad) {
            return res.status(400).json({
                success: false,
                message: 'El código de Zona es requerido (ej: ZON01)'
            });
        }
        
        // Para unidades subordinadas: generar código automáticamente
        let codigoFinal = codigo_unidad;
        
        if (tipo_unidad !== 'Zona') {
            codigoFinal = await generarCodigoUnidad(tipo_unidad, parent_id);
        }
        
        // Validar que el código no exista
        if (codigoFinal) {
            const [existe] = await query(
                'SELECT id FROM Unidades WHERE codigo_unidad = ?',
                [codigoFinal]
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
            [nombre, tipo_unidad, codigoFinal, parent_id, descripcion]
        );
        
        const nuevaUnidadId = Number(resultado.insertId);
        
        // Log de auditoría
        await logManual(
            req,
            'CREATE',
            'Unidad',
            nuevaUnidadId,
            `Unidad creada: ${nombre}`,
            { nombre, tipo_unidad, codigo_unidad: codigoFinal, parent_id }
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
 * Generar código automático para unidades subordinadas
 * Formato: [codigo_padre]-[prefijo][numero]
 * Ej: ZON01-CMD01, ZON01-CMD01-CIA01, ZON01-CMD01-CIA01-PTO01
 */
async function generarCodigoUnidad(tipo_unidad, parent_id) {
    try {
        // Obtener código del padre
        const [padre] = await query(
            'SELECT codigo_unidad FROM Unidades WHERE id = ?',
            [parent_id]
        );
        
        if (!padre || !padre.codigo_unidad) {
            throw new Error('La unidad padre debe tener un código asignado');
        }
        
        // Determinar prefijo según tipo
        const prefijos = {
            'Comandancia': 'CMD',
            'Compañia': 'CIA',
            'Puesto': 'PTO'
        };
        
        const prefijo = prefijos[tipo_unidad];
        
        if (!prefijo) {
            throw new Error(`Tipo de unidad "${tipo_unidad}" no soporta generación automática de código`);
        }
        
        // Buscar el siguiente número disponible para este tipo bajo el mismo padre
        const hermanos = await query(
            `SELECT codigo_unidad 
             FROM Unidades 
             WHERE parent_id = ? 
               AND tipo_unidad = ? 
               AND codigo_unidad IS NOT NULL
             ORDER BY codigo_unidad`,
            [parent_id, tipo_unidad]
        );
        
        // Extraer números existentes
        let maxNumero = 0;
        const patron = new RegExp(`${prefijo}(\\d+)$`);
        
        hermanos.forEach(hermano => {
            const match = hermano.codigo_unidad.match(patron);
            if (match) {
                const numero = parseInt(match[1], 10);
                if (numero > maxNumero) {
                    maxNumero = numero;
                }
            }
        });
        
        // Generar nuevo código: padre + prefijo + (max + 1) con padding
        const nuevoNumero = String(maxNumero + 1).padStart(2, '0');
        const codigoGenerado = `${padre.codigo_unidad}-${prefijo}${nuevoNumero}`;
        
        return codigoGenerado;
        
    } catch (error) {
        console.error('❌ Error generando código de unidad:', error);
        throw error;
    }
}

/**
 * PUT /api/unidades/:id
 * Actualizar unidad (permite cambio de tipo y padre con actualización recursiva)
 */
async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const { nombre, tipo_unidad, parent_id, codigo_unidad, descripcion, activo } = req.body;
        
        // Verificar que la unidad existe
        const [unidad] = await query('SELECT * FROM Unidades WHERE id = ?', [id]);
        
        if (!unidad) {
            return res.status(404).json({
                success: false,
                message: 'Unidad no encontrada'
            });
        }

        // Si se cambia el tipo o el padre, validar jerarquía
        let nuevoTipo = tipo_unidad || unidad.tipo_unidad;
        let nuevoPadre = parent_id !== undefined ? parent_id : unidad.parent_id;
        let nuevoCodigo = codigo_unidad;
        
        // Validar cambio de tipo si se proporciona
        if (tipo_unidad && tipo_unidad !== unidad.tipo_unidad) {
            const tiposValidos = ['Zona', 'Comandancia', 'Compañia', 'Puesto'];
            if (!tiposValidos.includes(tipo_unidad)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de unidad inválido'
                });
            }
        }
        
        // Si se cambia el padre, validar jerarquía y regenerar código
        if (parent_id !== undefined && parent_id !== unidad.parent_id) {
            // Zona no puede tener padre
            if (nuevoTipo === 'Zona' && parent_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Una Zona no puede tener unidad padre'
                });
            }
            
            // Otros tipos deben tener padre
            if (nuevoTipo !== 'Zona' && !parent_id) {
                return res.status(400).json({
                    success: false,
                    message: `Un ${nuevoTipo} debe tener una unidad padre`
                });
            }
            
            // Si tiene padre, validar jerarquía estricta
            if (parent_id) {
                const [padre] = await query(
                    'SELECT tipo_unidad FROM Unidades WHERE id = ?',
                    [parent_id]
                );
                
                if (!padre) {
                    return res.status(404).json({
                        success: false,
                        message: 'Unidad padre no encontrada'
                    });
                }
                
                // Validar jerarquía estricta
                const jerarquiaValida = validarJerarquia(padre.tipo_unidad, nuevoTipo);
                if (!jerarquiaValida.valido) {
                    return res.status(400).json({
                        success: false,
                        message: jerarquiaValida.mensaje
                    });
                }
                
                // Si cambia el padre y no es Zona, regenerar código automáticamente
                if (nuevoTipo !== 'Zona') {
                    nuevoCodigo = await generarCodigoUnidad(nuevoTipo, parent_id);
                }
            }
        }

        // Si se proporciona código manual, verificar que no exista
        if (nuevoCodigo !== undefined && nuevoCodigo !== unidad.codigo_unidad) {
            const [existente] = await query(
                'SELECT id FROM Unidades WHERE codigo_unidad = ? AND id != ?',
                [nuevoCodigo, id]
            );
            
            if (existente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otra unidad con ese código'
                });
            }
        }
        
        // Construir query de actualización
        const updates = [];
        const params = [];
        
        if (nombre !== undefined) {
            updates.push('nombre = ?');
            params.push(nombre);
        }
        if (nuevoTipo !== unidad.tipo_unidad) {
            updates.push('tipo_unidad = ?');
            params.push(nuevoTipo);
        }
        if (nuevoPadre !== unidad.parent_id) {
            updates.push('parent_id = ?');
            params.push(nuevoPadre);
        }
        if (nuevoCodigo !== undefined) {
            updates.push('codigo_unidad = ?');
            params.push(nuevoCodigo);
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

        // Si se cambió el tipo o el padre, actualizar recursivamente descendientes
        let unidadesActualizadas = 1;
        let tiposActualizados = [];
        
        if ((nuevoTipo !== unidad.tipo_unidad) || (nuevoPadre !== unidad.parent_id)) {
            const resultado = await actualizarDescendientesRecursivo(id, nuevoTipo, nuevoCodigo || unidad.codigo_unidad);
            unidadesActualizadas += resultado.total;
            tiposActualizados = resultado.cambios;
        } else if (nuevoCodigo !== undefined && nuevoCodigo !== unidad.codigo_unidad) {
            // Solo actualizar códigos si no se cambió tipo ni padre
            unidadesActualizadas = await actualizarCodigosDescendientes(id, unidad.codigo_unidad, nuevoCodigo);
        }
        
        // Log de auditoría
        const cambiosRealizados = {
            nombre: nombre !== undefined,
            tipo_unidad: nuevoTipo !== unidad.tipo_unidad,
            parent_id: nuevoPadre !== unidad.parent_id,
            codigo_unidad: nuevoCodigo !== unidad.codigo_unidad,
            unidades_afectadas: unidadesActualizadas,
            tipos_actualizados: tiposActualizados
        };
        
        await logManual(
            req,
            'UPDATE',
            'Unidad',
            id,
            `Unidad actualizada: ${nombre || unidad.nombre}${unidadesActualizadas > 1 ? ` (+${unidadesActualizadas - 1} descendientes)` : ''}`,
            cambiosRealizados
        );
        
        // Obtener unidad actualizada
        const [unidadActualizada] = await query(
            'SELECT * FROM Unidades WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: `Unidad actualizada correctamente${unidadesActualizadas > 1 ? ` (${unidadesActualizadas} unidades afectadas)` : ''}`,
            data: unidadActualizada,
            unidades_actualizadas: unidadesActualizadas
        });
        
    } catch (error) {
        console.error('❌ Error actualizando unidad:', error);
        
        // Si es un error de código duplicado, devolver mensaje específico
        if (error.message && error.message.includes('ya está asignado')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        // Si es un error SQL de clave duplicada
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(400).json({
                success: false,
                message: 'El código de unidad ya existe. Por favor, elige otro código único.'
            });
        }
        
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
        
        // Verificar que no tiene hijos ACTIVOS
        const [hijos] = await query(
            'SELECT COUNT(*) as count FROM Unidades WHERE parent_id = ? AND activo = TRUE',
            [id]
        );
        
        if (hijos.count > 0) {
            const plural = hijos.count > 1;
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar la unidad "${unidad.nombre}" porque tiene ${hijos.count} sub-unidad${plural ? 'es' : ''} activa${plural ? 's' : ''}. Primero debes eliminar o desactivar ${plural ? 'estas sub-unidades' : 'esta sub-unidad'}.`
            });
        }
        
        // Verificar que no tiene usuarios ACTIVOS asignados
        const [usuarios] = await query(
            'SELECT COUNT(*) as count FROM Usuarios WHERE unidad_destino_id = ? AND activo = TRUE',
            [id]
        );
        
        if (usuarios.count > 0) {
            const plural = usuarios.count > 1;
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar la unidad "${unidad.nombre}" porque tiene ${usuarios.count} usuario${plural ? 's' : ''} activo${plural ? 's' : ''} asignado${plural ? 's' : ''}. Primero debes reasignar o desactivar ${plural ? 'estos usuarios' : 'este usuario'}.`
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
 * Actualizar recursivamente los códigos de todas las unidades descendientes
 * cuando se cambia el código de una unidad padre
 */
async function actualizarCodigosDescendientes(unidadId, codigoAntiguo, codigoNuevo) {
    try {
        let totalActualizadas = 1; // Contar la unidad padre
        
        // Obtener todos los hijos directos
        const hijos = await query(
            'SELECT id, codigo_unidad, nombre FROM Unidades WHERE parent_id = ?',
            [unidadId]
        );
        
        if (hijos.length === 0) {
            return totalActualizadas;
        }
        
        // Actualizar código de cada hijo
        for (const hijo of hijos) {
            if (hijo.codigo_unidad && hijo.codigo_unidad.startsWith(codigoAntiguo)) {
                // Reemplazar el prefijo del código antiguo por el nuevo
                const nuevoCodigo = hijo.codigo_unidad.replace(codigoAntiguo, codigoNuevo);
                
                // Verificar si el nuevo código ya existe en otra unidad
                const [existente] = await query(
                    'SELECT id, nombre FROM Unidades WHERE codigo_unidad = ? AND id != ?',
                    [nuevoCodigo, hijo.id]
                );
                
                if (existente) {
                    throw new Error(
                        `No se puede actualizar: el código "${nuevoCodigo}" ya está asignado a la unidad "${existente.nombre}" (ID: ${existente.id}). ` +
                        `Esto causaría un conflicto con "${hijo.nombre}" (ID: ${hijo.id}).`
                    );
                }
                
                await query(
                    'UPDATE Unidades SET codigo_unidad = ? WHERE id = ?',
                    [nuevoCodigo, hijo.id]
                );
                
                totalActualizadas++;
                
                // Actualizar recursivamente los descendientes de este hijo
                const descendientes = await actualizarCodigosDescendientes(
                    hijo.id, 
                    hijo.codigo_unidad, 
                    nuevoCodigo
                );
                
                totalActualizadas += descendientes - 1; // Restar 1 porque ya contamos el hijo
            }
        }
        
        return totalActualizadas;
        
    } catch (error) {
        console.error('❌ Error actualizando códigos descendientes:', error);
        throw error;
    }
}

/**
 * Validar jerarquía estricta: padre → hijo permitido
 */
function validarJerarquia(tipoPadre, tipoHijo) {
    const jerarquiaPermitida = {
        'Zona': ['Comandancia'],
        'Comandancia': ['Compañia'],
        'Compañia': ['Puesto'],
        'Puesto': []
    };
    
    const hijosPermitidos = jerarquiaPermitida[tipoPadre];
    
    if (!hijosPermitidos) {
        return {
            valido: false,
            mensaje: `Tipo de padre "${tipoPadre}" no reconocido`
        };
    }
    
    if (hijosPermitidos.length === 0) {
        return {
            valido: false,
            mensaje: `Una unidad tipo ${tipoPadre} no puede tener unidades subordinadas`
        };
    }
    
    if (!hijosPermitidos.includes(tipoHijo)) {
        return {
            valido: false,
            mensaje: `Una unidad subordinada a ${tipoPadre} solo puede ser de tipo ${hijosPermitidos.join(' o ')}`
        };
    }
    
    return { valido: true };
}

/**
 * Determinar el tipo correcto para un hijo según el tipo del padre
 */
function obtenerTipoHijoSegunPadre(tipoPadre) {
    const mapaTipos = {
        'Zona': 'Comandancia',
        'Comandancia': 'Compañia',
        'Compañia': 'Puesto'
    };
    
    return mapaTipos[tipoPadre] || null;
}

/**
 * Actualizar recursivamente tipos y códigos de unidades descendientes
 * cuando se cambia el tipo o padre de una unidad
 */
async function actualizarDescendientesRecursivo(unidadId, tipopadreNuevo, codigoPadreNuevo) {
    try {
        let totalActualizadas = 0;
        const cambios = [];
        
        // Obtener todos los hijos directos
        const hijos = await query(
            'SELECT id, nombre, tipo_unidad, codigo_unidad FROM Unidades WHERE parent_id = ?',
            [unidadId]
        );
        
        if (hijos.length === 0) {
            return { total: totalActualizadas, cambios };
        }
        
        // Determinar el tipo correcto para los hijos según el nuevo tipo del padre
        const tipoHijoCorrecto = obtenerTipoHijoSegunPadre(tipopadreNuevo);
        
        if (!tipoHijoCorrecto) {
            // El padre no puede tener hijos (ej: Puesto)
            throw new Error(`Una unidad tipo ${tipopadreNuevo} no puede tener unidades subordinadas`);
        }
        
        // Actualizar cada hijo
        for (const hijo of hijos) {
            const tipoAntiguo = hijo.tipo_unidad;
            const codigoAntiguo = hijo.codigo_unidad;
            
            // Generar nuevo código automático para el hijo
            const nuevoCodigoHijo = await generarCodigoUnidad(tipoHijoCorrecto, unidadId);
            
            // Actualizar tipo y código del hijo
            await query(
                'UPDATE Unidades SET tipo_unidad = ?, codigo_unidad = ? WHERE id = ?',
                [tipoHijoCorrecto, nuevoCodigoHijo, hijo.id]
            );
            
            totalActualizadas++;
            cambios.push({
                id: hijo.id,
                nombre: hijo.nombre,
                tipo_antiguo: tipoAntiguo,
                tipo_nuevo: tipoHijoCorrecto,
                codigo_antiguo: codigoAntiguo,
                codigo_nuevo: nuevoCodigoHijo
            });
            
            // Actualizar recursivamente los descendientes de este hijo
            const resultado = await actualizarDescendientesRecursivo(
                hijo.id,
                tipoHijoCorrecto,
                nuevoCodigoHijo
            );
            
            totalActualizadas += resultado.total;
            cambios.push(...resultado.cambios);
        }
        
        return { total: totalActualizadas, cambios };
        
    } catch (error) {
        console.error('❌ Error actualizando descendientes recursivamente:', error);
        throw error;
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
        map.set(u.id, { ...u, hijos: [] });
    });
    
    // Construir árbol
    unidades.forEach(u => {
        const node = map.get(u.id);
        if (u.parent_id === null) {
            roots.push(node);
        } else {
            const parent = map.get(u.parent_id);
            if (parent) {
                parent.hijos.push(node);
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
