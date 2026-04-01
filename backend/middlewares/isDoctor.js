export default function isDoctor(req, res, next) {
  if (req.user.role !== "DOCTOR") {
    return res.status(403).json({ message: "Doctor only access" });
  }
  next();
}