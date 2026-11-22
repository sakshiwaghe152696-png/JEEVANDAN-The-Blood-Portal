const BloodBank = require("../models/BloodBank");
const BloodStock = require("../models/BloodStock");
const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const DonorMedicalProfile = require("../models/DonorMedicalProfile");
const bcrypt = require("bcrypt"); // ✅ ADD THIS AT TOP
const { sendSMS } = require("../services/notification.service");

/* ===============================
   HAVERSINE DISTANCE HELPER (km)
================================ */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ===============================
   GET NEARBY BLOOD BANKS
   Smart DB-based algorithm:
   - Filter by radius (km)
   - Filter by blood group + available stock
   - Score = (distance * 0.6) - (units * 2)
   - Sort by score ascending (lowest = best)
================================ */
exports.getNearbyBloodBanks = async (req, res) => {
  const { lat, lng, radius = 15, bloodGroup } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "lat and lng are required." });
  }

  const userLat  = parseFloat(lat);
  const userLng  = parseFloat(lng);
  const radiusKm = parseFloat(radius);

  try {
    // ── 1. Fetch all banks from DB ──
    const allBanks = await BloodBank.find().lean();

    if (!allBanks.length) {
      return res.json({ success: true, source: "smart", count: 0, data: [] });
    }

    // ── 2. Filter to banks within radius ──
    const banksInRadius = allBanks
      .map((bank) => {
        const bankLng = bank.location?.coordinates?.[0];
        const bankLat = bank.location?.coordinates?.[1];
        if (bankLat == null || bankLng == null) return null;

        const distance = haversineDistance(userLat, userLng, bankLat, bankLng);
        if (distance > radiusKm) return null;

        return { ...bank, distance: parseFloat(distance.toFixed(2)) };
      })
      .filter(Boolean);

    if (!banksInRadius.length) {
      return res.json({ success: true, source: "smart", count: 0, data: [] });
    }

    // ── 3. If bloodGroup provided, fetch stock and score ──
    if (bloodGroup) {
      const bankIds = banksInRadius.map((b) => b._id);

      const stockRecords = await BloodStock.find({
        bank_id:     { $in: bankIds },
        blood_group: bloodGroup,
        units:       { $gt: 0 },
      }).lean();

      // Aggregate total units per bank
      const stockMap = {};
      for (const record of stockRecords) {
        const key = record.bank_id.toString();
        stockMap[key] = (stockMap[key] || 0) + record.units;
      }

      // Score, filter out zero-stock banks, sort
      const scoredBanks = banksInRadius
        .map((bank) => {
          const units = stockMap[bank._id.toString()] || 0;
          if (units === 0) return null;

          const score = parseFloat((bank.distance * 0.6 - units * 2).toFixed(4));

          return {
            _id:      bank._id,
            name:     bank.name,
            city:     bank.city    || "",
            phone:    bank.phone   || null,
            address:  bank.address || null,
            hours:    bank.hours   || null,
            location: bank.location,
            source:   "smart",
            distance: bank.distance,
            units,
            score,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.score - b.score);

      return res.json({
        success: true,
        source:  "smart",
        count:   scoredBanks.length,
        data:    scoredBanks,
      });
    }

    // ── 4. No bloodGroup — return all in-radius banks sorted by distance ──
    const sorted = banksInRadius
      .map((bank) => ({
        _id:      bank._id,
        name:     bank.name,
        city:     bank.city    || "",
        phone:    bank.phone   || null,
        address:  bank.address || null,
        hours:    bank.hours   || null,
        location: bank.location,
        source:   "db",
        distance: bank.distance,
        units:    null,
        score:    null,
      }))
      .sort((a, b) => a.distance - b.distance);

    return res.json({
      success: true,
      source:  "db",
      count:   sorted.length,
      data:    sorted,
    });

  } catch (err) {
    console.error("getNearbyBloodBanks error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch blood banks." });
  }
};

