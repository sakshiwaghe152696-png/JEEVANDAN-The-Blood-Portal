const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { isDoctor } = require("../middlewares/role");
const doctorController = require("../controllers/doctor.controller");

// Nearby blood banks
router.get("/nearby-blood-banks", auth, isDoctor, doctorController.getNearbyBloodBanks);

// Map data
router.get("/map-data", auth, isDoctor, doctorController.getMapData);

// Doctor profile
router.get("/profile", auth, isDoctor, doctorController.getDoctorProfile);

// Create user
router.post("/create-user", auth, isDoctor, doctorController.createUser);

// Blood stock for a bank
router.get("/blood-stock/:bankId", auth, isDoctor, doctorController.getBloodStock);

// Raise blood request
router.post("/request-blood/:bankId", auth, isDoctor, doctorController.createBloodRequest);

// My requests list
router.get("/my-requests", auth, isDoctor, doctorController.getMyRequests);

// Single request details (with bank info + stock)
router.get("/request/:id", auth, isDoctor, doctorController.getRequestById);

// Notifications
router.get("/notifications", auth, isDoctor, doctorController.getNotifications);
router.patch("/notifications/:id/read", auth, isDoctor, doctorController.markNotificationRead);

router.get("/donors", auth, isDoctor, doctorController.getAllDonors);

router.get("/best-donors", auth, isDoctor, doctorController.getBestDonors);

router.post("/notify/:id", auth, isDoctor, doctorController.notifyDonor);


router.get("/test-sms", async (req, res) => {
  try {
    const { sendSMS } = require("../services/notification.service");

    await sendSMS(
      "686000000000000000000000", // Temporary dummy user ID
      "+917410781884",
      "🩸 Jeevandan Test SMS - Twilio integration is working!"
    );

    res.json({
      success: true,
      message: "SMS sent successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
module.exports = router;