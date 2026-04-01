const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    console.log("LOGIN REQUEST:", req.body);

    let { email, password, role } = req.body;

    // 1️⃣ Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // 2️⃣ Normalize inputs
    const emailNormalized = email.trim().toLowerCase();
    const roleNormalized = role.trim().toUpperCase().replace(/\s+/g, "");

    console.log("EMAIL:", emailNormalized);
    console.log("ROLE:", roleNormalized);

    // 3️⃣ Find user (ONLY by email)
    const user = await User.findOne({
      email: { $regex: `^${emailNormalized}$`, $options: "i" }
    });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4️⃣ Role check (🔥 FIXED HERE)
    if (user.role !== roleNormalized) {
      return res.status(401).json({
        message: `Role mismatch (Expected: ${user.role}, Got: ${roleNormalized})`
      });
    }

    // 5️⃣ Check active
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    // 6️⃣ Password check
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 7️⃣ Generate token
    const token = jwt.sign(
  {
    user_id: user._id,
    role: user.role,
    bankId: user.blood_bank_id
      ? user.blood_bank_id.toString()
      : null
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
);

    // 8️⃣ Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
     user: {
  user_id: user._id,
  email: user.email,
  role: user.role,
  bankId: user.bankId || null
}
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// GET MY PROFILE
// ==============================
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findById(userId).select(
      "_id email phone city role bankId"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user_id: user._id,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      bankId: user.bankId || null
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};