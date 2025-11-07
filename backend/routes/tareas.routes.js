// ============================================================================
// RUTAS DE TAREAS
// ============================================================================

const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareas.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { auditLog } = require('../middleware/auditLog');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/tareas/estadisticas
 * Obtener estadísticas de tareas
 */
router.get('/estadisticas',
    authorize('tasks:view'),
    tareasController.obtenerEstadisticas
);

/**
 * GET /api/tareas
 * Listar tareas con filtros
 */
router.get('/',
    authorize('tasks:view'),
    tareasController.listar
);

/**
 * GET /api/tareas/:id
 * Obtener una tarea por ID
 */
router.get('/:id',
    authorize('tasks:view'),
    tareasController.obtenerPorId
);

/**
 * POST /api/tareas
 * Crear una nueva tarea
 */
router.post('/',
    authorize('tasks:create'),
    auditLog('Tarea', 'crear'),
    tareasController.crear
);

/**
 * PUT /api/tareas/:id
 * Actualizar una tarea
 */
router.put('/:id',
    authorize('tasks:edit'),
    auditLog('Tarea', 'actualizar'),
    tareasController.actualizar
);

/**
 * DELETE /api/tareas/:id
 * Eliminar una tarea
 */
router.delete('/:id',
    authorize('tasks:delete'),
    auditLog('Tarea', 'eliminar'),
    tareasController.eliminar
);

/**
 * POST /api/tareas/:id/comentarios
 * Agregar un comentario a una tarea
 */
router.post('/:id/comentarios',
    authorize('tasks:comment'),
    tareasController.agregarComentario
);

module.exports = router;
