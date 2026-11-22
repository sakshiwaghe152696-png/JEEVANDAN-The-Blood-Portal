const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({

  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  blood_bank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank",
    required: false
  },

  patient_name: {
    type: String,
    required: true
  },

  age: Number,

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },

  blood_group: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  },

  units: {
    type: Number,
    required: true,
    min: 1
  },

  component: {
    type: String,
    enum: ["WHOLE", "RBC", "PLASMA", "PLATELETS"],
    default: "WHOLE"
  },

  urgency: {
    type: String,
    enum: ["Routine", "Urgent", "Emergency"],
    default: "Routine"
  },

  diagnosis: String,
  hospital_name: String,

  location: {
    lat: Number,
    lng: Number
  },

  delivery_type: {
    type: String,
    enum: ["Pickup", "Delivery"],
    default: "Pickup"
  },

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
    default: "PENDING"
  },

  // Rejection reason filled by bank admin
  rejection_reason: {
    type: String,
    default: null
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: Date

});

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);