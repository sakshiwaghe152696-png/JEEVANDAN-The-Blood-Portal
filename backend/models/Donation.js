const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ Changed from Donor to User
      required: true,
    },

    bank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodBank",
      required: true,
    },

    blood_group: {
      type: String,
      required: true,
    },

    units: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["Completed", "Rejected"],
      default: "Completed",
    },

    remarks: {
      type: String,
      default: "",
    },

    donationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);