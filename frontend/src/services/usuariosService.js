// ============================================================================
// SERVICIO DE USUARIOS - Gestión de usuarios
// ============================================================================

import api from './api';

const usuariosService = {
    /**
     * Listar usuarios con filtrado jer\u00e1rquico
     * @param {Object} params - Par\u00e1metros de b\u00fasqueda
     * @param {number} params.unidad_id - ID de la unidad (opcional)
     * @param {boolean} params.incluir_descendientes - Incluir usuarios de unidades descendientes
     * @param {string} params.buscar - T\u00e9rmino de b\u00fasqueda (opcional)
     * @param {number} params.pagina - N\u00famero de p\u00e1gina (opcional)
     * @param {number} params.limite - Registros por p\u00e1gina (opcional)
     * @returns {Promise<Object>} Lista de usuarios con paginaci\u00f3n
     */
    async listar(params = {}) {
        try {
            const response = await api.get('/api/usuarios', { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al listar usuarios'
            };
        }
    },

    /**
     * Obtener un usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Datos del usuario
     */
    async obtenerPorId(id) {
        try {
            const response = await api.get(`/api/usuarios/${id}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener usuario'
            };
        }
    },

    /**
     * Crear un nuevo usuario
     * @param {Object} usuario - Datos del usuario
     * @returns {Promise<Object>} Usuario creado
     */
    async crear(usuario) {
        try {
            const response = await api.post('/api/usuarios', usuario);
            return {
                success: true,
                data: response.data.data,
                message: 'Usuario creado exitosamente'
            };
        } catch (error) {
            console.error('Error al crear usuario:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear usuario'
            };
        }
    },

    /**
     * Actualizar un usuario
     * @param {number} id - ID del usuario
     * @param {Object} usuario - Datos actualizados
     * @returns {Promise<Object>} Usuario actualizado
     */
    async actualizar(id, usuario) {
        try {
            const response = await api.put(`/api/usuarios/${id}`, usuario);
            return {
                success: true,
                data: response.data.data,
                message: 'Usuario actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar usuario'
            };
        }
    },

    /**
     * Desactivar un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Resultado de la operaci\u00f3n
     */
    async eliminar(id) {
        try {
            const response = await api.delete(`/api/usuarios/${id}`);
            return {
                success: true,
                message: response.data.message || 'Usuario desactivado exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar usuario'
            };
        }
    },

    /**
     * Resetear contrase\u00f1a de un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Nueva contrase\u00f1a generada
     */
    async resetearPassword(id) {
        try {
            const response = await api.post(`/api/usuarios/${id}/reset-password`);
            return {
                success: true,
                data: response.data.data,
                message: 'Contrase\u00f1a reseteada exitosamente'
            };
        } catch (error) {
            console.error('Error al resetear contrase\u00f1a:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al resetear contrase\u00f1a'
            };
        }
    }
};

export default usuariosService;