/* ===============================
   GET MAP DATA
================================ */
exports.getMapData = async (req, res) => {
  try {
    const banks = await BloodBank.find();
    res.json(banks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch map data" });
  }
};

/* ===============================
   GET DOCTOR PROFILE
================================ */
exports.getDoctorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ===============================
   CREATE USER
================================ */


exports.createUser = async (req, res) => {
  try {
    const {
      user_type,
      full_name,
      email,
      phone,
      city,
      gender,
      date_of_birth,
      age,
      address,

      // donor fields
      blood_group,
      weight,
      last_donation_date,
      hemoglobin,   // ✅ ADD


      // medical
      has_diabetes,
      has_bp,
      heart_disease,
      hepatitis_history,
      recent_surgery,
      taking_medication
    } = req.body;

    // 🔥 HASH PASSWORD (use phone as default password)
    const hashedPassword = await bcrypt.hash(phone, 10);

    // ✅ CREATE USER (FIXED)
    const user = await User.create({
      email,
      phone,
      password: hashedPassword, // ✅ THIS WAS MISSING
      city,
      role: "USER",
      profile: {
        full_name,
        gender,
        date_of_birth,
        age,
        address
      }
    });

    // ✅ IF DONOR → CREATE PROFILE
    if (user_type === "DONOR") {

      const toBool = (val) => val === "YES";

      await DonorMedicalProfile.create({
        donor_id: user._id,
        blood_group,
        weight,
        last_donation_date,
        hemoglobin: hemoglobin ? Number(hemoglobin) : null,
        has_diabetes: toBool(has_diabetes),
        has_bp: toBool(has_bp),
        heart_disease: toBool(heart_disease),
        hepatitis_history: toBool(hepatitis_history),
        recent_surgery: toBool(recent_surgery),
        taking_medication: toBool(taking_medication),

        age
      });
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user
    });

  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GET BLOOD STOCK
================================ */
exports.getBloodStock = async (req, res) => {
  try {
    const stock = await BloodStock.find({ bank_id: req.params.bankId });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blood stock" });
  }
};

/* ===============================
   CREATE BLOOD REQUEST
================================ */
exports.createBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.create({
      doctor_id:     req.user.id,
      blood_bank_id: req.params.bankId,
      ...req.body,
    });

    const bankAdmin = await User.findOne({
      blood_bank_id: req.params.bankId,
      role: "BANK_ADMIN"
    });

    // ✅ CREATE NOTIFICATION FOR ADMIN
    if (bankAdmin) {
      await Notification.create({
        user_id: bankAdmin._id,
        title: "🩸 New Blood Request",
        message: `New request for ${request.blood_group} (${request.units} units) from doctor.`,
        type: "NEW_REQUEST",
        reference_id: request._id.toString(),
        priority: request.urgency === "Emergency" ? "CRITICAL" : "HIGH",
        channel: "DASHBOARD"
      });
    }
    res.json({ message: "Request created", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create request" });
  }
};

/* ===============================
   GET MY REQUESTS
================================ */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ doctor_id: req.user.id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/* ===============================
   GET REQUEST BY ID
================================ */
exports.getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate("blood_bank_id");
    if (!request) return res.status(404).json({ message: "Request not found" });

    let stock = [];
    if (request.blood_bank_id) {
      stock = await BloodStock.find({
        bank_id:     request.blood_bank_id._id,
        blood_group: request.blood_group,
      });
    }

    res.json({ request, stock });
  } catch (err) {
    console.error("GET REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to fetch request" });
  }
};

/* ===============================
   GET NOTIFICATIONS
================================ */
exports.getNotifications = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);

    const notifications = await Notification.find({
      user_id: req.user.user_id   // ✅ FIX HERE
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/* ===============================
   MARK NOTIFICATION READ
================================ */
exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};
/* ===============================
   GET ALL DONORS (NEW 🔥)
================================ */
exports.getAllDonors = async (req, res) => {
  try {
    const doctorId = req.user.user_id;

    const doctor = await User.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const users = await User.find({
      role: "USER",
      city: doctor.city
    }).lean();

    const donors = await Promise.all(
      users.map(async (user) => {
        const medical = await DonorMedicalProfile.findOne({
          donor_id: user._id
        });

        return {
          _id: user._id,
          name: user.profile?.full_name || "N/A",
          email: user.email,
          phone: user.phone || "N/A", // ✅ ADDED
          city: user.city,

          // ✅ FIXED (IMPORTANT)
          last_donation_date: medical?.last_donation_date || null,
          availability_status: user.availability_status || "ACTIVE",
          blood_group: medical?.blood_group || "N/A"
        };
      })
    );

    res.json({
      success: true,
      doctor_city: doctor.city,
      count: donors.length,
      data: donors
    });

  } catch (err) {
    console.error("GET DONORS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donors"
    });
  }
};

