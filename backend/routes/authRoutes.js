const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth"); // your auth.js
const controller = require("../controllers/authController"); // ✅ THIS WAS MISSING

// 🔐 Login
router.post("/login", controller.login);

// 🔐 Get logged-in user profile
router.get("/me", auth, controller.getMyProfile);

module.exports = router;
