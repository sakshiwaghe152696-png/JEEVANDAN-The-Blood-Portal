const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  full_name: String,
  age: Number,
  blood_group: String,

  is_critical: Boolean,
  diagnosis: String

}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);