const mongoose = require("mongoose");

const bloodBankSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  address: {
    type: String
  },

  city: {
    type: String
  },

  district: {
    type: String
  },

  state: {
    type: String
  },

  pincode: {
    type: Number
  },

  contact_number: {
    type: String
  },

  email: {
    type: String
  },

location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number],
    required: true
  }
},

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  created_at: {
    type: Date,
    default: Date.now
  }

});

bloodBankSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("BloodBank", bloodBankSchema);