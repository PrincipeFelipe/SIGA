// ============================================================================
// SERVICIO DE TAREAS - Gestión de tareas del equipo
// ============================================================================

import api from './api';

const tareasService = {
    /**
     * Listar tareas con filtros
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Object>} Lista de tareas con paginación
     */
    async listar(params = {}) {
        const response = await api.get('/api/tareas', { params });
        return response.data;
    },

    /**
     * Obtener una tarea por ID
     * @param {number} id - ID de la tarea
     * @returns {Promise<Object>} Datos de la tarea con comentarios e historial
     */
    async obtenerPorId(id) {
        const response = await api.get(`/api/tareas/${id}`);
        return response.data.data;
    },

    /**
     * Crear una nueva tarea
     * @param {Object} tarea - Datos de la tarea
     * @returns {Promise<Object>} Tarea creada
     */
    async crear(tarea) {
        const response = await api.post('/api/tareas', tarea);
        return response.data;
    },

    /**
     * Actualizar una tarea
     * @param {number} id - ID de la tarea
     * @param {Object} tarea - Datos actualizados
     * @returns {Promise<Object>} Tarea actualizada
     */
    async actualizar(id, tarea) {
        const response = await api.put(`/api/tareas/${id}`, tarea);
        return response.data;
    },

    /**
     * Eliminar una tarea
     * @param {number} id - ID de la tarea
     * @returns {Promise<Object>} Resultado de la operación
     */
    async eliminar(id) {
        const response = await api.delete(`/api/tareas/${id}`);
        return response.data;
    },

    /**
     * Agregar comentario a una tarea
     * @param {number} id - ID de la tarea
     * @param {string} comentario - Texto del comentario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async agregarComentario(id, comentario) {
        const response = await api.post(`/api/tareas/${id}/comentarios`, { comentario });
        return response.data;
    },

    /**
     * Obtener estadísticas de tareas
     * @param {boolean} global - Si es true, obtiene estadísticas globales
     * @returns {Promise<Object>} Estadísticas de tareas
     */
    async obtenerEstadisticas(global = false) {
        const response = await api.get('/api/tareas/estadisticas', {
            params: { global }
        });
        return response.data.data;
    }
};

export default tareasService;
