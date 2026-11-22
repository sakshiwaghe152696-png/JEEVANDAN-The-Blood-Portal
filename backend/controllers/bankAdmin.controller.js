const BloodRequest = require("../models/BloodRequest");
const BloodBank = require("../models/BloodBank");
const BloodStock = require("../models/BloodStock");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

/* ===============================
   GET DASHBOARD STATS
================================ */
exports.getDashboardStats = async (req, res) => {
  console.log("USER:", req.user);
  console.log("BANK ID:", req.user.bankId);

  try {
    const bankId = req.user.bankId;

    const [totalRequests, pending, approved, rejected, stock] =
      await Promise.all([
        BloodRequest.countDocuments({ blood_bank_id: bankId }),
        BloodRequest.countDocuments({
          blood_bank_id: bankId,
          status: "PENDING",
        }),
        BloodRequest.countDocuments({
          blood_bank_id: bankId,
          status: "APPROVED",
        }),
        BloodRequest.countDocuments({
          blood_bank_id: bankId,
          status: "REJECTED",
        }),
        BloodStock.find({ bank_id: bankId }),
      ]);

    const totalUnits = stock.reduce((sum, s) => sum + s.units, 0);

    res.json({
      totalRequests,
      pending,
      approved,
      rejected,
      totalUnits,
      stock,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch stats" });
  }
};

/* ===============================
   GET ALL REQUESTS FOR THIS BANK
================================ */
exports.getRequests = async (req, res) => {
  try {
    const bankId = req.user.bankId;
    const { status } = req.query;

    const filter = { blood_bank_id: bankId };
    if (status) filter.status = status;

    const requests = await BloodRequest.find(filter)
      .populate("doctor_id", "name email phone")
      .sort({ created_at: -1 });

    res.json(requests);
  } catch (err) {
    console.error("getRequests error:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/* ===============================
   ACCEPT A REQUEST
================================ */
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const bankId = req.user.bankId;

    // ✅ STEP 1: FIND REQUEST
    const request = await BloodRequest.findOne({
      _id: id,
      blood_bank_id: bankId,
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({ message: "Already processed" });
    }

    // ✅ STEP 2: ATOMIC STOCK UPDATE
    const updatedStock = await BloodStock.findOneAndUpdate(
      {
        bank_id: bankId,
        blood_group: request.blood_group,
        component: request.component,
        units: { $gte: request.units } // ensures enough stock
      },
      {
        $inc: { units: -request.units }
      },
      { new: true }
    );

    if (!updatedStock) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    // ✅ STEP 3: UPDATE REQUEST
    request.status = "APPROVED";
    request.updated_at = new Date();
    await request.save();
    // ✅ NOTIFY DOCTOR
await Notification.create({
  user_id: request.doctor_id,
  title: "Blood Request Approved ✅",
  message: `Your request for ${request.units} units of ${request.blood_group} (${request.component}) has been APPROVED.`,
  type: "BLOOD_REQUEST",
  reference_id: request._id.toString(),
  priority: request.urgency === "Emergency" ? "CRITICAL" : "HIGH",
  channel: "DASHBOARD",
});

    res.json({
      message: "Request approved & stock updated",
      request,
      remaining_units: updatedStock.units
    });

  } catch (err) {
    console.error("acceptRequest error:", err);
    res.status(500).json({ message: "Error approving request" });
  }
};

/* ===============================
   REJECT A REQUEST
================================ */
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const bankId = req.user.bankId;

    const request = await BloodRequest.findOne({
      _id: id,
      blood_bank_id: bankId,
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Request is no longer pending" });
    }

    request.status = "REJECTED";
    request.updated_at = new Date();
    if (reason) request.rejection_reason = reason;
    await request.save();

    await Notification.create({
      user_id: request.doctor_id,
      title: "Blood Request Rejected ❌",
      message: `Your request for ${request.units} units of ${request.blood_group} has been REJECTED.${
        reason ? " Reason: " + reason : ""
      } Please contact the blood bank or try another.`,
      type: "BLOOD_REQUEST",
      reference_id: request._id.toString(),
      priority: "HIGH",
      channel: "DASHBOARD",
    });

    res.json({ message: "Request rejected", request });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ message: "Failed to reject request" });
  }
};

/* ===============================
   GET ADMIN NOTIFICATIONS
================================ */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.id
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/* ===============================
   MARK NOTIFICATION AS READ
================================ */
exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      is_read: true,
    });

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("markNotificationRead error:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

/* ===============================
   GET BANK ADMIN PROFILE
================================ */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from middleware

    const user = await User.findById(userId)
      .select("email phone city role blood_bank_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user_id: user._id,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      bankId: user.blood_bank_id
    });

  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};


