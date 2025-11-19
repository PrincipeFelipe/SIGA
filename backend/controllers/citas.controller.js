const { query } = require('../config/database');

// ============================================================================
// CONTROLADOR DE CITAS
// ============================================================================

/**
 * Obtener todas las citas con filtrado jerárquico
 */
exports.getAll = async (req, res) => {
    try {
        const {
            vehiculo_id,
            tipo_cita_id,
            estado,
            fecha_desde,
            fecha_hasta,
            unidad_id,
            page = 1,
            limit = 50
        } = req.query;

        const offset = (page - 1) * limit;
        const userId = req.user.id;

        // Verificar permisos
        const permisoVerTodos = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ? AND p.accion = 'appointments:view_all' AND p.activo = 1`,
            [userId]
        );

        const permisoVerPropias = await query(
            `SELECT COUNT(*) as tiene_permiso
            FROM Usuario_Roles_Alcance ura
            INNER JOIN Roles_Permisos rp ON ura.rol_id = rp.rol_id
            INNER JOIN Permisos p ON rp.permiso_id = p.id
            WHERE ura.usuario_id = ? AND p.accion = 'appointments:view_own' AND p.activo = 1`,
            [userId]
        );

        const puedeVerTodos = permisoVerTodos[0].tiene_permiso > 0;
        const puedeVerPropias = permisoVerPropias[0].tiene_permiso > 0;

        let whereClause = 'WHERE 1=1';
        let params = [];

        // Filtrar según permisos
        if (puedeVerPropias && !puedeVerTodos) {
            whereClause += ' AND c.usuario_solicitante_id = ?';
            params.push(userId);
        } else if (!puedeVerTodos) {
            // Filtrar por alcance jerárquico
            const unidadesAcceso = await query(
                `WITH RECURSIVE unidades_accesibles AS (
                    SELECT DISTINCT ura.unidad_destino_id as unidad_id
                    FROM Usuario_Roles_Alcance ura
                    WHERE ura.usuario_id = ?
                    UNION
                    SELECT u.id
                    FROM Unidades u
                    INNER JOIN unidades_accesibles ua ON es_unidad_descendiente(u.id, ua.unidad_id)
                )
                SELECT DISTINCT unidad_id FROM unidades_accesibles`,
                [userId]
            );

            if (unidadesAcceso.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    total: 0,
                    page: parseInt(page),
                    totalPages: 0
                });
            }

            const unidadIds = unidadesAcceso.map(u => u.unidad_id);
            whereClause += ` AND v.unidad_id IN (${unidadIds.join(',')})`;
        }

        // Filtros adicionales
        if (vehiculo_id) {
            whereClause += ' AND c.vehiculo_id = ?';
            params.push(vehiculo_id);
        }

        if (tipo_cita_id) {
            whereClause += ' AND c.tipo_cita_id = ?';
            params.push(tipo_cita_id);
        }

        if (estado) {
            whereClause += ' AND c.estado = ?';
            params.push(estado);
        }

        if (fecha_desde) {
            whereClause += ' AND c.fecha_hora_inicio >= ?';
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            whereClause += ' AND c.fecha_hora_inicio <= ?';
            params.push(fecha_hasta);
        }

        if (unidad_id) {
            whereClause += ' AND v.unidad_id = ?';
            params.push(unidad_id);
        }

        // Consulta de datos
        const citas = await query(
            `SELECT 
                c.*,
                v.matricula,
                v.marca,
                v.modelo,
                v.tipo_vehiculo,
                tc.nombre as tipo_cita_nombre,
                tc.color as tipo_cita_color,
                tc.duracion_minutos,
                u.nombre as unidad_nombre,
                u.codigo_unidad,
                us.nombre_completo as solicitante_nombre,
                uc.nombre_completo as creador_nombre
            FROM Citas c
            INNER JOIN Vehiculos v ON c.vehiculo_id = v.id
            INNER JOIN TiposCita tc ON c.tipo_cita_id = tc.id
            INNER JOIN Unidades u ON v.unidad_id = u.id
            LEFT JOIN Usuarios us ON c.usuario_solicitante_id = us.id
            LEFT JOIN Usuarios uc ON c.creado_por = uc.id
            ${whereClause}
            ORDER BY c.fecha_hora_inicio DESC
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Contar total
        const totalResult = await query(
            `SELECT COUNT(*) as total
            FROM Citas c
            INNER JOIN Vehiculos v ON c.vehiculo_id = v.id
            ${whereClause}`,
            params
        );

        const total = totalResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: citas,
            total,
            page: parseInt(page),
            totalPages
        });

    } catch (error) {
        console.error('Error en getAll citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener citas',
            error: error.message
        });
    }
};

