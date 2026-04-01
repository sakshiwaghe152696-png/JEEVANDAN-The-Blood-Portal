// Role-based access control middleware
// Used as: router.get("/path", auth, isDoctor, controller.method)

exports.isDoctor = (req, res, next) => {
  if (req.user && req.user.role === "DOCTOR") return next();
  return res.status(403).json({ message: "Access denied: Doctors only" });
};

exports.isBankAdmin = (req, res, next) => {
  if (req.user && req.user.role === "BANK_ADMIN") return next();
  return res.status(403).json({ message: "Access denied: Bank Admins only" });
};

exports.isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "SUPER_ADMIN") return next();
  return res.status(403).json({ message: "Access denied: Super Admins only" });
};

exports.isDonor = (req, res, next) => {
  if (req.user && req.user.role === "DONOR") return next();
  return res.status(403).json({ message: "Access denied: Donors only" });
};