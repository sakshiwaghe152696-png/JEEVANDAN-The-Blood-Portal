const bcrypt = require("bcryptjs");
const User = require("../models/User");
const BloodBank = require("../models/BloodBank");
const geocode = require("../utils/geocode");

/* ============================
   CREATE DOCTOR
============================ */
exports.createDoctor = async (req, res) => {
  try {
    const { name, email, phone, password, city, degree } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let latitude = 17.9689;
    let longitude = 74.4311;

    try {
      const coords = await geocode(null, city);
      latitude = coords.latitude;
      longitude = coords.longitude;
    } catch (geoErr) {
      console.warn("Geocoding failed for doctor, using default coordinates:", geoErr.message);
    }

    const doctor = await User.create({
      email,
      phone,
      password: hashedPassword,
      role: "DOCTOR",
      city,
      created_by: req.user.user_id,
      profile: {
        full_name: name,
        degree,
        latitude,
        longitude
      }
    });

    res.status(201).json({
      message: "Doctor created successfully",
      user_id: doctor._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create doctor" });
  }
};


/* ============================
   CREATE BANK ADMIN + BLOOD BANK
============================ */
exports.createBankAdminWithBloodBank = async (req, res) => {
  try {
    const { admin, bank } = req.body;

    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const adminUser = await User.create({
      email: admin.email,
      phone: admin.phone,
      password: hashedPassword,
      role: "BANK_ADMIN",
      city: admin.city,
      created_by: req.user.user_id,
      profile: {
        full_name: admin.name
      }
    });

    let latitude = 17.9689;
    let longitude = 74.4311;

    try {
      const coords = await geocode(bank.address, bank.city);
      latitude = coords.latitude;
      longitude = coords.longitude;
    } catch (geoErr) {
      console.warn("Geocoding failed for blood bank, using default coordinates:", geoErr.message);
    }

    await BloodBank.create({
      name: bank.name,
      address: bank.address,
      city: bank.city,
      state: "Maharashtra",
      contact_number: bank.contact,
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      created_by: adminUser._id
    });

    res.status(201).json({
      message: "Blood Bank & Admin created successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create bank admin" });
  }
};


/* ============================
   DASHBOARD STATS
============================ */
exports.getDashboardStats = async (req, res) => {
  try {
    const bloodBanks = await BloodBank.countDocuments();
    const doctors = await User.countDocuments({ role: "DOCTOR" });
    const bankAdmins = await User.countDocuments({ role: "BANK_ADMIN" });
    const donors = await User.countDocuments({ role: "USER" });

    res.json({ bloodBanks, doctors, bankAdmins, donors });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};


/* ============================
   GET BLOOD BANKS
============================ */
exports.getBloodBanks = async (req, res) => {
  try {
    const banks = await BloodBank.find().populate("created_by");

    const result = banks.map(bank => ({
      bank_id: bank._id.toString(),           // ✅ Added for future edit/delete
      name: bank.name,
      city: bank.city,
      admin_name: bank.created_by?.profile?.full_name,
      admin_email: bank.created_by?.email,
      contact_number: bank.contact_number
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch blood banks" });
  }
};


/* ============================
   GET BANK ADMINS
============================ */
exports.getBankAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "BANK_ADMIN" });

    const result = [];

    for (const admin of admins) {
      const bank = await BloodBank.findOne({ created_by: admin._id });
      result.push({
        user_id: admin._id.toString(),        // ✅ FIXED — was missing, caused /undefined
        name: admin.profile?.full_name,
        email: admin.email,
        city: admin.city,
        bank_name: bank?.name || null
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bank admins" });
  }
};


/* ============================
   GET DOCTORS
============================ */
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "DOCTOR" });

    const result = doctors.map(doc => ({
      user_id: doc._id.toString(),            // ✅ .toString() ensures clean string ID
      name: doc.profile?.full_name,
      degree: doc.profile?.degree,
      email: doc.email,
      phone: doc.phone,
      city: doc.city
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};


/* ============================
   UPDATE DOCTOR
============================ */
exports.updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { name, email, phone, city, degree } = req.body;

    const doctor = await User.findById(doctorId);

    // ✅ Guard against null
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.email = email;
    doctor.phone = phone;
    doctor.city = city;

    if (!doctor.profile) doctor.profile = {};

    doctor.profile.full_name = name;
    doctor.profile.degree = degree;

    await doctor.save();

    res.json({ message: "Doctor updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update doctor" });
  }
};


/* ============================
   DELETE DOCTOR
============================ */
exports.deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    await User.findByIdAndUpdate(doctorId, { is_active: false });

    res.json({ message: "Doctor deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete doctor" });
  }
};


/* ============================
   UPDATE BANK ADMIN
============================ */
exports.updateBankAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { name, email, phone, city } = req.body;

    const admin = await User.findById(adminId);

    // ✅ Guard against null
    if (!admin) {
      return res.status(404).json({ message: "Bank admin not found" });
    }

    admin.email = email;
    admin.phone = phone;
    admin.city = city;

    if (!admin.profile) admin.profile = {};

    admin.profile.full_name = name;

    await admin.save();

    res.json({ message: "Bank admin updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update bank admin" });
  }
};


/* ============================
   DELETE BANK ADMIN
============================ */
exports.deleteBankAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    await User.findByIdAndUpdate(adminId, { is_active: false });

    res.json({ message: "Bank admin deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete bank admin" });
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    const donorId = req.params.id;

    const donor = await User.findById(donorId);

    if (!donor || donor.role !== "USER") {
      return res.status(404).json({ message: "Donor not found" });
    }

    await User.findByIdAndUpdate(donorId, { is_active: false });

    res.json({ message: "Donor deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete donor" });
  }
};

