const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { isBankAdmin } = require("../middlewares/role");
const bankAdminController = require("../controllers/bankAdmin.controller");
const User = require("../models/User");
const BloodBank = require("../models/BloodBank");

/* ===============================
   DASHBOARD STATS
================================ */
router.get("/dashboard", auth, isBankAdmin, bankAdminController.getDashboardStats);

/* ===============================
   BLOOD REQUESTS
================================ */
router.get("/requests", auth, isBankAdmin, bankAdminController.getRequests);
router.patch("/requests/:id/accept", auth, isBankAdmin, bankAdminController.acceptRequest);
router.patch("/requests/:id/reject", auth, isBankAdmin, bankAdminController.rejectRequest);

/* ===============================
   NOTIFICATIONS
================================ */
router.get("/notifications", auth, isBankAdmin, bankAdminController.getNotifications);
router.patch("/notifications/:id/read", auth, isBankAdmin, bankAdminController.markNotificationRead);

/* ===============================
   PROFILE (UPDATED ✅)
================================ */
router.get("/profile", auth, isBankAdmin, async (req, res) => {
  try {
    // ✅ correct user id
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // ✅ correct bank fetch
    const bank = await BloodBank.findById(admin.blood_bank_id);

    res.json({
      name: admin.profile?.full_name || "Bank Admin",
      email: admin.email,
      bloodBankName: bank ? bank.name : "Not Assigned"
    });

  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

module.exports = router;