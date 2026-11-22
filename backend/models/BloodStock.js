const mongoose = require("mongoose");

const bloodStockSchema = new mongoose.Schema(
  {
    bank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodBank",
      required: true,
    },

    blood_group: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },

    component: {
      type: String,
      enum: ["WHOLE", "RBC", "PLASMA", "PLATELETS"],
      default: "WHOLE",
    },

    units: {
      type: Number,
      default: 0,
    },

    expiry_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

bloodStockSchema.index(
  {
    bank_id: 1,
    blood_group: 1,
    component: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("BloodStock", bloodStockSchema);