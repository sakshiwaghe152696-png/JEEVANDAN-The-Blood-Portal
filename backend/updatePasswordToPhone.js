require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function updatePasswords() {
  try {
    console.log("🔄 Updating passwords...\n");

    const users = await User.find({ role: "USER" });

    for (let user of users) {

      if (!user.phone) {
        console.log(`⚠️ Skipped (no phone): ${user.email}`);
        continue;
      }

      // 🔐 hash phone number
      const hashedPassword = await bcrypt.hash(user.phone, 10);

      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword
      });

      console.log(`✅ ${user.email} → Password = ${user.phone}`);
    }

    console.log("\n🎉 All passwords updated successfully!");

    await mongoose.disconnect();
    process.exit();

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

// ✅ Connect to Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected\n");
    updatePasswords();
  })
  .catch(err => console.error(err));