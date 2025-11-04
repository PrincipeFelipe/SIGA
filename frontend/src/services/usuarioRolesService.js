// ============================================================================
// SERVICIO DE USUARIO-ROLES-ALCANCE - Gestión de roles y permisos
// ============================================================================

import api from './api';

const usuarioRolesService = {
    /**
     * Listar roles y alcances de un usuario
     * @param {number} usuarioId - ID del usuario
     * @returns {Promise<Object>} Roles y alcances del usuario
     */
    async listar(usuarioId) {
        const response = await api.get(`/api/usuarios/${usuarioId}/roles-alcance`);
        return response.data.data;
    },

    /**
     * Asignar un rol con alcance a un usuario
     * @param {number} usuarioId - ID del usuario
     * @param {Object} data - { rol_id, unidad_alcance_id }
     * @returns {Promise<Object>} Asignación creada
     */
    async asignar(usuarioId, data) {
        const response = await api.post(`/api/usuarios/${usuarioId}/roles-alcance`, data);
        return response.data.data;
    },

    /**
     * Revocar una asignación de rol
     * @param {number} usuarioId - ID del usuario
     * @param {number} asignacionId - ID de la asignación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async revocar(usuarioId, asignacionId) {
        const response = await api.delete(`/api/usuarios/${usuarioId}/roles-alcance/${asignacionId}`);
        return response.data;
    },

    /**
     * Actualizar todas las asignaciones de un usuario (reemplaza)
     * @param {number} usuarioId - ID del usuario
     * @param {Array} asignaciones - Array de { rol_id, unidad_alcance_id }
     * @returns {Promise<Object>} Resultado de la operación
     */
    async actualizarTodas(usuarioId, asignaciones) {
        const response = await api.put(`/api/usuarios/${usuarioId}/roles-alcance`, { asignaciones });
        return response.data;
    }
};

export default usuarioRolesService;
