const express = require('express');
const router = express.Router();
const { getPlaylistData, addSongToPlaylist } = require('../controllers/playlistsController');

router.get('/get-playlist-data', getPlaylistData);
router.post("/add-song-playlist", addSongToPlaylist)

module.exports = router;