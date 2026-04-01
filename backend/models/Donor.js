const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  age: {
    type: Number
  },

  gender: {
    type: String
  },

  blood_group: {
    type: String,
    required: true
  },

  phone: {
    type: String
  },

  email: {
    type: String
  },

  address: {
    type: String
  },

  blood_bank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank"
  },

  donation_date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Donor", donorSchema);