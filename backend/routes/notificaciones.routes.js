// ============================================================================
// RUTAS DE NOTIFICACIONES
// ============================================================================

const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones.controller');

// GET /api/notificaciones - Listar notificaciones del usuario autenticado
router.get('/',
    notificacionesController.listar
);

// GET /api/notificaciones/no-leidas - Contar notificaciones no leídas
router.get('/no-leidas',
    notificacionesController.contarNoLeidas
);

// GET /api/notificaciones/:id - Obtener detalle de una notificación
router.get('/:id',
    notificacionesController.obtenerPorId
);

// POST /api/notificaciones/:id/leer - Marcar notificación como leída
router.post('/:id/leer',
    notificacionesController.marcarComoLeida
);

// POST /api/notificaciones/leer-todas - Marcar todas como leídas
router.post('/leer-todas',
    notificacionesController.marcarTodasComoLeidas
);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id',
    notificacionesController.eliminar
);

module.exports = router;
