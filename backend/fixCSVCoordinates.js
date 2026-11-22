/**
 * fixCSVCoordinates2.js
 * ──────────────────────
 * Round 2 fix — targets the 1612 "not found" banks using
 * multiple fallback matching strategies:
 *
 *   Strategy 1: Exact name match (already done — skipped here)
 *   Strategy 2: Partial name match (first 20 chars)
 *   Strategy 3: City + Pincode match
 *   Strategy 4: City + partial name match
 *
 * Safe to re-run — only updates banks that still have NO coordinates
 * or have [0,0] coordinates.
 *
 * Usage:
 *   node fixCSVCoordinates2.js
 */

require("dotenv").config();
const mongoose  = require("mongoose");
const fs        = require("fs");
const path      = require("path");
const readline  = require("readline");

const BloodBank = require("./models/BloodBank");

const CSV_PATH = path.join(__dirname, "blood-banks.csv");

/* ── Parse CSV ── */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = null;

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      if (!line.trim()) return;

      const cols = [];
      let cur = "", inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
        cur += ch;
      }
      cols.push(cur.trim());

      if (!headers) {
        headers = cols.map((h) => h.replace(/^\uFEFF/, "").trim());
        return;
      }
      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });
      rows.push(row);
    });

    rl.on("close", () => resolve(rows));
    rl.on("error", reject);
  });
}

function getCol(row, ...candidates) {
  for (const key of Object.keys(row)) {
    if (candidates.some((c) => c.toLowerCase() === key.toLowerCase())) {
      return row[key]?.toString().trim() || null;
    }
  }
  return null;
}

/* ── Escape regex special chars ── */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ── Check if a bank already has valid coords ── */
function hasValidCoords(bank) {
  const coords = bank.location?.coordinates;
  if (!coords || coords.length < 2) return false;
  const [lng, lat] = coords;
  return lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng);
}

/* ── Main ── */
async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌  CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Connected.\n");

  // Load all DB banks that still need coordinates
  const dbBanks = await BloodBank.find().lean();
  const needsUpdate = dbBanks.filter((b) => !hasValidCoords(b));
  console.log(`📋  Banks needing coordinates: ${needsUpdate.length} / ${dbBanks.length}\n`);

  if (needsUpdate.length === 0) {
    console.log("✅  All banks already have coordinates. Nothing to do!");
    await mongoose.disconnect();
    return;
  }

  console.log(`📄  Reading ${CSV_PATH} ...`);
  const rows = await parseCSV(CSV_PATH);
  // Only keep CSV rows with valid coordinates
  const validRows = rows.filter((row) => {
    const lat = parseFloat(getCol(row, "Latitude", "latitude", "lat"));
    const lng = parseFloat(getCol(row, "Longitude", "longitude", "lng", "lon"));
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });
  console.log(`    ${validRows.length} CSV rows with valid coordinates\n`);

  let updated  = 0;
  let skipped  = 0;

  for (const bank of needsUpdate) {
    const bankName    = bank.name?.trim()    || "";
    const bankCity    = bank.city?.trim()    || "";
    const bankPincode = bank.pincode?.toString().trim() || "";

    let matchedRow = null;

    // ── Strategy 1: Partial name (first 25 chars) ──
    if (!matchedRow && bankName.length > 5) {
      const partial = bankName.substring(0, 25).toLowerCase();
      matchedRow = validRows.find((row) => {
        const csvName = getCol(row, "Blood Bank Name", "name") || "";
        return csvName.toLowerCase().includes(partial) ||
               partial.includes(csvName.toLowerCase().substring(0, 20));
      });
    }

    // ── Strategy 2: City + first word of name ──
    if (!matchedRow && bankCity && bankName) {
      const firstWord = bankName.split(" ")[0].toLowerCase();
      matchedRow = validRows.find((row) => {
        const csvCity = getCol(row, "City", "city", "District", "district") || "";
        const csvName = getCol(row, "Blood Bank Name", "name") || "";
        return csvCity.toLowerCase().includes(bankCity.toLowerCase()) &&
               csvName.toLowerCase().includes(firstWord);
      });
    }

    // ── Strategy 3: Pincode match (most reliable) ──
    if (!matchedRow && bankPincode && bankPincode.length === 6) {
      matchedRow = validRows.find((row) => {
        const csvPin = getCol(row, "Pincode", "pincode", "Pin Code") || "";
        return csvPin.replace(/\s/g, "") === bankPincode;
      });
    }

    // ── Strategy 4: City only (last resort — picks first bank in same city) ──
    if (!matchedRow && bankCity && bankCity.length > 3) {
      matchedRow = validRows.find((row) => {
        const csvCity = getCol(row, "City", "city", "District", "district") || "";
        return csvCity.toLowerCase().trim() === bankCity.toLowerCase().trim();
      });
    }

    if (!matchedRow) {
      skipped++;
      continue;
    }

    const lat = parseFloat(getCol(matchedRow, "Latitude", "latitude", "lat"));
    const lng = parseFloat(getCol(matchedRow, "Longitude", "longitude", "lng", "lon"));

    await BloodBank.findByIdAndUpdate(bank._id, {
      location: { type: "Point", coordinates: [lng, lat] }, // GeoJSON: [lng, lat]
    });

    updated++;
    if (updated % 50 === 0) console.log(`  ✔  ${updated} updated so far...`);
  }

  console.log("\n──────────────────────────────────────────");
  console.log(`✅  Updated   : ${updated} additional banks`);
  console.log(`⏭️   Skipped   : ${skipped} (no match found in CSV)`);
  console.log("──────────────────────────────────────────\n");

  // Final summary
  const stillMissing = await BloodBank.countDocuments({
    $or: [
      { "location.coordinates": { $exists: false } },
      { "location.coordinates": [0, 0] },
    ],
  });
  console.log(`📊  Banks still without coordinates: ${stillMissing}`);

  await mongoose.disconnect();
  console.log("🔌  Done!");
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});