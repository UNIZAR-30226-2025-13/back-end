const express = require('express');
const router = express.Router();
const { getProfile, changePassword, getLists, createList } = require('../controllers/userController');
const { verifyToken } = require('../middleware/autorizationMiddleware');

router.get("/perfil", verifyToken, getProfile);
router.patch("/change-password", verifyToken, changePassword);
router.get("/get-lists",  getLists);
router.post("/create-list",  createList);

module.exports = router;