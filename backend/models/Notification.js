const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  title: String,
  message: String,

  type: {
    type: String,
    enum: [
      "BLOOD_REQUEST",
      "DONOR_EMERGENCY",
      "ELIGIBILITY_REMINDER",
      "SYSTEM"
    ]
  },

  reference_id: String,

  channel: {
    type: String,
    enum: ["DASHBOARD", "WHATSAPP", "CALL"],
    default: "DASHBOARD"
  },

  priority: {
    type: String,
    enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"],
    default: "NORMAL"
  },

  is_read: {
    type: Boolean,
    default: false
  },

  is_sent: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);