/**
 * Obtener una cita por ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const citas = await query(
            `SELECT 
                c.*,
                v.matricula,
                v.marca,
                v.modelo,
                v.tipo_vehiculo,
                v.kilometraje,
                tc.nombre as tipo_cita_nombre,
                tc.descripcion as tipo_cita_descripcion,
                tc.color as tipo_cita_color,
                tc.duracion_minutos,
                u.nombre as unidad_nombre,
                u.codigo_unidad,
                us.nombre_completo as solicitante_nombre,
                us.email as solicitante_email,
                uc.nombre_completo as creador_nombre,
                ua.nombre_completo as actualizador_nombre
            FROM Citas c
            INNER JOIN Vehiculos v ON c.vehiculo_id = v.id
            INNER JOIN TiposCita tc ON c.tipo_cita_id = tc.id
            INNER JOIN Unidades u ON v.unidad_id = u.id
            LEFT JOIN Usuarios us ON c.usuario_solicitante_id = us.id
            LEFT JOIN Usuarios uc ON c.creado_por = uc.id
            LEFT JOIN Usuarios ua ON c.actualizado_por = ua.id
            WHERE c.id = ?`,
            [id]
        );

        if (citas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.json({
            success: true,
            data: citas[0]
        });

    } catch (error) {
        console.error('Error en getById citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cita',
            error: error.message
        });
    }
};

/**
 * Crear una nueva cita
 */
exports.create = async (req, res) => {
    try {
        console.log('📝 [CREATE CITA] Body recibido:', JSON.stringify(req.body, null, 2));
        
        const {
            vehiculo_id,
            tipo_cita_id,
            fecha_hora_inicio,
            motivo,
            observaciones
        } = req.body;

        const userId = req.user.id;
        console.log('👤 [CREATE CITA] Usuario ID:', userId);

        // Validaciones
        if (!vehiculo_id || !tipo_cita_id || !fecha_hora_inicio) {
            console.log('❌ [CREATE CITA] Validación fallida - faltan campos');
            return res.status(400).json({
                success: false,
                message: 'El vehículo, tipo de cita y fecha de inicio son obligatorios'
            });
        }

        // Verificar que el vehículo existe
        const vehiculo = await query(
            'SELECT * FROM Vehiculos WHERE id = ?',
            [vehiculo_id]
        );

        if (vehiculo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Verificar que el tipo de cita existe y está activo
        const tipoCita = await query(
            'SELECT * FROM TiposCita WHERE id = ? AND activo = 1',
            [tipo_cita_id]
        );

        if (tipoCita.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cita no encontrado o inactivo'
            });
        }

        // Calcular fecha de fin
        const fechaInicio = new Date(fecha_hora_inicio);
        const fechaFin = new Date(fechaInicio.getTime() + tipoCita[0].duracion_minutos * 60000);
        
        // Formatear fechas para MySQL (YYYY-MM-DD HH:mm:ss)
        const formatMySQLDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };
        
        const fechaInicioFormatted = formatMySQLDate(fechaInicio);
        const fechaFinFormatted = formatMySQLDate(fechaFin);
        
        console.log('📅 [CREATE CITA] Fechas formateadas:', {
            inicio: fechaInicioFormatted,
            fin: fechaFinFormatted
        });

        // Verificar disponibilidad (no hay overlapping)
        const conflictos = await query(
            `SELECT COUNT(*) as count
            FROM Citas
            WHERE estado NOT IN ('cancelada', 'completada')
            AND (
                (fecha_hora_inicio <= ? AND fecha_hora_fin > ?)
                OR (fecha_hora_inicio < ? AND fecha_hora_fin >= ?)
                OR (fecha_hora_inicio >= ? AND fecha_hora_fin <= ?)
            )`,
            [
                fechaInicioFormatted, fechaInicioFormatted,
                fechaFinFormatted, fechaFinFormatted,
                fechaInicioFormatted, fechaFinFormatted
            ]
        );

        if (conflictos[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'El horario seleccionado ya está ocupado'
            });
        }

        // Insertar cita
        const result = await query(
            `INSERT INTO Citas (
                vehiculo_id, tipo_cita_id, fecha_hora_inicio, fecha_hora_fin,
                motivo, observaciones, usuario_solicitante_id, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehiculo_id,
                tipo_cita_id,
                fechaInicioFormatted,
                fechaFinFormatted,
                motivo || null,
                observaciones || null,
                userId,
                userId
            ]
        );

        // Obtener la cita creada
        const cita = await query(
            `SELECT 
                c.*,
                v.matricula,
                v.marca,
                v.modelo,
                tc.nombre as tipo_cita_nombre,
                tc.color as tipo_cita_color
            FROM Citas c
            INNER JOIN Vehiculos v ON c.vehiculo_id = v.id
            INNER JOIN TiposCita tc ON c.tipo_cita_id = tc.id
            WHERE c.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            data: cita[0]
        });

    } catch (error) {
        console.error('Error en create citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear cita',
            error: error.message
        });
    }
};

