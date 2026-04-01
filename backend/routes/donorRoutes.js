const express = require("express");
const router = express.Router();

const donorController = require("../controllers/donorController");

// Get all donors
router.get("/all", donorController.getAllDonors);

// ❌ Delete donor (soft delete) — ✅ ADDED
router.delete("/:id", donorController.deleteDonor);

module.exports = router;