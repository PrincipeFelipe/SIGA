// ============================================================================
// RUTAS DE MENÚ DINÁMICO
// ============================================================================

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

// GET /api/menu - Obtener menú dinámico
router.get('/', menuController.obtenerMenu);

module.exports = router;
