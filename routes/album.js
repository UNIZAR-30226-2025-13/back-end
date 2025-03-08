const express = require('express');
const router = express.Router();
const { getAlbum } = require('../controllers/albumController');

router.get('/album', getAlbum);

module.exports = router;