import api from './api';

// ============================================================================
// SERVICIO DE VEHÍCULOS
// ============================================================================

/**
 * Obtener todos los vehículos con filtros
 */
export const obtenerVehiculos = async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.unidad_id) params.append('unidad_id', filtros.unidad_id);
    if (filtros.tipo_vehiculo) params.append('tipo_vehiculo', filtros.tipo_vehiculo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const response = await api.get(`/api/vehiculos?${params.toString()}`);
    return response.data;
};

/**
 * Obtener un vehículo por ID
 */
export const obtenerVehiculoPorId = async (id) => {
    const response = await api.get(`/api/vehiculos/${id}`);
    return response.data;
};

/**
 * Obtener vehículos por unidad
 */
export const obtenerVehiculosPorUnidad = async (unidadId, estado = null) => {
    const params = estado ? `?estado=${estado}` : '';
    const response = await api.get(`/api/vehiculos/unidad/${unidadId}${params}`);
    return response.data;
};

/**
 * Crear un nuevo vehículo
 */
export const crearVehiculo = async (datosVehiculo) => {
    const response = await api.post('/api/vehiculos', datosVehiculo);
    return response.data;
};

/**
 * Actualizar un vehículo
 */
export const actualizarVehiculo = async (id, datosVehiculo) => {
    const response = await api.put(`/api/vehiculos/${id}`, datosVehiculo);
    return response.data;
};

/**
 * Eliminar un vehículo
 */
export const eliminarVehiculo = async (id) => {
    const response = await api.delete(`/api/vehiculos/${id}`);
    return response.data;
};

export default {
    obtenerVehiculos,
    obtenerVehiculoPorId,
    obtenerVehiculosPorUnidad,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
};