/**
 * Actualizar una cita
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fecha_hora_inicio,
            motivo,
            notas,
            diagnostico,
            trabajos_realizados
        } = req.body;

        const userId = req.user.id;

        // Verificar que la cita existe
        const citaExiste = await query(
            'SELECT * FROM Citas WHERE id = ?',
            [id]
        );

        if (citaExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        // Si se cambia la fecha, recalcular fin y verificar disponibilidad
        let fechaFin = null;
        if (fecha_hora_inicio) {
            const tipoCita = await query(
                'SELECT duracion_minutos FROM TiposCita WHERE id = ?',
                [citaExiste[0].tipo_cita_id]
            );

            const fechaInicio = new Date(fecha_hora_inicio);
            fechaFin = new Date(fechaInicio.getTime() + tipoCita[0].duracion_minutos * 60000);

            // Verificar disponibilidad
            const conflictos = await query(
                `SELECT COUNT(*) as count
                FROM Citas
                WHERE id != ? AND estado NOT IN ('cancelada', 'completada')
                AND (
                    (fecha_hora_inicio <= ? AND fecha_hora_fin > ?)
                    OR (fecha_hora_inicio < ? AND fecha_hora_fin >= ?)
                    OR (fecha_hora_inicio >= ? AND fecha_hora_fin <= ?)
                )`,
                [
                    id,
                    fecha_hora_inicio, fecha_hora_inicio,
                    fechaFin.toISOString(), fechaFin.toISOString(),
                    fecha_hora_inicio, fechaFin.toISOString()
                ]
            );

            if (conflictos[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nuevo horario ya está ocupado'
                });
            }
        }

        // Actualizar cita
        await query(
            `UPDATE Citas SET
                fecha_hora_inicio = COALESCE(?, fecha_hora_inicio),
                fecha_hora_fin = COALESCE(?, fecha_hora_fin),
                motivo = COALESCE(?, motivo),
                notas = COALESCE(?, notas),
                diagnostico = COALESCE(?, diagnostico),
                trabajos_realizados = COALESCE(?, trabajos_realizados),
                actualizado_por = ?
            WHERE id = ?`,
            [
                fecha_hora_inicio,
                fechaFin ? fechaFin.toISOString() : null,
                motivo,
                notas,
                diagnostico,
                trabajos_realizados,
                userId,
                id
            ]
        );

        // Obtener la cita actualizada
        const cita = await query(
            `SELECT 
                c.*,
                v.matricula,
                v.marca,
                v.modelo,
                tc.nombre as tipo_cita_nombre,
                tc.color as tipo_cita_color
            FROM Citas c
            INNER JOIN Vehiculos v ON c.vehiculo_id = v.id
            INNER JOIN TiposCita tc ON c.tipo_cita_id = tc.id
            WHERE c.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Cita actualizada exitosamente',
            data: cita[0]
        });

    } catch (error) {
        console.error('Error en update citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar cita',
            error: error.message
        });
    }
};

/**
 * Cancelar una cita
 */
