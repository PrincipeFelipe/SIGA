import api from './api';

const tiposMantenimientoService = {
  // Obtener todos los tipos de mantenimiento
  obtenerTiposMantenimiento: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    
    const response = await api.get(`/api/tipos-mantenimiento?${params.toString()}`);
    return response.data;
  },

  // Obtener solo tipos activos (para dropdowns)
  obtenerTiposActivos: async () => {
    const response = await api.get('/api/tipos-mantenimiento/activos');
    return response.data;
  },

  // Obtener un tipo de mantenimiento por ID
  obtenerTipoMantenimiento: async (id) => {
    const response = await api.get(`/api/tipos-mantenimiento/${id}`);
    return response.data;
  },

  // Crear un nuevo tipo de mantenimiento
  crearTipoMantenimiento: async (datos) => {
    const response = await api.post('/api/tipos-mantenimiento', datos);
    return response.data;
  },

  // Actualizar un tipo de mantenimiento existente
  actualizarTipoMantenimiento: async (id, datos) => {
    const response = await api.put(`/api/tipos-mantenimiento/${id}`, datos);
    return response.data;
  },

  // Eliminar un tipo de mantenimiento
  eliminarTipoMantenimiento: async (id) => {
    const response = await api.delete(`/api/tipos-mantenimiento/${id}`);
    return response.data;
  }
};

export default tiposMantenimientoService;
