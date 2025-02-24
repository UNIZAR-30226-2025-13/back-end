const express = require('express');
const router = express.Router();
const { getArtista } = require('../controllers/artistaController');

router.get('/:id', getArtista);

module.exports = router;