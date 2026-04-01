const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const profileController = require("../controllers/profile.controller");

/* ===============================
   GET MY PROFILE
   GET /api/profile/me
================================ */
router.get("/me", auth, profileController.getMyProfile);

/* ===============================
   UPDATE PROFILE
   PUT /api/profile/me
================================ */
router.put("/me", auth, profileController.updateMyProfile);

/* ===============================
   UPLOAD PROFILE PHOTO
   POST /api/profile/photo
================================ */
router.post(
  "/photo",
  auth,
  (req, res, next) => {
    upload.single("photo")(req, res, function (err) {
      if (err) {
        // ✅ Multer errors (file too large, invalid type)
        return res.status(400).json({
          message: err.message || "Image upload failed",
        });
      }
      next();
    });
  },
  profileController.uploadPhoto
);

/* ===============================
   CHANGE PASSWORD
   PUT /api/profile/password
================================ */
router.put(
  "/password",
  auth,
  profileController.changePassword
);

module.exports = router;