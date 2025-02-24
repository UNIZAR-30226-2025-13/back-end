const express = require('express');
const router = express.Router();
const { getPerfil, changePassword } = require('../controllers/usuarioController');
const verificarToken = require('../middleware/autorizacionMiddleware');

router.get('/perfil', verificarToken, getPerfil);
router.put("/cambiar-contrasena", verificarToken, changePassword);
module.exports = router;