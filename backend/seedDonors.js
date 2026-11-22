require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");

const User = require("./models/User");
const DonorMedicalProfile = require("./models/DonorMedicalProfile");

const cities = ["Pune", "Baramati", "Phaltan", "Indapur"];
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function randomDate() {
  return faker.date.past({ years: 2 });
}

async function seed() {
  try {
    console.log("🚀 Seeding started...\n");

    // ✅ STEP 1: CREATE NEW USERS
    for (let i = 1; i <= 60; i++) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      try {
        const uniqueEmail = `donor_${Date.now()}_${i}_${Math.floor(Math.random()*1000)}@gmail.com`;

        const user = await User.create({
          email: uniqueEmail,
          phone: faker.phone.number("9#########"),
          password: hashedPassword,
          role: "USER",
          city: faker.helpers.arrayElement(cities),
          availability_status: faker.datatype.boolean()
            ? "ACTIVE"
            : "INACTIVE",
          profile: {
            full_name: faker.person.fullName(),
            gender: faker.helpers.arrayElement(["Male", "Female"])
          }
        });

        await DonorMedicalProfile.create({
          donor_id: user._id,
          blood_group: faker.helpers.arrayElement(bloodGroups),
          last_donation_date: randomDate()
        });

        console.log(`✅ Created: ${user.email}`);

      } catch (err) {
        if (err.code === 11000) {
          console.log("⚠️ Duplicate skipped");
        } else {
          console.error("❌ Error:", err.message);
        }
      }
    }

    // ✅ STEP 2: FIX MISSING MEDICAL PROFILES
    const users = await User.find({ role: "USER" });

    for (let user of users) {
      const exists = await DonorMedicalProfile.findOne({
        donor_id: user._id
      });

      if (!exists) {
        await DonorMedicalProfile.create({
          donor_id: user._id,
          blood_group: faker.helpers.arrayElement(bloodGroups),
          last_donation_date: randomDate()
        });

        console.log(`🩸 Profile added for ${user.email}`);
      }
    }

    // ✅ FINAL COUNTS
    const totalUsers = await User.countDocuments({ role: "USER" });
    const totalProfiles = await DonorMedicalProfile.countDocuments();

    console.log("\n📊 FINAL DATA:");
    console.log("👥 Total Users:", totalUsers);
    console.log("🩸 Total Profiles:", totalProfiles);

    await mongoose.disconnect();
    process.exit();

  } catch (err) {
    console.error("❌ SEED ERROR:", err);
  }
}

// ✅ CONNECT TO ATLAS
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected\n");
    seed();
  })
  .catch(err => console.error("❌ DB ERROR:", err));