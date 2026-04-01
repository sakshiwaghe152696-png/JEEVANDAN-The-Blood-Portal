const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({

  donor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  blood_group: String,
  age: Number,
  weight: Number,

  hemoglobin: Number,
  blood_pressure: String,

  hiv: Boolean,
  hepatitis_b: Boolean,
  hepatitis_c: Boolean,
  malaria: Boolean,

  diabetes: Boolean,
  heart_disease: Boolean,

  smoking: Boolean,
  alcohol: Boolean,

  last_donation_date: Date,

  is_eligible: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("DonorMedicalProfile", donorSchema);