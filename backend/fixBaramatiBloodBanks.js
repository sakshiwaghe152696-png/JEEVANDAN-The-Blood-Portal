/**
 * fixBaramatiBloodBanks.js
 *
 * Fixes coordinates for blood banks whose BANK_ADMIN
 * has undefined lat/lng — re-geocodes by city.
 *
 * Usage: node fixBaramatiBloodBanks.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("./models/User");
const BloodBank = require("./models/BloodBank");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const geocodeCity = async (city) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Maharashtra, India")}&format=json&limit=1`;
  const response = await axios.get(url, {
    headers: { "User-Agent": "Jeevandan-BloodManagement/1.0 (jeevandan@gmail.com)" },
    timeout: 10000,
  });
  if (!response.data || response.data.length === 0) throw new Error(`No results for: ${city}`);
  return {
    latitude: parseFloat(response.data[0].lat),
    longitude: parseFloat(response.data[0].lon),
  };
};

const fix = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  // Find all BloodBanks with missing or default coordinates
  const banks = await BloodBank.find();
  console.log(`Found ${banks.length} total blood banks\n`);

  let fixed = 0;
  let failed = 0;

  for (const bank of banks) {
    const [lng, lat] = bank.location?.coordinates || [0, 0];

    // Check if coordinates are missing or still default (17.9689, 74.4311)
    const isDefault = (lat === 17.9689 && lng === 74.4311) || (!lat && !lng);
    const isMissing = !bank.location?.coordinates?.length;

    if (!isDefault && !isMissing) continue; // already has good coordinates

    try {
      const city = bank.city;
      if (!city || city.toLowerCase() === "unknown") {
        console.warn(`⏭️  Skipped: ${bank.name} — unknown city`);
        continue;
      }

      console.log(`Fixing: ${bank.name} (${city})`);

      const { latitude, longitude } = await geocodeCity(city);

      bank.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      await bank.save();
      console.log(`  ✅ Fixed: [${longitude}, ${latitude}]\n`);
      fixed++;

      await sleep(1200);

    } catch (err) {
      console.warn(`  ❌ Failed: ${err.message}\n`);
      failed++;
    }
  }

  console.log("==========================================");
  console.log(`✅ Fixed:  ${fixed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
};

fix().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});