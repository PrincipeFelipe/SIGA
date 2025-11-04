// ============================================================================
// SERVICIO DE LOGS - Auditoría y logs del sistema
// ============================================================================

import api from './api';

const logsService = {
    /**
     * Listar logs de auditoría con filtros avanzados
     * @param {Object} filters - Parámetros de búsqueda
     * @returns {Promise<Object>} Lista de logs con paginación
     */
    getAll: async (filters = {}) => {
        const response = await api.get('/api/logs', { params: filters });
        return response.data;
    },

    /**
     * Obtener un log por ID
     * @param {number} id - ID del log
     * @returns {Promise<Object>} Datos del log
     */
    getById: async (id) => {
        const response = await api.get(`/api/logs/${id}`);
        return response.data;
    },

    /**
     * Obtener logs de un recurso específico
     * @param {string} recurso_tipo - Tipo del recurso (Usuario, Rol, etc.)
     * @param {number} recurso_id - ID del recurso
     * @returns {Promise<Object>} Lista de logs del recurso
     */
    getByRecurso: async (recurso_tipo, recurso_id) => {
        const response = await api.get(`/api/logs/recurso/${recurso_tipo}/${recurso_id}`);
        return response.data;
    },

    /**
     * Obtener estadísticas de uso del sistema
     * @returns {Promise<Object>} Estadísticas de uso
     */
    getEstadisticas: async () => {
        const response = await api.get('/api/logs/estadisticas');
        return response.data;
    }
};

export default logsService;
