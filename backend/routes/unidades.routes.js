// ============================================================================
// RUTAS DE UNIDADES
// ============================================================================

const express = require('express');
const router = express.Router();
const unidadesController = require('../controllers/unidades.controller');
const { requirePermission } = require('../middleware/authorize');
const { auditLog } = require('../middleware/auditLog');

// GET /api/unidades - Obtener árbol completo
router.get('/',
    requirePermission('units:view'),
    unidadesController.obtenerArbol
);

// GET /api/unidades/lista - Obtener lista plana (para selects)
router.get('/lista',
    requirePermission('units:view'),
    unidadesController.obtenerLista
);

// GET /api/unidades/:id - Obtener detalle de unidad
router.get('/:id',
    requirePermission('units:view'),
    unidadesController.obtenerPorId
);

// GET /api/unidades/:id/descendientes - Obtener descendientes (CTE recursivo)
router.get('/:id/descendientes',
    requirePermission('units:view'),
    unidadesController.obtenerDescendientes
);

// POST /api/unidades - Crear unidad
router.post('/',
    requirePermission('units:create'),
    auditLog('Unidad'),
    unidadesController.crear
);

// PUT /api/unidades/:id - Actualizar unidad
router.put('/:id',
    requirePermission('units:edit'),
    auditLog('Unidad'),
    unidadesController.actualizar
);

// DELETE /api/unidades/:id - Eliminar unidad
router.delete('/:id',
    requirePermission('units:delete'),
    auditLog('Unidad'),
    unidadesController.eliminar
);

module.exports = router;
