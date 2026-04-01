/**
 * fixDoctorCoordinates.js
 *
 * One-time script to re-geocode all doctors and fix their coordinates.
 *
 * Usage:
 *   node fixDoctorCoordinates.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("./models/User");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const geocodeCity = async (city) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Maharashtra, India")}&format=json&limit=1`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Jeevandan-BloodManagement/1.0 (jeevandan@gmail.com)",
    },
    timeout: 10000,
  });

  if (!response.data || response.data.length === 0) {
    throw new Error(`No results for city: "${city}"`);
  }

  return {
    latitude: parseFloat(response.data[0].lat),
    longitude: parseFloat(response.data[0].lon),
  };
};

const fixDoctors = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const doctors = await User.find({ role: "DOCTOR" });
  console.log(`Found ${doctors.length} doctors to process...\n`);

  let fixed = 0;
  let failed = 0;

  for (const doctor of doctors) {
    try {
      const city = doctor.city;

      if (!city) {
        console.warn(`  ⏭️  Skipped: ${doctor.email} — no city set\n`);
        failed++;
        continue;
      }

      console.log(`Processing: ${doctor.profile?.full_name || doctor.email} (${city})`);

      const { latitude, longitude } = await geocodeCity(city);

      if (!doctor.profile) doctor.profile = {};
      doctor.profile.latitude = latitude;
      doctor.profile.longitude = longitude;

      await doctor.save();

      console.log(`  ✅ Fixed: [${latitude}, ${longitude}]\n`);
      fixed++;

    } catch (err) {
      console.warn(`  ❌ Failed: ${err.message}\n`);
      failed++;
    }

    await sleep(1200);
  }

  console.log("==========================================");
  console.log(`✅ Fixed:  ${fixed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total:    ${doctors.length}`);
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
};

fixDoctors().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});