exports.cancelar = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo_cancelacion } = req.body;
        const userId = req.user.id;

        const cita = await query(
            'SELECT * FROM Citas WHERE id = ?',
            [id]
        );

        if (cita.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        if (cita[0].estado === 'completada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar una cita completada'
            });
        }

        await query(
            `UPDATE Citas SET
                estado = 'cancelada',
                fecha_cancelada = NOW(),
                motivo_cancelacion = ?,
                actualizado_por = ?
            WHERE id = ?`,
            [motivo_cancelacion || 'Sin motivo especificado', userId, id]
        );

        res.json({
            success: true,
            message: 'Cita cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error en cancelar cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar cita',
            error: error.message
        });
    }
};

/**
 * Confirmar una cita
 */
exports.confirmar = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const cita = await query(
            'SELECT * FROM Citas WHERE id = ?',
            [id]
        );

        if (cita.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        if (cita[0].estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden confirmar citas pendientes'
            });
        }

        await query(
            `UPDATE Citas SET
                estado = 'confirmada',
                actualizado_por = ?
            WHERE id = ?`,
            [userId, id]
        );

        res.json({
            success: true,
            message: 'Cita confirmada exitosamente'
        });

    } catch (error) {
        console.error('Error en confirmar cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al confirmar cita',
            error: error.message
        });
    }
};

/**
 * Completar una cita
 */
exports.completar = async (req, res) => {
    try {
        const { id } = req.params;
        const { diagnostico, trabajos_realizados } = req.body;
        const userId = req.user.id;

        const cita = await query(
            'SELECT * FROM Citas WHERE id = ?',
            [id]
        );

        if (cita.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        if (cita[0].estado === 'cancelada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede completar una cita cancelada'
            });
        }

        // Construir el resultado combinando diagnóstico y trabajos
        let resultadoTexto = '';
        if (diagnostico) {
            resultadoTexto += `DIAGNÓSTICO:\n${diagnostico}\n\n`;
        }
        if (trabajos_realizados) {
            resultadoTexto += `TRABAJOS REALIZADOS:\n${trabajos_realizados}`;
        }

        await query(
            `UPDATE Citas SET
                estado = 'completada',
                fecha_completada = NOW(),
                resultado = ?,
                actualizado_por = ?
            WHERE id = ?`,
            [resultadoTexto || null, userId, id]
        );

        res.json({
            success: true,
            message: 'Cita completada exitosamente'
        });

    } catch (error) {
        console.error('Error en completar cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al completar cita',
            error: error.message
        });
    }
};

/**
 * Obtener disponibilidad de horarios (slots libres)
 */
