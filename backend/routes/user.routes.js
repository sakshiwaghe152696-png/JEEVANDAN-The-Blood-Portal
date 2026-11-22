const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");

const {
  getMyProfile,
  donateBlood,
  updateMedical,
  getMyNotifications,
  getMyStats,
  toggleAvailability,
  activateAccount
   // ✅ NEW IMPORT
} = require("../controllers/user.controller");

// Profile
router.get("/profile", auth, getMyProfile);

// Donate
router.post("/donate", auth, donateBlood);

// Medical update
router.put("/medical", auth, updateMedical);

// Notifications
router.get("/notifications", auth, getMyNotifications);

// Stats
router.get("/stats", auth, getMyStats);

// ✅ NEW ROUTE
router.put("/toggle-availability", auth, toggleAvailability);
router.put("/activate", auth, activateAccount);

module.exports = router;