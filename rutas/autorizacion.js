const express = require("express");
const { register, login } = require("../controllers/autorizacionController");
const router = express.Router();

// rutas
router.post("/register", register);
router.post("/login", login);
module.exports = router;