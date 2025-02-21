const express = require("express");
const { registro, login } = require("../controllers/autorizacionController");
const router = express.Router();

// rutas
router.post("/registro", registro);
router.post("/login", login);

module.exports = router;