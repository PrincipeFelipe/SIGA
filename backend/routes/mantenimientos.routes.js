const express = require('express');
const router = express.Router();
const mantenimientosController = require('../controllers/mantenimientos.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

// ============================================================================
// RUTAS DE MANTENIMIENTOS
// ============================================================================

// Obtener estadísticas
router.get(
    '/estadisticas',
    authenticate,
    requirePermission('maintenance:view'),
    mantenimientosController.getEstadisticas
);

// Obtener mantenimientos pendientes
router.get(
    '/pendientes',
    authenticate,
    requirePermission('maintenance:view'),
    mantenimientosController.getPendientes
);

// Obtener todos los mantenimientos
router.get(
    '/',
    authenticate,
    requirePermission('maintenance:view'),
    mantenimientosController.getAll
);

// Obtener mantenimientos por vehículo
router.get(
    '/vehiculo/:vehiculo_id',
    authenticate,
    requirePermission('maintenance:view'),
    mantenimientosController.getByVehiculo
);

// Obtener un mantenimiento por ID
router.get(
    '/:id',
    authenticate,
    requirePermission('maintenance:view'),
    mantenimientosController.getById
);

// Crear un mantenimiento
router.post(
    '/',
    authenticate,
    requirePermission('maintenance:create'),
    mantenimientosController.create
);

// Actualizar un mantenimiento
router.put(
    '/:id',
    authenticate,
    requirePermission('maintenance:edit'),
    mantenimientosController.update
);

// Eliminar un mantenimiento
router.delete(
    '/:id',
    authenticate,
    requirePermission('maintenance:delete'),
    mantenimientosController.delete
);

module.exports = router;
