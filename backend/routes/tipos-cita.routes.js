const express = require('express');
const router = express.Router();
const tiposCitaController = require('../controllers/tipos-cita.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

// ============================================================================
// RUTAS DE TIPOS DE CITA
// ============================================================================

// Obtener todos los tipos de cita
router.get(
    '/',
    authenticate,
    requirePermission('appointment_types:view'),
    tiposCitaController.getAll
);

// Obtener tipos de cita activos (para selección en formularios)
router.get(
    '/activos',
    authenticate,
    requirePermission('appointment_types:view'),
    tiposCitaController.getActivos
);

// Obtener un tipo de cita por ID
router.get(
    '/:id',
    authenticate,
    requirePermission('appointment_types:view'),
    tiposCitaController.getById
);

// Crear un nuevo tipo de cita
router.post(
    '/',
    authenticate,
    requirePermission('appointment_types:create'),
    tiposCitaController.create
);

// Actualizar un tipo de cita
router.put(
    '/:id',
    authenticate,
    requirePermission('appointment_types:edit'),
    tiposCitaController.update
);

// Eliminar un tipo de cita
router.delete(
    '/:id',
    authenticate,
    requirePermission('appointment_types:delete'),
    tiposCitaController.delete
);

module.exports = router;
