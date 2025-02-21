const express = require('express');
const { getPerfil } = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/autorizacionMiddleware');
const router = express.Router();

router.get('/perfil', verificarToken, getPerfil);

module.exports = router;