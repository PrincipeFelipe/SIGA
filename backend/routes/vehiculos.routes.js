const express = require('express');
const router = express.Router();
const vehiculosController = require('../controllers/vehiculos.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

// ============================================================================
// RUTAS DE VEHÍCULOS
// ============================================================================

// Obtener todos los vehículos (con filtrado jerárquico)
router.get(
    '/',
    authenticate,
    requirePermission('vehicles:view'),
    vehiculosController.getAll
);

// Obtener vehículos por unidad
router.get(
    '/unidad/:unidad_id',
    authenticate,
    requirePermission('vehicles:view'),
    vehiculosController.getByUnidad
);

// Obtener un vehículo por ID
router.get(
    '/:id',
    authenticate,
    requirePermission('vehicles:view'),
    vehiculosController.getById
);

// Crear un nuevo vehículo
router.post(
    '/',
    authenticate,
    requirePermission('vehicles:create'),
    vehiculosController.create
);

// Actualizar un vehículo
router.put(
    '/:id',
    authenticate,
    requirePermission('vehicles:edit'),
    vehiculosController.update
);

// Eliminar un vehículo
router.delete(
    '/:id',
    authenticate,
    requirePermission('vehicles:delete'),
    vehiculosController.delete
);

module.exports = router;
