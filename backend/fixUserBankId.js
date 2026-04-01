import mongoose from "mongoose";
import User from "./models/User.js";
import BloodBank from "./models/BloodBank.js";

const MONGO_URI = "mongodb+srv://priyanka_db_user:QFcGvE709mpGqn8I@blood-portal-db.affl0n4.mongodb.net/blood_portal_db";

// normalize helper
const normalize = (str) => str.toLowerCase().replace(/[^a-z]/g, "");

const fixUserBankId = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    const users = await User.find({ role: "BANK_ADMIN" });
    const banks = await BloodBank.find();

    let updated = 0;
    let notFound = 0;

    for (let user of users) {
      if (!user.email) continue;

      const emailKey = normalize(user.email.split("@")[0]);

      let matchedBank = null;

      for (let bank of banks) {
        const bankKey = normalize(bank.name);

        if (bankKey.includes(emailKey) || emailKey.includes(bankKey)) {
          matchedBank = bank;
          break;
        }
      }

      if (matchedBank) {
        user.bankId = matchedBank._id;
        await user.save();

        console.log(`✅ Linked: ${user.email} → ${matchedBank.name}`);
        updated++;
      } else {
        console.log(`❌ No match for: ${user.email}`);
        notFound++;
      }
    }

    console.log("\n🎯 FINAL RESULT");
    console.log("✅ Updated:", updated);
    console.log("❌ Not Found:", notFound);

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixUserBankId();