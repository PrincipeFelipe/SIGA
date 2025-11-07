// ============================================================================
// SERVICIO DE DASHBOARD - Estadísticas generales del sistema
// ============================================================================

import api from './api';

const dashboardService = {
    /**
     * Obtener estadísticas del dashboard según permisos del usuario
     * @returns {Promise} Estadísticas del dashboard
     */
    obtenerEstadisticas: async () => {
        const response = await api.get('/api/dashboard/estadisticas');
        return response.data.data;
    },
};

export default dashboardService;
