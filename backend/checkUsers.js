require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected\n");

  // Show all distinct roles
  const roles = await User.distinct("role");
  console.log("Roles in DB:", roles);

  // Show total users per role
  const all = await User.find({}, "email role city profile.latitude profile.longitude");
  for (const u of all) {
    console.log(`[${u.role}] ${u.email} | city: ${u.city} | lat: ${u.profile?.latitude} | lng: ${u.profile?.longitude}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

check().catch(console.error);