require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const connectDB = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const superAdminRoutes = require("./routes/superAdmin.routes");
const doctorRoutes = require("./routes/doctor.routes");
const profileRoutes = require("./routes/profile.routes");
const donorRoutes = require("./routes/donorRoutes");
const bankAdminRoutes = require("./routes/bankAdmin.routes");
const userRoutes = require("./routes/user.routes");
const { checkEligibilityAndNotify } = require("./utils/checkDonationEligibility");
const donationRoutes = require("./routes/donationRoutes");

// ⏰ Run every day at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("Running eligibility check...");
  checkEligibilityAndNotify();
});


const app = express();

// ================= DATABASE CONNECTION =================
connectDB();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/bank-admin", bankAdminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/donation", donationRoutes);


// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("Jeevandan Backend is running 🚑");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(400).json({
    message: err.message || "Something went wrong",
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});