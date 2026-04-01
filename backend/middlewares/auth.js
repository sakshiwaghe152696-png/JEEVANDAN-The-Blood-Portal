const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({
        message: "Authorization token required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FETCH FULL USER FROM DB
    const user = await User.findById(decoded.user_id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ ATTACH CORRECT DATA
    req.user = {
      id: user._id,
      role: user.role,
      bankId: user.blood_bank_id   // 🔥 ALWAYS CORRECT
    };

    next();

  } catch (err) {
    console.error("Auth error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};