exports.getBestDonors = async (req, res) => {
  try {
    const { bloodGroup } = req.query;

    const doctor = await User.findById(req.user.user_id);

    console.log("Doctor city:", doctor.city);

    // ✅ BLOOD COMPATIBILITY MAP
    console.log("Received bloodGroup:", bloodGroup);
console.log("Type:", typeof bloodGroup);
    const compatibility = {
      "A+": ["A+", "A-", "O+", "O-"],
      "A-": ["A-", "O-"],
      "B+": ["B+", "B-", "O+", "O-"],
      "B-": ["B-", "O-"],
      "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "AB-": ["A-", "B-", "AB-", "O-"],
      "O+": ["O+", "O-"],
      "O-": ["O-"]
    };

    const compatibleGroups = compatibility[bloodGroup] || [];
    console.log("Compatible Groups:", compatibleGroups);

    // ✅ CITY MATCH FIX
    const users = await User.find({
      role: "USER",
      availability_status: "ACTIVE",
      city: { $regex: new RegExp(`^${doctor.city.trim()}$`, "i") }
    }).lean();
    console.log("Doctor city:", doctor.city);
console.log("Total users found:", users.length);

users.forEach(u => {
  console.log(
    "User:",
    u.profile?.full_name,
    "| City:",
    u.city,
    "| Status:",
    u.availability_status
  );
});
    console.log("Total users:", users.length);

    const validDonors = [];

    for (let user of users) {
      const medical = await DonorMedicalProfile.findOne({
        donor_id: user._id
      });

      if (!medical) {
        console.log("❌ No medical:", user.profile?.full_name);
        continue;
      }

      // ✅ BLOOD COMPATIBILITY CHECK
      if (!compatibleGroups.includes(medical.blood_group)) {
        console.log("❌ Not compatible:", medical.blood_group);
        continue;
      }

      // ✅ AGE & WEIGHT (relaxed)
      if (medical.age && (medical.age < 18 || medical.age > 65)) {
        console.log("❌ Age fail");
        continue;
      }

      if (medical.weight && medical.weight < 50) {
        console.log("❌ Weight fail");
        continue;
      }

      // ✅ HEMOGLOBIN
      if (medical.hemoglobin && medical.hemoglobin < 12.5) {
        console.log("❌ Low Hb");
        continue;
      }

      // ✅ DATE LOGIC
      let days = 999;

      if (medical.last_donation_date) {
        const donationDate = new Date(medical.last_donation_date);

        if (!isNaN(donationDate.getTime())) {
          const diff =
            (Date.now() - donationDate.getTime()) /
            (1000 * 60 * 60 * 24);

          if (diff >= 0) {
            days = diff;

            if (days < 90) {
              console.log("❌ Recent donation");
              continue;
            }
          }
        }
      }

      console.log("✅ Valid:", user.profile?.full_name);

      validDonors.push({
        user,
        medical,
        days,
        distance: Math.random() * 10,
        age: medical.age || 25,
        weight: medical.weight || 60
      });
    }

    console.log("Final valid donors:", validDonors.length);

    // ✅ SINGLE DONOR CASE
    if (validDonors.length === 1) {
      const d = validDonors[0];

      return res.json({
        success: true,
        data: [{
           _id: d.user._id,
          name: d.user.profile?.full_name,
          phone: d.user.phone,
          city: d.user.city,
          blood_group: d.medical.blood_group,
          hemoglobin: d.medical.hemoglobin,
          last_donation_date: d.medical.last_donation_date,
          score: 1,
          rank: 1
        }]
      });
    }

    // ❌ NO DONORS
    if (validDonors.length === 0) {
      return res.json({
        success: true,
        message: "No eligible donors found",
        data: []
      });
    }

    // ================= TOPSIS =================

    const weights = {
      distance: 0.3,
      days: 0.4,
      age: 0.2,
      weight: 0.1
    };

    const normalize = (arr, key) => {
      const sum = Math.sqrt(arr.reduce((a, b) => a + b[key] ** 2, 0));
      return arr.map(d => ({
        ...d,
        [key]: sum === 0 ? 1 : d[key] / sum
      }));
    };

    let data = [...validDonors];

    data = normalize(data, "distance");
    data = normalize(data, "days");
    data = normalize(data, "age");
    data = normalize(data, "weight");

    data = data.map(d => ({
      ...d,
      distance: d.distance * weights.distance,
      days: d.days * weights.days,
      age: d.age * weights.age,
      weight: d.weight * weights.weight
    }));

    const best = {
      distance: Math.min(...data.map(d => d.distance)),
      days: Math.max(...data.map(d => d.days)),
      age: Math.max(...data.map(d => d.age)),
      weight: Math.max(...data.map(d => d.weight))
    };

    const worst = {
      distance: Math.max(...data.map(d => d.distance)),
      days: Math.min(...data.map(d => d.days)),
      age: Math.min(...data.map(d => d.age)),
      weight: Math.min(...data.map(d => d.weight))
    };

    const results = data.map(d => {
      const dPlus = Math.sqrt(
        (d.distance - best.distance) ** 2 +
        (d.days - best.days) ** 2 +
        (d.age - best.age) ** 2 +
        (d.weight - best.weight) ** 2
      );

      const dMinus = Math.sqrt(
        (d.distance - worst.distance) ** 2 +
        (d.days - worst.days) ** 2 +
        (d.age - worst.age) ** 2 +
        (d.weight - worst.weight) ** 2
      );

      const score = dPlus + dMinus === 0 ? 1 : dMinus / (dPlus + dMinus);

      return {
         _id: d.user._id,
        name: d.user.profile?.full_name,
        phone: d.user.phone,
        city: d.user.city,
        blood_group: d.medical.blood_group,
        hemoglobin: d.medical.hemoglobin,
        last_donation_date: d.medical.last_donation_date,
        score
      };
    });

    results.sort((a, b) => b.score - a.score);

    const top5 = results.slice(0, 5).map((d, i) => ({
      ...d,
      rank: i + 1
    }));

    res.json({ success: true, data: top5 });

  } catch (err) {
    console.error("TOPSIS ERROR:", err);
    res.status(500).json({ message: "Error in TOPSIS" });
  }
};
exports.notifyDonor = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the donor (User)
    const donor = await User.findById(userId);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

   const message = `🚨 Jeevandan



🏥 City Hospital, Baramati

📍 https://maps.google.com/?q=18.1512,74.5773

Call ASAP.`;
    await sendSMS(
      donor._id,
      donor.phone,
      message
    );

    return res.json({
      success: true,
      message: "SMS sent successfully."
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};