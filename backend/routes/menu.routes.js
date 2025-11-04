// ============================================================================
// RUTAS DE MENÚ DINÁMICO
// ============================================================================

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/menu - Obtener menú dinámico (requiere autenticación)
router.get('/', 
    authenticate, 
    menuController.obtenerMenu
);

module.exports = router;
