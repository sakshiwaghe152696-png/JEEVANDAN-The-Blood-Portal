const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");
const controller = require("../controllers/superAdmin.controller");

router.post(
  "/create-doctor",
  auth,
  requireSuperAdmin,
  controller.createDoctor
);

router.post(
  "/create-bank-admin",
  auth,
  requireSuperAdmin,
  controller.createBankAdminWithBloodBank
);

router.get(
  "/dashboard-stats",
  auth,
  requireSuperAdmin,
  controller.getDashboardStats
);

router.get(
  "/blood-banks",
  auth,
  requireSuperAdmin,
  controller.getBloodBanks
);

router.get(
  "/bank-admins",
  auth,
  requireSuperAdmin,
  controller.getBankAdmins
);

router.get(
  "/doctors",
  auth,
  requireSuperAdmin,
  controller.getDoctors
);

// ✏️ Update Doctor
router.put(
  "/doctors/:id",
  auth,
  requireSuperAdmin,
  controller.updateDoctor
);

// ❌ Delete Doctor (soft delete)
router.delete(
  "/doctors/:id",
  auth,
  requireSuperAdmin,
  controller.deleteDoctor
);

// ✏️ Update Bank Admin
router.put(
  "/bank-admins/:id",
  auth,
  requireSuperAdmin,
  controller.updateBankAdmin
);

// ❌ Delete Bank Admin (soft delete)
router.delete(
  "/bank-admins/:id",
  auth,
  requireSuperAdmin,
  controller.deleteBankAdmin
);

router.delete(
  "/donors/:id",
  auth,
  requireSuperAdmin,
  controller.deleteDonor
);



module.exports = router;
