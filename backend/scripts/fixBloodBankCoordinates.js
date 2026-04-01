require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const axios = require("axios");
const BloodBank = require("../models/BloodBank");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const geocode = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Jeevandan-App/1.0"
    },
    timeout: 10000
  });

  if (!res.data || res.data.length === 0) return null;

  return {
    lat: parseFloat(res.data[0].lat),
    lng: parseFloat(res.data[0].lon)
  };
};

const fixCoordinates = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to DB\n");

  const banks = await BloodBank.find();
  console.log(`🔍 Found ${banks.length} banks\n`);

  let fixed = 0, failed = 0;

  for (const bank of banks) {
    try {
      console.log(`➡️ Processing: ${bank.name}`);

      let result = null;

      // 🔥 1. Try full address
      if (bank.address) {
        await sleep(1200);
        result = await geocode(`${bank.address}, ${bank.city}, Maharashtra, India`);
      }

      // 🔥 2. Try name + city
      if (!result) {
        await sleep(1200);
        result = await geocode(`${bank.name}, ${bank.city}, Maharashtra, India`);
      }

      // 🔥 3. Try city (LAST fallback but safe)
      if (!result && bank.city) {
        await sleep(1200);
        result = await geocode(`${bank.city}, Maharashtra, India`);
      }

      if (!result) {
        console.log("❌ Still not found\n");
        failed++;
        continue;
      }

      bank.location = {
        type: "Point",
        coordinates: [result.lng, result.lat]
      };

      await bank.save();

      console.log(`✅ Updated → ${result.lat}, ${result.lng}\n`);
      fixed++;

    } catch (err) {
      console.log(`❌ Error: ${err.message}\n`);
      failed++;
    }
  }

  console.log("==================================");
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("==================================");

  process.exit();
};

fixCoordinates();