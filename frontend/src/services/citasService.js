import api from './api';

// ============================================================================
// SERVICIO DE CITAS
// ============================================================================

/**
 * Obtener todas las citas con filtros
 */
export const obtenerCitas = async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.vehiculo_id) params.append('vehiculo_id', filtros.vehiculo_id);
    if (filtros.tipo_cita_id) params.append('tipo_cita_id', filtros.tipo_cita_id);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.unidad_id) params.append('unidad_id', filtros.unidad_id);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const response = await api.get(`/api/citas?${params.toString()}`);
    return response.data;
};

/**
 * Obtener una cita por ID
 */
export const obtenerCitaPorId = async (id) => {
    const response = await api.get(`/api/citas/${id}`);
    return response.data;
};

/**
 * Obtener citas por vehículo
 */
export const obtenerCitasPorVehiculo = async (vehiculoId, estado = null) => {
    const params = estado ? `?estado=${estado}` : '';
    const response = await api.get(`/api/citas/vehiculo/${vehiculoId}${params}`);
    return response.data;
};

/**
 * Obtener mis citas (del usuario actual)
 */
export const obtenerMisCitas = async (estado = null) => {
    const params = estado ? `?estado=${estado}` : '';
    const response = await api.get(`/api/citas/mis-citas${params}`);
    return response.data;
};

/**
 * Obtener disponibilidad de horarios
 */
export const obtenerDisponibilidad = async (fecha, tipoCitaId) => {
    const response = await api.get(`/api/citas/disponibilidad?fecha=${fecha}&tipo_cita_id=${tipoCitaId}`);
    return response.data;
};

/**
 * Crear una nueva cita
 */
export const crearCita = async (datosCita) => {
    const response = await api.post('/api/citas', datosCita);
    return response.data;
};

/**
 * Actualizar una cita
 */
export const actualizarCita = async (id, datosCita) => {
    const response = await api.put(`/api/citas/${id}`, datosCita);
    return response.data;
};

/**
 * Confirmar una cita
 */
export const confirmarCita = async (id) => {
    const response = await api.patch(`/api/citas/${id}/confirmar`);
    return response.data;
};

/**
 * Completar una cita
 */
export const completarCita = async (id, datos) => {
    const response = await api.patch(`/api/citas/${id}/completar`, datos);
    return response.data;
};

/**
 * Cancelar una cita
 */
export const cancelarCita = async (id, motivoCancelacion = '') => {
    const response = await api.patch(`/api/citas/${id}/cancelar`, { motivo_cancelacion: motivoCancelacion });
    return response.data;
};
