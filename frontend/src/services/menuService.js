// ============================================================================
// SERVICIO DE MENÚ DINÁMICO
// ============================================================================
// Consume el endpoint /api/menu para obtener las aplicaciones accesibles
// ============================================================================

import api from './api';

const menuService = {
    /**
     * Obtener menú dinámico del usuario autenticado
     * @returns {Promise<Object>} { success, menu, total }
     */
    async obtenerMenu() {
        try {
            console.log('📡 Llamando a /api/menu...');
            const response = await api.get('/api/menu');
            console.log('📥 Respuesta recibida:', response.data);
            
            return {
                success: true,
                menu: response.data.menu || [],
                total: response.data.total || 0
            };
        } catch (error) {
            console.error('❌ Error obteniendo menú:', error);
            console.error('❌ Detalles del error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            return {
                success: false,
                menu: [],
                total: 0,
                error: error.response?.data?.message || error.message || 'Error al cargar el menú'
            };
        }
    }
};

export default menuService;
