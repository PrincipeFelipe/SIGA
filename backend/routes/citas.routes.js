const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

// ============================================================================
// RUTAS DE CITAS
// ============================================================================

// Obtener disponibilidad de horarios
router.get(
    '/disponibilidad',
    authenticate,
    requirePermission('appointments:view'),
    citasController.getDisponibilidad
);

// Obtener mis citas (del usuario actual)
router.get(
    '/mis-citas',
    authenticate,
    requirePermission('appointments:view_own'),
    citasController.getMisCitas
);

// Obtener todas las citas (con filtrado jerárquico)
router.get(
    '/',
    authenticate,
    requirePermission('appointments:view'),
    citasController.getAll
);

// Obtener citas por vehículo
router.get(
    '/vehiculo/:vehiculo_id',
    authenticate,
    requirePermission('appointments:view'),
    citasController.getByVehiculo
);

// Obtener una cita por ID
router.get(
    '/:id',
    authenticate,
    requirePermission('appointments:view'),
    citasController.getById
);

// Crear una nueva cita
router.post(
    '/',
    authenticate,
    requirePermission('appointments:create'),
    citasController.create
);

// Actualizar una cita
router.put(
    '/:id',
    authenticate,
    requirePermission('appointments:edit'),
    citasController.update
);

// Confirmar una cita
router.patch(
    '/:id/confirmar',
    authenticate,
    requirePermission('appointments:manage'),
    citasController.confirmar
);

// Completar una cita
router.patch(
    '/:id/completar',
    authenticate,
    requirePermission('appointments:manage'),
    citasController.completar
);

// Cancelar una cita
router.patch(
    '/:id/cancelar',
    authenticate,
    requirePermission('appointments:cancel'),
    citasController.cancelar
);

module.exports = router;
