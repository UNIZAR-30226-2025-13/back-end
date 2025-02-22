const express = require('express');
const { getPerfil } = require('../controllers/usuarioController');
const verificarToken = require('../middleware/autorizacionMiddleware');
const router = express.Router();

router.get('/perfil', verificarToken, getPerfil);

module.exports = router;