// ============================================================================
// RUTAS DE PERMISOS
// ============================================================================

const express = require('express');
const router = express.Router();
const permisosController = require('../controllers/permisos.controller');
const { requirePermission } = require('../middleware/authorize');
const { auditLog } = require('../middleware/auditLog');

// GET /api/permisos - Listar todos los permisos
router.get('/',
    requirePermission('permissions:view'),
    permisosController.listar
);

// GET /api/permisos/por-recurso - Listar permisos agrupados por recurso
router.get('/por-recurso',
    requirePermission('permissions:view'),
    permisosController.listarPorRecurso
);

// GET /api/permisos/:id - Obtener detalle de un permiso
router.get('/:id',
    requirePermission('permissions:view'),
    permisosController.obtenerPorId
);

// POST /api/permisos - Crear nuevo permiso
router.post('/',
    requirePermission('permissions:create'),
    auditLog('Permiso'),
    permisosController.crear
);

// PUT /api/permisos/:id - Actualizar permiso
router.put('/:id',
    requirePermission('permissions:edit'),
    auditLog('Permiso'),
    permisosController.actualizar
);

// DELETE /api/permisos/:id - Eliminar permiso
router.delete('/:id',
    requirePermission('permissions:delete'),
    auditLog('Permiso'),
    permisosController.eliminar
);

module.exports = router;
