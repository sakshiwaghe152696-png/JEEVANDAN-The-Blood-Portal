import mongoose from "mongoose";
import dotenv from "dotenv";
import BloodBank from "../models/BloodBank.js";
import BloodStock from "../models/BloodStock.js";

// ✅ Load env correctly
dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI;

const bloodGroups = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const components = ["WHOLE","RBC","PLASMA","PLATELETS"];

async function generateStock() {
  try {
    console.log("Connecting to DB...");

    if (!MONGO_URI) {
      throw new Error("❌ MONGO_URI not found in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // 🔥 STEP 1: DELETE OLD STOCK
    await BloodStock.deleteMany({});
    console.log("🗑 Old blood stock deleted");

    // 🔥 STEP 2: GET ALL BANKS
    const banks = await BloodBank.find();

    console.log(`🏥 Total banks found: ${banks.length}`);

    if (banks.length === 0) {
      console.log("❌ No blood banks found");
      process.exit();
    }

    // 🔥 STEP 3: PREPARE BULK DATA
    const stockData = [];

    for (const bank of banks) {
      for (const group of bloodGroups) {
        for (const component of components) {

          stockData.push({
            bank_id: bank._id,
            blood_group: group,
            component: component,
            units: Math.floor(Math.random() * 20) + 5,

            expiry_date: new Date(
              Date.now() +
              (component === "PLATELETS"
                ? 5
                : component === "RBC"
                ? 42
                : 365) * 24 * 60 * 60 * 1000
            )
          });

        }
      }
    }

    console.log(`📦 Inserting ${stockData.length} records...`);

    // 🔥 STEP 4: BULK INSERT (FAST)
    await BloodStock.insertMany(stockData);

    console.log("✅ Blood stock generated successfully");

    process.exit();

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

generateStock();