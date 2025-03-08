const express = require('express');
const router = express.Router();
<<<<<<< Updated upstream
const { getProfile, changePassword, getLists, createList, addSongToPlaylist } = require('../controllers/userController');
=======
const { getProfile, changePassword, getLists, createList, getPlaylists } = require('../controllers/userController');
>>>>>>> Stashed changes
const { verifyToken } = require('../middleware/autorizationMiddleware');

router.get("/perfil", verifyToken, getProfile);
router.post("/change-password", changePassword);
router.get("/get-lists",  getLists);
router.post("/create-list",  createList);

module.exports = router;