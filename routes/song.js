const express = require('express');
const router = express.Router();
const { playSong } = require('../controllers/songController');

router.get('/play-song', playSong);

module.exports = router;
