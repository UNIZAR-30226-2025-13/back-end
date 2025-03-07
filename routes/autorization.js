const express = require("express");
const { register, login, changePasswordRequest } = require("../controllers/autorizationController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/change-password-request", changePasswordRequest);

module.exports = router;