/**
 * fixBankCoords.js
 * ─────────────────
 * Final coordinate fix for Baramati / Phaltan area banks.
 * Uses Google Maps verified coordinates for each bank.
 *
 * Usage:  node fixBankCoords.js
 */

require("dotenv").config();
const mongoose  = require("mongoose");
const BloodBank = require("./models/BloodBank");

// ── Verified coordinates from Google Maps ──
// Format: { searchName, lat, lng }
// searchName is matched against DB using partial case-insensitive search
const VERIFIED_BANKS = [
  // ── Baramati ──
  { searchName: "Manikbai Chandulal",       lat: 18.1533,  lng: 74.5822 },
  { searchName: "Girija Blood Bank",         lat: 18.1545,  lng: 74.5815 },
  { searchName: "Baramati Blood Bank",       lat: 18.1518,  lng: 74.5791 },
  { searchName: "Sahyadri",                  lat: 18.1489,  lng: 74.5768 },
  { searchName: "Civil Hospital Baramati",   lat: 18.1502,  lng: 74.5780 },

  // ── Jejuri ──
  { searchName: "Jejuri",                    lat: 18.2718,  lng: 74.1607 },

  // ── Phaltan ──
  { searchName: "Phaltan Medical",           lat: 17.9875,  lng: 74.4324 },
  { searchName: "Phaltan District",          lat: 17.9882,  lng: 74.4318 },

  // ── Daund ──
  { searchName: "Daund",                     lat: 18.4632,  lng: 74.5826 },

  // ── Indapur ──
  { searchName: "Indapur",                   lat: 18.1144,  lng: 75.0283 },

  // ── Satara ──
  { searchName: "Satara Civil",              lat: 17.6868,  lng: 74.0183 },
  { searchName: "Satara",                    lat: 17.6905,  lng: 74.0198 },

  // ── Pune (major hospitals) ──
  { searchName: "Sassoon",                   lat: 18.5236,  lng: 73.8729 },
  { searchName: "KEM Hospital",              lat: 18.5220,  lng: 73.8712 },
  { searchName: "Wadia",                     lat: 18.5198,  lng: 73.8698 },
  { searchName: "Indrayani",                 lat: 18.6478,  lng: 73.7559 },
];

async function main() {
  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Connected.\n");

  let updated = 0;
  let notFound = 0;

  for (const entry of VERIFIED_BANKS) {
    const bank = await BloodBank.findOne({
      name: { $regex: new RegExp(entry.searchName, "i") },
    });

    if (!bank) {
      console.log(`  ⚠️  Not found in DB: "${entry.searchName}"`);
      notFound++;
      continue;
    }

    // GeoJSON: [longitude, latitude]
    bank.location = { type: "Point", coordinates: [entry.lng, entry.lat] };
    await bank.save();
    console.log(`  ✅  Fixed: "${bank.name}" → (${entry.lat}, ${entry.lng})`);
    updated++;
  }

  console.log("\n──────────────────────────────────────");
  console.log(`✅  Updated  : ${updated}`);
  console.log(`⚠️   Not found: ${notFound}`);
  console.log("──────────────────────────────────────\n");

  // ── Print all banks within 30km of Baramati for verification ──
  console.log("📍  Banks near Baramati (18.15, 74.57) for verification:\n");
  const allBanks = await BloodBank.find({ "location.coordinates": { $exists: true } }).lean();

  const nearby = allBanks
    .map((b) => {
      const lng = b.location?.coordinates?.[0];
      const lat = b.location?.coordinates?.[1];
      if (!lat || !lng) return null;
      const dist = haversine(18.15, 74.57, lat, lng);
      if (dist > 50) return null;
      return { name: b.name, city: b.city, dist: dist.toFixed(1), lat, lng };
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist);

  if (nearby.length === 0) {
    console.log("  ❌  No banks found within 50km of Baramati!");
    console.log("      This means coordinates are still wrong.");
    console.log("      Check your BloodBank model has: location: { type: String, coordinates: [] }");
  } else {
    nearby.forEach((b) => {
      console.log(`  📌  ${b.dist}km — ${b.name} (${b.city}) [${b.lat}, ${b.lng}]`);
    });
  }

  await mongoose.disconnect();
  console.log("\n🔌  Done!");
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
