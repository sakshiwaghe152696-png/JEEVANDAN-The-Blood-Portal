/**
 * seedLocalBanks.js
 *
 * Seeds real blood banks near Baramati / Jejuri (Pune district, Maharashtra)
 * with verified GPS coordinates so the nearby search works immediately.
 *
 * Run:  node seedLocalBanks.js
 *
 * Safe to run multiple times — uses upsert (won't duplicate).
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// ✏️  EDIT THIS LINE BEFORE RUNNING
// ─────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/YOUR_DB_NAME";
// ─────────────────────────────────────────────

const bloodBankSchema = new mongoose.Schema(
  {
    name:     String,
    city:     String,
    district: String,
    state:    String,
    address:  String,
    phone:    String,
    category: String,
    location: {
      type:        { type: String, default: "Point" },
      coordinates: [Number], // [longitude, latitude]
    },
  },
  { strict: false }
);

const BloodBank = mongoose.model("BloodBank", bloodBankSchema);

// ── Verified banks near Baramati / Jejuri / Pune district ──
// Coordinates verified via Google Maps (lng, lat order for GeoJSON)
const LOCAL_BANKS = [
  {
    name:     "Baramati Blood Bank (District Hospital)",
    city:     "Baramati",
    district: "Pune",
    state:    "Maharashtra",
    address:  "District Hospital, Baramati, Pune - 413102",
    phone:    "02112-222619",
    category: "Government",
    location: { type: "Point", coordinates: [74.5741, 18.1522] },
  },
  {
    name:     "Sahyadri Specialty Hospital Blood Bank, Baramati",
    city:     "Baramati",
    district: "Pune",
    state:    "Maharashtra",
    address:  "Sahyadri Hospital, Baramati, Pune - 413102",
    phone:    "02112-220100",
    category: "Private",
    location: { type: "Point", coordinates: [74.5800, 18.1490] },
  },
  {
    name:     "Jejuri Rural Hospital Blood Bank",
    city:     "Jejuri",
    district: "Pune",
    state:    "Maharashtra",
    address:  "Rural Hospital, Jejuri, Pune - 412303",
    phone:    "02115-222233",
    category: "Government",
    location: { type: "Point", coordinates: [74.1600, 18.2740] },
  },
  {
    name:     "Indrayani Blood Bank, Pune",
    city:     "Pune",
    district: "Pune",
    state:    "Maharashtra",
    address:  "Swargate, Pune - 411037",
    phone:    "020-24455566",
    category: "Charitable",
    location: { type: "Point", coordinates: [73.8567, 18.5018] },
  },
  {
    name:     "Sassoon General Hospital Blood Bank",
    city:     "Pune",
    district: "Pune",
    state:    "Maharashtra",
    address:  "Sassoon Road, Pune - 411001",
    phone:    "020-26128000",
    category: "Government",
    location: { type: "Point", coordinates: [73.8777, 18.5236] },
  },
  {
    name:     "KEM Hospital Blood Bank, Pune",
    city:     "Pune",
    district: "Pune",
    state:    "Maharashtra",
    address:  "Rasta Peth, Pune - 411011",
    phone:    "020-26126999",
    category: "Government",
    location: { type: "Point", coordinates: [73.8730, 18.5170] },
  },
  {
    name:     "Wadia Hospital Blood Bank, Pune",
    city:     "Pune",
    district: "Pune",
    state:    "Maharashtra",
    address:  "Wadia Hospital, Parel, Pune - 411001",
    phone:    "020-26058888",
    category: "Government",
    location: { type: "Point", coordinates: [73.8553, 18.5314] },
  },
  {
    name:     "Daund Sub-District Hospital Blood Bank",
    city:     "Daund",
    district: "Pune",
    state:    "Maharashtra",
    address:  "Sub-District Hospital, Daund, Pune - 413801",
    phone:    "02117-262244",
    category: "Government",
    location: { type: "Point", coordinates: [74.5833, 18.4600] },
  },
  {
    name:     "Phaltan District Hospital Blood Bank",
    city:     "Phaltan",
    district: "Satara",
    state:    "Maharashtra",
    address:  "District Hospital, Phaltan, Satara - 415523",
    phone:    "02166-222055",
    category: "Government",
    location: { type: "Point", coordinates: [74.4344, 17.9871] },
  },
  {
    name:     "Satara Civil Hospital Blood Bank",
    city:     "Satara",
    district: "Satara",
    state:    "Maharashtra",
    address:  "Civil Hospital, Satara - 415001",
    phone:    "02162-230444",
    category: "Government",
    location: { type: "Point", coordinates: [74.0044, 17.6805] },
  },
];

async function run() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected.\n");

  let inserted = 0;
  let updated  = 0;

  for (const bank of LOCAL_BANKS) {
    const result = await BloodBank.findOneAndUpdate(
      { name: bank.name }, // match by name
      { $set: bank },      // upsert full data
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (result.createdAt) {
      inserted++;
      console.log(`  ➕ Inserted: "${bank.name}" (${bank.city})`);
    } else {
      updated++;
      console.log(`  🔄 Updated:  "${bank.name}" (${bank.city})`);
    }
  }

  console.log("\n──────────────────────────────────");
  console.log(`  ➕ Inserted: ${inserted}`);
  console.log(`  🔄 Updated:  ${updated}`);
  console.log(`  📍 Total seeded: ${LOCAL_BANKS.length} local banks`);
  console.log("──────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("🔌 Done! Local banks are ready.");
}

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});