exports.getDisponibilidad = async (req, res) => {
    try {
        const { fecha, tipo_cita_id } = req.query;

        if (!fecha || !tipo_cita_id) {
            return res.status(400).json({
                success: false,
                message: 'La fecha y tipo de cita son obligatorios'
            });
        }

        // Obtener duración del tipo de cita
        const tipoCita = await query(
            'SELECT duracion_minutos FROM TiposCita WHERE id = ? AND activo = 1',
            [tipo_cita_id]
        );

        if (tipoCita.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cita no encontrado o inactivo'
            });
        }

        const duracion = tipoCita[0].duracion_minutos;

        // Horario del taller: 8:00 AM - 6:00 PM (configurable)
        const horaInicio = 8; // 8 AM
        const horaFin = 18; // 6 PM

        // Obtener citas ocupadas en esa fecha
        const citasOcupadas = await query(
            `SELECT fecha_hora_inicio, fecha_hora_fin
            FROM Citas
            WHERE DATE(fecha_hora_inicio) = ?
            AND estado NOT IN ('cancelada', 'completada')
            ORDER BY fecha_hora_inicio ASC`,
            [fecha]
        );
        
        // DEBUG: Log de citas ocupadas
        console.log('🔍 [DISPONIBILIDAD] Fecha consultada:', fecha);
        console.log('🔍 [DISPONIBILIDAD] Citas ocupadas:', citasOcupadas.map(c => ({
            inicio: c.fecha_hora_inicio,
            fin: c.fecha_hora_fin
        })));

        // Generar slots disponibles
        const slots = [];
        const fechaBase = new Date(fecha + 'T00:00:00');

        for (let hora = horaInicio; hora < horaFin; hora++) {
            for (let minuto = 0; minuto < 60; minuto += 30) { // Slots cada 30 minutos
                const slotInicio = new Date(fechaBase);
                slotInicio.setHours(hora, minuto, 0, 0);

                const slotFin = new Date(slotInicio.getTime() + duracion * 60000);

                // Verificar si el slot termina dentro del horario
                if (slotFin.getHours() > horaFin || 
                    (slotFin.getHours() === horaFin && slotFin.getMinutes() > 0)) {
                    continue;
                }

                // Verificar si hay conflicto con citas existentes
                // Dos intervalos [A, B) y [C, D) se solapan si: A < D && C < B
                let ocupado = false;
                for (const cita of citasOcupadas) {
                    const citaInicio = new Date(cita.fecha_hora_inicio);
                    const citaFin = new Date(cita.fecha_hora_fin);

                    // Hay conflicto si los intervalos se solapan
                    if (slotInicio < citaFin && citaInicio < slotFin) {
                        ocupado = true;
                        // DEBUG: Log cuando se marca un slot como ocupado
                        console.log(`❌ [OCUPADO] Slot ${slotInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}-${slotFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} bloqueado por cita ${citaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}-${citaFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
                        break;
                    }
                }

                slots.push({
                    inicio: slotInicio.toISOString(),
                    fin: slotFin.toISOString(),
                    disponible: !ocupado,
                    hora: slotInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                });
            }
        }

        res.json({
            success: true,
            data: {
                fecha,
                duracion_minutos: duracion,
                slots_totales: slots.length,
                slots_disponibles: slots.filter(s => s.disponible).length,
                slots
            }
        });

    } catch (error) {
        console.error('Error en getDisponibilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener disponibilidad',
            error: error.message
        });
    }
};

/**
 * Obtener citas por vehículo
 */
exports.getByVehiculo = async (req, res) => {
    try {
        const { vehiculo_id } = req.params;
        const { estado } = req.query;

        let whereClause = 'WHERE c.vehiculo_id = ?';
        let params = [vehiculo_id];

        if (estado) {
            whereClause += ' AND c.estado = ?';
            params.push(estado);
        }

        const citas = await query(
            `SELECT 
                c.*,
                tc.nombre as tipo_cita_nombre,
                tc.color as tipo_cita_color,
                us.nombre_completo as solicitante_nombre
            FROM Citas c
            INNER JOIN TiposCita tc ON c.tipo_cita_id = tc.id
            LEFT JOIN Usuarios us ON c.usuario_solicitante_id = us.id
            ${whereClause}
            ORDER BY c.fecha_hora_inicio DESC`,
            params
        );

        res.json({
            success: true,
            data: citas
        });

    } catch (error) {
        console.error('Error en getByVehiculo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener citas del vehículo',
            error: error.message
        });
    }
};

/**
 * Obtener citas del usuario actual
 */
exports.getMisCitas = async (req, res) => {
    try {
        const userId = req.user.id;
        const { estado } = req.query;

        let whereClause = 'WHERE c.usuario_solicitante_id = ?';
        let params = [userId];

        if (estado) {
            whereClause += ' AND c.estado = ?';
            params.push(estado);
        }

        const citas = await query(
            `SELECT 
                c.*,
                v.matricula,
                v.marca,
                v.modelo,
                tc.nombre as tipo_cita_nombre,
                tc.color as tipo_cita_color,
                u.nombre as unidad_nombre
            FROM Citas c
            INNER JOIN Vehiculos v ON c.vehiculo_id = v.id
            INNER JOIN TiposCita tc ON c.tipo_cita_id = tc.id
            INNER JOIN Unidades u ON v.unidad_id = u.id
            ${whereClause}
            ORDER BY c.fecha_hora_inicio DESC`,
            params
        );

        res.json({
            success: true,
            data: citas
        });

    } catch (error) {
        console.error('Error en getMisCitas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mis citas',
            error: error.message
        });
    }
};
