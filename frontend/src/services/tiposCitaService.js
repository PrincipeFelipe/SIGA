import api from './api';

// ============================================================================
// SERVICIO DE TIPOS DE CITA
// ============================================================================

/**
 * Obtener todos los tipos de cita
 */
export const obtenerTiposCita = async (activo = null) => {
    const params = activo !== null ? `?activo=${activo}` : '';
    const response = await api.get(`/api/tipos-cita${params}`);
    return response.data;
};

/**
 * Obtener tipos de cita activos (para selección)
 */
export const obtenerTiposCitaActivos = async () => {
    const response = await api.get('/api/tipos-cita/activos');
    return response.data;
};

/**
 * Obtener un tipo de cita por ID
 */
export const obtenerTipoCitaPorId = async (id) => {
    const response = await api.get(`/api/tipos-cita/${id}`);
    return response.data;
};

/**
 * Crear un nuevo tipo de cita
 */
export const crearTipoCita = async (datosTipoCita) => {
    const response = await api.post('/api/tipos-cita', datosTipoCita);
    return response.data;
};

/**
 * Actualizar un tipo de cita
 */
export const actualizarTipoCita = async (id, datosTipoCita) => {
    const response = await api.put(`/api/tipos-cita/${id}`, datosTipoCita);
    return response.data;
};

/**
 * Eliminar un tipo de cita
 */
export const eliminarTipoCita = async (id) => {
    const response = await api.delete(`/api/tipos-cita/${id}`);
    return response.data;
};

export default {
    obtenerTiposCita,
    obtenerTiposCitaActivos,
    obtenerTipoCitaPorId,
    crearTipoCita,
    actualizarTipoCita,
    eliminarTipoCita
};
