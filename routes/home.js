const express = require('express');
const router = express.Router();
const { getHome } = require('../controllers/homeController');
const { getHomeMusic } = require('../controllers/homeMusicController');
const { getHomePodcast } = require('../controllers/homePodcastController');

router.get('/home', getHome);
router.get('/home-music', getHomeMusic);
router.get('/home-podcast', getHomePodcast);

module.exports = router;