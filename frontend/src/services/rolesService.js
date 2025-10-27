// ============================================================================
// SERVICIO DE ROLES - Gestión de roles y permisos
// ============================================================================

import api from './api';

const rolesService = {
    /**
     * Listar roles
     * @returns {Promise<Array>} Lista de roles
     */
    async listar() {
        const response = await api.get('/api/roles');
        return response.data.data;
    },

    /**
     * Obtener un rol por ID
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Datos del rol
     */
    async obtenerPorId(id) {
        const response = await api.get(`/api/roles/${id}`);
        return response.data.data;
    },

    /**
     * Crear un nuevo rol
     * @param {Object} rol - Datos del rol
     * @returns {Promise<Object>} Rol creado
     */
    async crear(rol) {
        const response = await api.post('/api/roles', rol);
        return response.data.data;
    },

    /**
     * Actualizar un rol
     * @param {number} id - ID del rol
     * @param {Object} rol - Datos actualizados
     * @returns {Promise<Object>} Rol actualizado
     */
    async actualizar(id, rol) {
        const response = await api.put(`/api/roles/${id}`, rol);
        return response.data.data;
    },

    /**
     * Eliminar un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Resultado de la operación
     */
    async eliminar(id) {
        const response = await api.delete(`/api/roles/${id}`);
        return response.data;
    },

    /**
     * Obtener permisos de un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Array>} Lista de permisos del rol
     */
    async obtenerPermisos(id) {
        const response = await api.get(`/api/roles/${id}/permisos`);
        return response.data.data;
    },

    /**
     * Asignar permisos a un rol
     * @param {number} id - ID del rol
     * @param {Array<number>} permisosIds - IDs de los permisos
     * @returns {Promise<Object>} Resultado de la operación
     */
    async asignarPermisos(id, permisosIds) {
        const response = await api.post(`/api/roles/${id}/permisos`, {
            permisos_ids: permisosIds
        });
        return response.data;
    }
};

// Servicio de permisos
const permisosService = {
    /**
     * Listar todos los permisos
     * @returns {Promise<Array>} Lista de permisos
     */
    async listar() {
        const response = await api.get('/api/permisos');
        return response.data.data;
    },

    /**
     * Obtener permisos agrupados por recurso
     * @returns {Promise<Object>} Permisos agrupados
     */
    async porRecurso() {
        const response = await api.get('/api/permisos/por-recurso');
        return response.data.data;
    },

    /**
     * Obtener un permiso por ID
     * @param {number} id - ID del permiso
     * @returns {Promise<Object>} Datos del permiso
     */
    async obtenerPorId(id) {
        const response = await api.get(`/api/permisos/${id}`);
        return response.data.data;
    }
};

export { rolesService, permisosService };
export default rolesService;
