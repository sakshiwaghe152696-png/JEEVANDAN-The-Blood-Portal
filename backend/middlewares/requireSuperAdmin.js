module.exports = function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Super Admin access only",
      yourRole: req.user.role,
    });
  }

  next();
};
