import api from './api';

const mantenimientosService = {
  // Obtener todos los mantenimientos con filtros
  obtenerMantenimientos: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.vehiculo_id) params.append('vehiculo_id', filtros.vehiculo_id);
    if (filtros.tipo_id) params.append('tipo_id', filtros.tipo_id);
    if (filtros.unidad_id) params.append('unidad_id', filtros.unidad_id);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const response = await api.get(`/api/mantenimientos?${params.toString()}`);
    return response.data;
  },

  // Obtener mantenimientos pendientes (próximos a vencer o vencidos)
  obtenerMantenimientosPendientes: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.vehiculo_id) params.append('vehiculo_id', filtros.vehiculo_id);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.unidad_id) params.append('unidad_id', filtros.unidad_id);
    
    const response = await api.get(`/api/mantenimientos/pendientes?${params.toString()}`);
    return response.data;
  },

  // Obtener mantenimientos de un vehículo específico
  obtenerMantenimientosPorVehiculo: async (vehiculoId) => {
    const response = await api.get(`/api/mantenimientos/vehiculo/${vehiculoId}`);
    return response.data;
  },

  // Obtener un mantenimiento por ID
  obtenerMantenimiento: async (id) => {
    const response = await api.get(`/api/mantenimientos/${id}`);
    return response.data;
  },

  // Crear un nuevo mantenimiento
  crearMantenimiento: async (datos) => {
    const response = await api.post('/api/mantenimientos', datos);
    return response.data;
  },

  // Actualizar un mantenimiento existente
  actualizarMantenimiento: async (id, datos) => {
    const response = await api.put(`/api/mantenimientos/${id}`, datos);
    return response.data;
  },

  // Eliminar un mantenimiento
  eliminarMantenimiento: async (id) => {
    const response = await api.delete(`/api/mantenimientos/${id}`);
    return response.data;
  },

  // Obtener estadísticas de mantenimientos
  obtenerEstadisticas: async () => {
    const response = await api.get('/api/mantenimientos/estadisticas');
    return response.data;
  }
};

export default mantenimientosService;
