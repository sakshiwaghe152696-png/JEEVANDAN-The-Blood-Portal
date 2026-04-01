const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("../models/User");
const BloodBank = require("../models/BloodBank");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const SUPER_ADMIN_ID = new mongoose.Types.ObjectId(
  "69b7a3d6ffe22ca8024ad295"
);

async function importBanks() {

  const results = [];

  fs.createReadStream("blood-banks.csv")
    .pipe(csv())
    .on("data", (row) => {

      const state = (row[" State"] || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      if (state === "maharashtra") {
        results.push(row);
      }

    })
    .on("end", async () => {

      console.log(`Found ${results.length} Maharashtra blood banks`);

      for (const bank of results) {

        try {

          const bankName = bank[" Blood Bank Name"]?.trim();
          if (!bankName) continue;

          const city = bank[" City"]?.trim() || "Unknown";
          const district = bank[" District"]?.trim() || null;
          const address = bank[" Address"]?.trim() || null;
          const phone = bank[" Contact No"]?.trim() || null;

          const lat = parseFloat(bank[" Latitude"]);
          const lng = parseFloat(bank[" Longitude"]);

          const email =
            bankName
              .replace(/[^a-zA-Z0-9]/g, "")
              .toLowerCase()
              .slice(0, 20) + "@bank.com";

          const hashedPassword = await bcrypt.hash("Bank@123", 10);

          // Create Bank Admin
          const admin = await User.create({
            email,
            phone,
            password: hashedPassword,
            role: "BANK_ADMIN",
            city,
            created_by: SUPER_ADMIN_ID
          });

          // Create Blood Bank
          await BloodBank.create({

            name: bankName,
            address,
            city,
            district,
            state: "Maharashtra",
            contact_number: phone,

            location: {
              type: "Point",
              coordinates: [lng, lat]   // IMPORTANT: [longitude, latitude]
            },

            created_by: SUPER_ADMIN_ID
          });

          console.log(`Inserted: ${bankName}`);

        } catch (err) {

          console.error("Error inserting bank:", err.message);

        }

      }

      console.log("Import completed successfully");

      process.exit();

    });
}

importBanks();