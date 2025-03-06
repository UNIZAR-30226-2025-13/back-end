const express = require('express');
const router = express.Router();
const { getProfile, changePassword, getLists, createList, addSongToPlaylist, getPlaylists } = require('../controllers/userController');
const { verifyToken } = require('../middleware/autorizationMiddleware');

router.get("/perfil", verifyToken, getProfile);
router.post("/change-password", changePassword);
router.get("/get-lists",  getLists);
router.get("/get-playlists",  getPlaylists);
router.post("/create-list",  createList);
router.post("/add-song-playlist", addSongToPlaylist)

module.exports = router;