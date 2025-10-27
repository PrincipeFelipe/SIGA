// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
