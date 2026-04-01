const User = require("../models/User");
const DonorMedicalProfile = require("../models/DonorMedicalProfile");

/* ============================
   GET ALL DONORS
============================ */
exports.getAllDonors = async (req, res) => {
  try {

    const donors = await DonorMedicalProfile.find();

    const donorList = [];

    for (const donor of donors) {

      const user = await User.findById(donor.donor_id);

      if (!user) continue;

      donorList.push({
        user_id: user._id.toString(), // ✅ FIXED — string so delete/edit works
        email: user.email,
        phone: user.phone,
        city: user.city,

        full_name: user.profile?.full_name,
        gender: user.profile?.gender,

        blood_group: donor.blood_group,
        age: donor.age
      });

    }

    res.status(200).json({
      success: true,
      donors: donorList
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching donors"
    });
  }
};


/* ============================
   DELETE DONOR (soft delete)
============================ */
exports.deleteDonor = async (req, res) => {
  try {

    const donorId = req.params.id;

    const user = await User.findById(donorId);

    if (!user) {
      return res.status(404).json({ message: "Donor not found" });
    }

    await User.findByIdAndUpdate(donorId, { is_active: false });

    res.json({ message: "Donor deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting donor" });
  }
};