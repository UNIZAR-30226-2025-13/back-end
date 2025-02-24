const express = require('express');
const router = express.Router();
const { getPerfil } = require('../controllers/usuarioController');
const verificarToken = require('../middleware/autorizacionMiddleware');

router.get('/perfil', verificarToken, getPerfil);

module.exports = router;