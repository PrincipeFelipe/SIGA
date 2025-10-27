// ============================================================================
// RUTAS DE LOGS DE AUDITORÍA
// ============================================================================

const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const { requirePermission } = require('../middleware/authorize');

// GET /api/logs - Listar logs con filtros (solo admin)
router.get('/',
    requirePermission('logs:view'),
    logsController.listar
);

// GET /api/logs/estadisticas - Obtener estadísticas de logs (solo admin)
router.get('/estadisticas',
    requirePermission('logs:view'),
    logsController.obtenerEstadisticas
);

// GET /api/logs/:id - Obtener detalle de un log específico (solo admin)
router.get('/:id',
    requirePermission('logs:view'),
    logsController.obtenerPorId
);

// GET /api/logs/recurso/:recurso_tipo/:recurso_id - Obtener historial de un recurso
router.get('/recurso/:recurso_tipo/:recurso_id',
    requirePermission('logs:view'),
    logsController.obtenerPorRecurso
);

module.exports = router;
