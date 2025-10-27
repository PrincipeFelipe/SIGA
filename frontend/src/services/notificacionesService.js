// ============================================================================
// SERVICIO DE NOTIFICACIONES - Gestión de notificaciones de usuarios
// ============================================================================

import api from './api';

const notificacionesService = {
    /**
     * Listar notificaciones del usuario autenticado
     * @param {Object} params - Parámetros de búsqueda
     * @param {number} params.pagina - Número de página (opcional)
     * @param {number} params.limite - Registros por página (opcional)
     * @returns {Promise<Object>} Lista de notificaciones con paginación
     */
    async listar(params = {}) {
        try {
            const response = await api.get('/api/notificaciones', { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('Error al listar notificaciones:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al listar notificaciones'
            };
        }
    },

    /**
     * Obtener contador de notificaciones no leídas
     * @returns {Promise<Object>} Contador de notificaciones
     */
    async contarNoLeidas() {
        try {
            const response = await api.get('/api/notificaciones/no-leidas');
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al contar notificaciones no leídas:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al contar notificaciones no leídas'
            };
        }
    },

    /**
     * Marcar una notificación como leída
     * @param {number} id - ID de la notificación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async marcarComoLeida(id) {
        try {
            const response = await api.post(`/api/notificaciones/${id}/leer`);
            return {
                success: true,
                message: response.data.message || 'Notificación marcada como leída'
            };
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al marcar notificación como leída'
            };
        }
    },

    /**
     * Marcar todas las notificaciones como leídas
     * @returns {Promise<Object>} Resultado de la operación
     */
    async marcarTodasComoLeidas() {
        try {
            const response = await api.post('/api/notificaciones/leer-todas');
            return {
                success: true,
                message: response.data.message || 'Todas las notificaciones marcadas como leídas'
            };
        } catch (error) {
            console.error('Error al marcar todas las notificaciones como leídas:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al marcar todas las notificaciones como leídas'
            };
        }
    },

    /**
     * Eliminar una notificación
     * @param {number} id - ID de la notificación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async eliminar(id) {
        try {
            const response = await api.delete(`/api/notificaciones/${id}`);
            return {
                success: true,
                message: response.data.message || 'Notificación eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar notificación'
            };
        }
    }
};

export default notificacionesService;
