const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); // Importación correcta

// Ahora usamos authController.register
router.post('/register', authController.register);
router.post('/login', authController.login); // Agregamos esta línea

module.exports = router;

