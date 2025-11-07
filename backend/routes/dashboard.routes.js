// ============================================================================
// RUTAS DE DASHBOARD - Estadísticas generales del sistema
// ============================================================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/dashboard/estadisticas
 * @desc    Obtener estadísticas del dashboard según permisos del usuario
 * @access  Private (requiere autenticación)
 */
router.get('/estadisticas', dashboardController.obtenerEstadisticas);

module.exports = router;
