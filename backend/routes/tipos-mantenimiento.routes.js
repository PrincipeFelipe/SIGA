const express = require('express');
const router = express.Router();
const tiposMantenimientoController = require('../controllers/tipos-mantenimiento.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

// ============================================================================
// RUTAS DE TIPOS DE MANTENIMIENTO
// ============================================================================

// Obtener todos los tipos
router.get(
    '/',
    authenticate,
    requirePermission('maintenance_types:view'),
    tiposMantenimientoController.getAll
);

// Obtener tipos activos (para selección)
router.get(
    '/activos',
    authenticate,
    requirePermission('maintenance_types:view'),
    tiposMantenimientoController.getActivos
);

// Obtener un tipo por ID
router.get(
    '/:id',
    authenticate,
    requirePermission('maintenance_types:view'),
    tiposMantenimientoController.getById
);

// Crear un tipo
router.post(
    '/',
    authenticate,
    requirePermission('maintenance_types:create'),
    tiposMantenimientoController.create
);

// Actualizar un tipo
router.put(
    '/:id',
    authenticate,
    requirePermission('maintenance_types:edit'),
    tiposMantenimientoController.update
);

// Eliminar un tipo
router.delete(
    '/:id',
    authenticate,
    requirePermission('maintenance_types:delete'),
    tiposMantenimientoController.delete
);

module.exports = router;
