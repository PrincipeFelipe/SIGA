// ============================================================================
// RUTAS DE USUARIO_ROLES_ALCANCE
// ============================================================================

const express = require('express');
const router = express.Router();
const rolesAlcanceController = require('../controllers/roles-alcance.controller');
const { requirePermission } = require('../middleware/authorize');
const { auditLog } = require('../middleware/auditLog');

// GET /api/usuarios/:usuarioId/roles-alcance - Listar roles y alcances de un usuario
router.get('/:usuarioId/roles-alcance',
    requirePermission('user_roles:view'),
    rolesAlcanceController.listarPorUsuario
);

// POST /api/usuarios/:usuarioId/roles-alcance - Asignar rol con alcance a un usuario
router.post('/:usuarioId/roles-alcance',
    requirePermission('user_roles:assign'),
    auditLog('Usuario_Roles_Alcance'),
    rolesAlcanceController.asignar
);

// DELETE /api/usuarios/:usuarioId/roles-alcance/:asignacionId - Revocar asignación
router.delete('/:usuarioId/roles-alcance/:asignacionId',
    requirePermission('user_roles:revoke'),
    auditLog('Usuario_Roles_Alcance'),
    rolesAlcanceController.revocar
);

// PUT /api/usuarios/:usuarioId/roles-alcance - Actualizar todas las asignaciones
router.put('/:usuarioId/roles-alcance',
    requirePermission('user_roles:assign'),
    auditLog('Usuario_Roles_Alcance'),
    rolesAlcanceController.actualizarAsignaciones
);

module.exports = router;
