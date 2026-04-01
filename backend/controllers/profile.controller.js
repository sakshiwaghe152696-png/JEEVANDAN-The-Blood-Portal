const User = require("../models/User");
const pwd = require("../utils/password");
const geocode = require("../utils/geocode");

/* ===============================
   GET MY PROFILE
================================ */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = {
      email: user.email,
      phone: user.phone,
      city: user.city,
      full_name: user.profile?.full_name,
      degree: user.profile?.degree,
      latitude: user.profile?.latitude,
      longitude: user.profile?.longitude,
      photo: user.profile?.photo
        ? `${process.env.BASE_URL}/uploads/${user.profile.photo}`
        : null
    };

    res.json(profile);

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Profile fetch failed" });
  }
};


/* ===============================
   UPDATE PROFILE
================================ */
exports.updateMyProfile = async (req, res) => {
  try {

    const userId = req.user.user_id;
    const { full_name, phone, degree, city } = req.body; // ✅ added city

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.phone = phone;

    if (!user.profile) user.profile = {};

    user.profile.full_name = full_name;
    user.profile.degree = degree;

    // ✅ Update city + re-geocode if city changed
    if (city && city !== user.city) {
      user.city = city;

      try {
        const coords = await geocode(null, city);
        user.profile.latitude = coords.latitude;
        user.profile.longitude = coords.longitude;
        console.log(`Geocoded ${city}: [${coords.latitude}, ${coords.longitude}]`);
      } catch (geoErr) {
        console.warn("Geocoding failed during profile update:", geoErr.message);
        // Keep old coordinates if geocoding fails
      }
    }

    await user.save();

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};


/* ===============================
   UPLOAD PROFILE PHOTO
================================ */
exports.uploadPhoto = async (req, res) => {
  try {

    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const photo = req.file.filename;

    const user = await User.findById(userId);

    if (!user.profile) user.profile = {};

    user.profile.photo = photo;

    await user.save();

    res.json({
      message: "Photo uploaded successfully",
      photo: `${process.env.BASE_URL}/uploads/${photo}`,
    });

  } catch (err) {
    console.error("UPLOAD PHOTO ERROR:", err);
    res.status(500).json({ message: "Photo upload failed" });
  }
};


/* ===============================
   CHANGE PASSWORD
================================ */
exports.changePassword = async (req, res) => {
  try {

    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await pwd.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong old password" });
    }

    const hashed = await pwd.hash(newPassword);

    user.password = hashed;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password update failed" });
  }
};