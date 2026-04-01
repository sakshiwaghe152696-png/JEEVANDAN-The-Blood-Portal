const mongoose = require("mongoose");
const User = require("../models/User");
const BloodBank = require("../models/BloodBank");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

async function fixBanks() {

  const admins = await User.find({ role: "BANK_ADMIN" }).sort({ _id: 1 });

  const banks = await BloodBank.find().sort({ _id: 1 });

  const count = Math.min(admins.length, banks.length);

  for (let i = 0; i < count; i++) {

    const admin = admins[i];
    const bank = banks[i];

    bank.created_by = admin._id;
    await bank.save();

    admin.profile = { full_name: bank.name };
    await admin.save();

    console.log(`Linked ${bank.name} → ${admin.email}`);
  }

  console.log("Finished fixing all banks");

  process.exit();
}

fixBanks();