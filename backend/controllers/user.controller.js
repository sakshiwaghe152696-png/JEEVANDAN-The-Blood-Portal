const User = require("../models/User");
const Notification = require("../models/Notification");
const Donor = require("../models/Donor");
const BloodRequest = require("../models/BloodRequest");
const DonorMedicalProfile = require("../models/DonorMedicalProfile");
const Donation = require("../models/Donation");

/* ===============================
   GET MY PROFILE
================================ */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const donor = await DonorMedicalProfile.findOne({
      donor_id: user._id,
    });

    // Latest completed donation
    const lastDonation = await Donation.findOne({
      donor_id: user._id,
      status: "Completed",
    }).sort({ donationDate: -1 });

    let lastDonationDate = null;
    let nextDonationDate = null;
    let eligible = true;
    let daysRemaining = 0;

    if (lastDonation) {
      lastDonationDate = lastDonation.donationDate;

      nextDonationDate = new Date(lastDonationDate);
      nextDonationDate.setDate(nextDonationDate.getDate() + 90);

      const diff = nextDonationDate - new Date();

      daysRemaining = Math.ceil(
        diff / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining > 0) {
        eligible = false;
      } else {
        daysRemaining = 0;
      }
    }

    res.json({
      _id: user._id,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      profile: user.profile,

      availability_status: user.availability_status,

      blood_group: donor?.blood_group || null,

      medical: {
        hemoglobin: donor?.hemoglobin || null,
      },

      lastDonationDate,
      nextDonationDate,
      eligible,
      daysRemaining,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ===============================
   TOGGLE AVAILABILITY (NEW 🔥)
================================ */
exports.toggleAvailability = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { availability_status: status },
      { new: true }
    );

    res.json({
      message: "Availability updated successfully",
      availability_status: user.availability_status
    });

  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   DONATE BLOOD
================================ */
exports.donateBlood = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profile.last_donation_date": new Date()
        }
      },
      { new: true }
    );

    const lastDonation = user.profile?.last_donation_date;

    if (lastDonation) {
      const diffDays = Math.floor(
        (new Date() - new Date(lastDonation)) / (1000 * 60 * 60 * 24)
      );

      const existing = await Notification.findOne({
        user_id: user._id,
        type: "ELIGIBILITY_REMINDER"
      });

      if (!existing && diffDays >= 90) {
        await Notification.create({
          user_id: user._id,
          title: "You can donate again 🩸",
          message: "90 days completed since your last donation",
          type: "ELIGIBILITY_REMINDER",
          priority: "HIGH"
        });
      }
    }

    res.json({ message: "Donation saved", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   UPDATE MEDICAL
================================ */
exports.updateMedical = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { medical_conditions } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profile.medical_conditions": medical_conditions
        }
      },
      { new: true }
    );

    if (medical_conditions.includes("HIV")) {
      await Notification.create({
        user_id: userId,
        title: "Government Treatment Available",
        message: "Free HIV treatment available at nearby govt hospitals",
        type: "SYSTEM",
        priority: "HIGH"
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET NOTIFICATIONS
================================ */
/* ===============================
   GET NOTIFICATIONS
================================ */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Existing notifications except eligibility reminder
    let notifications = await Notification.find({
      user_id: userId,
      type: { $ne: "ELIGIBILITY_REMINDER" }
    }).sort({ createdAt: -1 });

    // Find latest completed donation
    const lastDonation = await Donation.findOne({
      donor_id: userId,
      status: "Completed"
    }).sort({ donationDate: -1 });

    if (lastDonation) {
      const lastDate = new Date(lastDonation.donationDate);

      const nextEligibleDate = new Date(lastDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

      const today = new Date();

      if (today >= nextEligibleDate) {
        notifications.unshift({
          title: "🩸 You're Eligible to Donate Again!",
          message: "It's been 90 days since your last donation. You can donate again now.",
          type: "ELIGIBILITY_REMINDER"
        });
      } else {
        const remainingDays = Math.ceil(
          (nextEligibleDate - today) / (1000 * 60 * 60 * 24)
        );

        notifications.unshift({
          title: "🩸 Donation Recovery Period",
          message: `You can donate again in ${remainingDays} day(s).`,
          type: "INFO"
        });
      }
    } else {
      notifications.unshift({
        title: "❤️ Become a Blood Donor",
        message: "You haven't donated yet. Your first donation can save up to 3 lives!",
        type: "INFO"
      });
    }

    res.json(notifications);

  } catch (err) {
    console.error("NOTIFICATION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET STATS
================================ */
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const donations = await DonorMedicalProfile.countDocuments({
      donor_id: userId
    });

    const requests = await BloodRequest.countDocuments({
      doctor_id: userId
    });

    res.json({
      donations,
      requests
    });

  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.activateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.user_id, {
      is_active: true
    });

    res.json({ message: "Account activated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};