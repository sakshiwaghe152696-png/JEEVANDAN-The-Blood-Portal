const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  full_name: String,
  degree: String,
  address: String,
  latitude: Number,
  longitude: Number,
  date_of_birth: Date,
  gender: String,
  photo: String, 

  last_donation_date: {
    type: Date,
    default: null
  },

  medical_conditions: {
    type: [String],
    default: []
  },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,

  role: {
    type: String,
    enum: ["SUPER_ADMIN", "BANK_ADMIN", "DOCTOR", "USER"]
  },

  city: String,

  // ✅ NEW FIELD (IMPORTANT 🔥)
  availability_status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  },

  // ✅ Existing fields (unchanged)
  blood_bank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank",
    default: null
  },

  is_active: {
    type: Boolean,
    default: true
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  last_login: Date,

  profile: profileSchema

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);