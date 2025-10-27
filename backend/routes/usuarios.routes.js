// ============================================================================
// RUTAS DE USUARIOS
// ============================================================================

const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { authorize } = require('../middleware/authorize');
const { auditLog } = require('../middleware/auditLog');
const { query } = require('../config/database');

// GET /api/usuarios - Listar usuarios (con filtro jerárquico automático)
router.get('/',
    authorize('users:view'),
    usuariosController.listar
);

// GET /api/usuarios/:id - Obtener detalle de usuario
router.get('/:id',
    authorize('users:view_detail', {
        getRecursoUnidadId: async (req) => {
            const [usuario] = await query(
                'SELECT unidad_destino_id FROM Usuarios WHERE id = ?',
                [req.params.id]
            );
            return usuario?.unidad_destino_id;
        }
    }),
    usuariosController.obtenerPorId
);

// POST /api/usuarios - Crear usuario
router.post('/',
    authorize('users:create', {
        getRecursoUnidadId: async (req) => req.body.unidad_destino_id
    }),
    auditLog('Usuario'),
    usuariosController.crear
);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id',
    authorize('users:edit', {
        getRecursoUnidadId: async (req) => {
            const [usuario] = await query(
                'SELECT unidad_destino_id FROM Usuarios WHERE id = ?',
                [req.params.id]
            );
            return usuario?.unidad_destino_id;
        }
    }),
    auditLog('Usuario'),
    usuariosController.actualizar
);

// DELETE /api/usuarios/:id - Desactivar usuario
router.delete('/:id',
    authorize('users:delete', {
        getRecursoUnidadId: async (req) => {
            const [usuario] = await query(
                'SELECT unidad_destino_id FROM Usuarios WHERE id = ?',
                [req.params.id]
            );
            return usuario?.unidad_destino_id;
        }
    }),
    auditLog('Usuario'),
    usuariosController.eliminar
);

// POST /api/usuarios/:id/reset-password - Resetear contraseña
router.post('/:id/reset-password',
    authorize('users:reset_password', {
        getRecursoUnidadId: async (req) => {
            const [usuario] = await query(
                'SELECT unidad_destino_id FROM Usuarios WHERE id = ?',
                [req.params.id]
            );
            return usuario?.unidad_destino_id;
        }
    }),
    auditLog('Usuario'),
    usuariosController.resetPassword
);

module.exports = router;
