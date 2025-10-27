// ============================================================================
// SERVICIO DE LOGS - Auditoría y logs del sistema
// ============================================================================

import api from './api';

const logsService = {
    /**
     * Listar logs de auditoría con filtros avanzados
     * @param {Object} params - Parámetros de búsqueda
     * @param {string} params.fecha_inicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} params.fecha_fin - Fecha de fin (YYYY-MM-DD)
     * @param {number} params.usuario_id - ID del usuario (opcional)
     * @param {string} params.accion - Acción realizada (opcional)
     * @param {string} params.recurso - Recurso afectado (opcional)
     * @param {number} params.pagina - Número de página (opcional)
     * @param {number} params.limite - Registros por página (opcional)
     * @returns {Promise<Object>} Lista de logs con paginación
     */
    async listar(params = {}) {
        try {
            const response = await api.get('/api/logs', { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('Error al listar logs:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al listar logs'
            };
        }
    },

    /**
     * Obtener un log por ID
     * @param {number} id - ID del log
     * @returns {Promise<Object>} Datos del log
     */
    async obtenerPorId(id) {
        try {
            const response = await api.get(`/api/logs/${id}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al obtener log:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener log'
            };
        }
    },

    /**
     * Obtener logs de un recurso específico
     * @param {string} recurso - Nombre del recurso
     * @param {number} recursoId - ID del recurso
     * @param {Object} params - Parámetros adicionales
     * @returns {Promise<Object>} Lista de logs del recurso
     */
    async obtenerPorRecurso(recurso, recursoId, params = {}) {
        try {
            const response = await api.get(`/api/logs/${recurso}/${recursoId}`, { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('Error al obtener logs del recurso:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener logs del recurso'
            };
        }
    },

    /**
     * Obtener estadísticas de uso del sistema
     * @param {Object} params - Parámetros
     * @param {string} params.fecha_inicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} params.fecha_fin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise<Object>} Estadísticas de uso
     */
    async obtenerEstadisticas(params = {}) {
        try {
            const response = await api.get('/api/logs/estadisticas', { params });
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener estadísticas'
            };
        }
    },

    /**
     * Exportar logs a CSV
     * @param {Object} params - Parámetros de filtro
     * @returns {Promise<Blob>} Archivo CSV
     */
    async exportarCSV(params = {}) {
        try {
            const response = await api.get('/api/logs/export/csv', {
                params,
                responseType: 'blob'
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al exportar logs:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al exportar logs'
            };
        }
    }
};

export default logsService;
