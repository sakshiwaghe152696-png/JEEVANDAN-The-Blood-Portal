const mongoose = require("mongoose");

const bloodStockSchema = new mongoose.Schema({

  bank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank",
    required: true
  },

  blood_group: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true
  },

  component: {
    type: String,
    enum: ["WHOLE", "RBC", "PLASMA", "PLATELETS"],
    default: "WHOLE"
  },

  units: {
    type: Number,
    default: 0
  },

  expiry_date: {
    type: Date
  }

});

module.exports = mongoose.model("BloodStock", bloodStockSchema);