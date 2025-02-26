const express = require('express');
const router = express.Router();
const { getProfile, changePassword } = require('../controllers/userController');
const { verifyToken } = require('../middleware/autorizationMiddleware');

router.get("/perfil", verifyToken, getProfile);
router.post("/cambiar-contrasena", verifyToken, changePassword);

module.exports = router;