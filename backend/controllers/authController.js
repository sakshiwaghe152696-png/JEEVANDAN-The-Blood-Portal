const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const emailNormalized = email.trim().toLowerCase();

    const user = await User.findOne({
      email: { $regex: `^${emailNormalized}$`, $options: "i" }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    

    // 🔥 FIXED
    if (!user.password) {
      return res.status(400).json({
        message: "User has no password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

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

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user._id,
        email: user.email,
        role: user.role,
        bankId: user.blood_bank_id || null,
        is_active: user.is_active 
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
// exports.getMyProfile = async (req, res) => {
//   try {
//     const userId = req.user.user_id;

//     const user = await User.findById(userId).select(
//       "_id email phone city role bankId"
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       user_id: user._id,
//       email: user.email,
//       phone: user.phone,
//       city: user.city,
//       role: user.role,
//       bankId: user.bankId || null
//     });

//   } catch (err) {
//     console.error("PROFILE ERROR:", err);
//     res.status(500).json({ message: "Failed to fetch profile" });
//   }
// };