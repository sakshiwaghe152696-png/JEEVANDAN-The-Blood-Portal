import mongoose from "mongoose";
import User from "./models/User.js";
import BloodBank from "./models/BloodBank.js";

const MONGO_URI = "mongodb+srv://priyanka_db_user:QFcGvE709mpGqn8I@blood-portal-db.affl0n4.mongodb.net/blood_portal_db";

// 🔥 normalize function
const normalize = (str) => {
  return str.toLowerCase().replace(/[^a-z]/g, "");
};

const linkAdminsToBanks = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to DB");

    const admins = await User.find({ role: "BANK_ADMIN" });
    const banks = await BloodBank.find();

    console.log("Total admins:", admins.length);
    console.log("Total banks:", banks.length);

    let linked = 0;
    let notFound = 0;

    for (let admin of admins) {

      if (!admin.email) {
        console.log(`❌ No email for admin`);
        continue;
      }

      const emailKey = normalize(admin.email.split("@")[0]);

      let matchedBank = null;

      for (let bank of banks) {
        const bankKey = normalize(bank.name);

        if (bankKey.includes(emailKey) || emailKey.includes(bankKey)) {
          matchedBank = bank;
          break;
        }
      }

      if (matchedBank) {
        matchedBank.adminId = admin._id;
        await matchedBank.save();

        admin.bankId = matchedBank._id;
        await admin.save();

        console.log(`✅ Linked: ${admin.email} → ${matchedBank.name}`);
        linked++;
      } else {
        console.log(`❌ No bank for: ${admin.email}`);
        notFound++;
      }
    }

    console.log("\n🎯 FINAL RESULT");
    console.log("✅ Linked:", linked);
    console.log("❌ Not Found:", notFound);

    process.exit();
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

linkAdminsToBanks();