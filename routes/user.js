const express = require('express');
const router = express.Router();
const { getProfile, changePassword } = require('../controllers/userController');
const { verifyToken } = require('../middleware/autorizationMiddleware');

router.get("/perfil", verifyToken, getProfile);
router.patch("/change-password", verifyToken, changePassword);

module.exports = router;