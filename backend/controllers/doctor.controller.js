const BloodBank = require("../models/BloodBank");
const BloodStock = require("../models/BloodStock");
const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");

/* ===============================
   GET NEARBY BLOOD BANKS (Overpass API)
================================ */
exports.getNearbyBloodBanks = async (req, res) => {
  const { lat, lng, radius = 15000 } = req.query;

  // If no lat/lng provided, fall back to returning all DB banks
  if (!lat || !lng) {
    try {
      const banks = await BloodBank.find();
      return res.json({ success: true, source: "db", data: banks });
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch blood banks" });
    }
  }

  try {
    const radiusMeters = parseInt(radius);

    // Query Overpass API for blood banks nearby
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="blood_bank"](around:${radiusMeters},${lat},${lng});
        node["healthcare"="blood_bank"](around:${radiusMeters},${lat},${lng});
        node["healthcare"="blood_donation"](around:${radiusMeters},${lat},${lng});
        node["amenity"="hospital"]["blood_bank"="yes"](around:${radiusMeters},${lat},${lng});
      );
      out body;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const osmData = await response.json();

    // Format OSM results to match your existing frontend shape
    const osmBanks = osmData.elements.map((b) => ({
      _id: `osm_${b.id}`,           // prefix so frontend knows it's OSM
      name: b.tags?.name || "Blood Bank",
      city: b.tags?.["addr:city"] || b.tags?.["addr:district"] || "",
      phone: b.tags?.phone || b.tags?.["contact:phone"] || null,
      address: b.tags?.["addr:full"] || b.tags?.["addr:street"] || null,
      hours: b.tags?.opening_hours || null,
      source: "osm",
      location: {
        type: "Point",
        coordinates: [b.lon, b.lat],  // GeoJSON: [lng, lat]
      },
    }));

    return res.json({
      success: true,
      source: "osm",
      count: osmBanks.length,
      data: osmBanks,
    });

  } catch (err) {
    console.error("Overpass API failed, falling back to DB:", err.message);

    // Graceful fallback: if Overpass fails, return DB banks
    try {
      const banks = await BloodBank.find();
      return res.json({
        success: true,
        source: "db_fallback",
        count: banks.length,
        data: banks,
      });
    } catch (dbErr) {
      return res.status(500).json({ message: "Failed to fetch blood banks" });
    }
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
  res.json({ message: "createUser stub" });
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
    const doctorId = req.user.id;
    const { bankId } = req.params;

    // OSM banks (prefixed with "osm_") are not in DB — block request or handle gracefully
    if (bankId.startsWith("osm_")) {
      return res.status(400).json({
        message:
          "This blood bank is sourced from OpenStreetMap and is not registered in the system. Please contact them directly.",
      });
    }

    const request = await BloodRequest.create({
      doctor_id: doctorId,
      blood_bank_id: bankId,
      ...req.body,
    });

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
    const requests = await BloodRequest.find({
      doctor_id: req.user.id,
    });
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
    const request = await BloodRequest.findById(req.params.id).populate(
      "blood_bank_id"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    let stock = [];

    if (request.blood_bank_id) {
      stock = await BloodStock.find({
        bank_id: request.blood_bank_id._id,
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
    const notifications = await Notification.find({
      user_id: req.user.id,
    });
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
