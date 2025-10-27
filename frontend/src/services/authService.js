// ============================================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================================

import api from './api';

const authService = {
    /**
     * Iniciar sesión
     * @param {string} username - Usuario
     * @param {string} password - Contraseña
     * @returns {Promise} Datos del usuario
     */
    login: async (username, password) => {
        try {
            const response = await api.post('/api/auth/login', {
                username,
                password
            });
            
            if (response.data.success) {
                return {
                    success: true,
                    user: response.data.user
                };
            }
            
            return {
                success: false,
                message: response.data.message || 'Error al iniciar sesión'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error de conexión'
            };
        }
    },

    /**
     * Cerrar sesión
     * @returns {Promise} Resultado
     */
    logout: async () => {
        try {
            const response = await api.post('/api/auth/logout');
            return {
                success: response.data.success
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cerrar sesión'
            };
        }
    },

    /**
     * Obtener usuario autenticado
     * @returns {Promise} Datos del usuario
     */
    me: async () => {
        try {
            const response = await api.get('/api/auth/me');
            
            if (response.data.success) {
                return {
                    success: true,
                    user: response.data.user // Corregido: era response.data.data
                };
            }
            
            return {
                success: false,
                user: null
            };
        } catch (error) {
            return {
                success: false,
                user: null
            };
        }
    },

    /**
     * Cambiar contraseña
     * @param {string} currentPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise} Resultado
     */
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await api.post('/api/auth/change-password', {
                currentPassword,
                newPassword
            });
            
            return {
                success: response.data.success,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cambiar contraseña'
            };
        }
    }
};

export default authService;
