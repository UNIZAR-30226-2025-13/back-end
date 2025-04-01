const express = require("express");
const router = express.Router();

const { showSong } = require("../controllers/songController");

router.get("/show", showSong);

module.exports = router;
