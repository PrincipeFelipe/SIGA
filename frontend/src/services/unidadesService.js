// ============================================================================
// SERVICIO DE UNIDADES - Gestión de unidades organizacionales
// ============================================================================

import api from './api';

const unidadesService = {
    /**
     * Obtener árbol jerárquico completo de unidades
     * @returns {Promise<Array>} Árbol de unidades
     */
    async getTree() {
        const response = await api.get('/api/unidades');
        return response.data.data;
    },

    /**
     * Obtener lista plana de unidades (para selectores)
     * @returns {Promise<Array>} Lista de unidades
     */
    async getFlat() {
        const response = await api.get('/api/unidades/lista');
        return response.data.data;
    },

    /**
     * Obtener una unidad por ID
     * @param {number} id - ID de la unidad
     * @returns {Promise<Object>} Datos de la unidad
     */
    async getById(id) {
        const response = await api.get(`/api/unidades/${id}`);
        return response.data.data;
    },

    /**
     * Obtener descendientes de una unidad (usando CTE recursivo)
     * @param {number} id - ID de la unidad
     * @returns {Promise<Array>} Lista de descendientes
     */
    async getDescendants(id) {
        const response = await api.get(`/api/unidades/${id}/descendientes`);
        return response.data.data;
    },

    /**
     * Crear una nueva unidad
     * @param {Object} data - Datos de la unidad
     * @returns {Promise<Object>} Unidad creada
     */
    async create(data) {
        const response = await api.post('/api/unidades', data);
        return response.data.data;
    },

    /**
     * Actualizar una unidad
     * @param {number} id - ID de la unidad
     * @param {Object} data - Datos actualizados
     * @returns {Promise<Object>} Unidad actualizada
     */
    async update(id, data) {
        const response = await api.put(`/api/unidades/${id}`, data);
        return response.data.data;
    },

    /**
     * Eliminar una unidad
     * @param {number} id - ID de la unidad
     * @returns {Promise<Object>} Resultado de la operación
     */
    async delete(id) {
        const response = await api.delete(`/api/unidades/${id}`);
        return response.data;
    }
};

export default unidadesService;
