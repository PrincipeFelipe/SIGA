// ============================================================================
// RUTAS DE ROLES
// ============================================================================

const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { requirePermission } = require('../middleware/authorize');
const { auditLog } = require('../middleware/auditLog');

// GET /api/roles - Listar todos los roles
router.get('/',
    requirePermission('roles:view'),
    rolesController.listar
);

// GET /api/roles/:id - Obtener detalle de un rol
router.get('/:id',
    requirePermission('roles:view'),
    rolesController.obtenerPorId
);

// POST /api/roles - Crear nuevo rol
router.post('/',
    requirePermission('roles:create'),
    auditLog('Rol'),
    rolesController.crear
);

// PUT /api/roles/:id - Actualizar rol
router.put('/:id',
    requirePermission('roles:edit'),
    auditLog('Rol'),
    rolesController.actualizar
);

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id',
    requirePermission('roles:delete'),
    auditLog('Rol'),
    rolesController.eliminar
);

// GET /api/roles/:id/permisos - Obtener permisos de un rol
router.get('/:id/permisos',
    requirePermission('roles:view'),
    rolesController.obtenerPermisos
);

// POST /api/roles/:id/permisos - Asignar permisos a un rol
router.post('/:id/permisos',
    requirePermission('roles:assign_permissions'),
    auditLog('Rol_Permisos'),
    rolesController.asignarPermisos
);

module.exports = router;
