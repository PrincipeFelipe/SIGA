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

// GET /api/notificaciones/contador - Contar notificaciones no leídas
router.get('/contador',
    notificacionesController.contarNoLeidas
);

// GET /api/notificaciones/:id - Obtener detalle de una notificación
router.get('/:id',
    notificacionesController.obtenerPorId
);

// PATCH /api/notificaciones/:id/marcar-leida - Marcar notificación como leída
router.patch('/:id/marcar-leida',
    notificacionesController.marcarComoLeida
);

// PATCH /api/notificaciones/marcar-todas-leidas - Marcar todas como leídas
router.patch('/marcar-todas-leidas',
    notificacionesController.marcarTodasComoLeidas
);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id',
    notificacionesController.eliminar
);

module.exports = router;
