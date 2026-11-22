const User = require("../models/User");
const DonorMedicalProfile = require("../models/DonorMedicalProfile");
const Donation = require("../models/Donation");
const BloodStock = require("../models/BloodStock");

/* =====================================================
   Search Donor
===================================================== */

exports.searchDonor = async (req, res) => {
  try {
    const user = await User.findOne({
      phone: req.params.phone,
      role: "USER",
      is_active: true,
    });

    if (!user) {
      return res.status(404).json({
        found: false,
        message: "Donor not registered.",
      });
    }

    const medical = await DonorMedicalProfile.findOne({
      donor_id: user._id,
    });

    if (!medical) {
      return res.status(404).json({
        found: false,
        message: "Donor medical profile not found.",
      });
    }

    let eligible = true;
    let daysRemaining = 0;

    if (medical.last_donation_date) {
      const diffDays = Math.floor(
        (Date.now() - medical.last_donation_date) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays < 90) {
        eligible = false;
        daysRemaining = 90 - diffDays;
      }
    }

    const totalDonations = await Donation.countDocuments({
      donor_id: user._id,
      status: "Completed",
    });

    const donationData = await Donation.aggregate([
      {
        $match: {
          donor_id: user._id,
          status: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          totalUnits: {
            $sum: "$units",
          },
        },
      },
    ]);

    const totalUnits =
      donationData.length > 0
        ? donationData[0].totalUnits
        : 0;

    return res.json({
      found: true,
      eligible,
      daysRemaining,

      donor: {
        id: user._id,
        name: user.profile?.full_name,
        age: medical.age,
        gender: user.profile?.gender,
        phone: user.phone,
        blood_group: medical.blood_group,
        health_status: medical.is_eligible
          ? "Healthy"
          : "Temporarily Unfit",
        donation_date: medical.last_donation_date,
        totalDonations,
        totalUnits,
      },
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      found: false,
      message: err.message,
    });
  }
};

/* =====================================================
   Get Donation History
===================================================== */

exports.getDonations = async (req, res) => {

  try {

    const donations = await Donation.find()

      .populate({
        path: "donor_id",
        select: "phone profile",
      })

      .sort({
        donationDate: -1,
      });

    const totalDonations = donations.length;

    const totalUnits = donations.reduce(
      (sum, item) => sum + item.units,
      0
    );

    res.json({
      success: true,
      donations,
      totalDonations,
      totalUnits,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

/* =====================================================
   Record Donation
===================================================== */

exports.recordDonation = async (req, res) => {

  try {

    if (!req.user || !req.user.bankId) {
      return res.status(401).json({
        success: false,
        message:
          "Bank Admin is not associated with any Blood Bank.",
      });
    }

    const {
      phone,
      units = 1,
      remarks = "",
    } = req.body;

    const user = await User.findOne({
      phone,
      role: "USER",
      is_active: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }

    const medical =
      await DonorMedicalProfile.findOne({
        donor_id: user._id,
      });

    if (!medical) {
      return res.status(404).json({
        success: false,
        message: "Medical profile not found.",
      });
    }

    if (medical.last_donation_date) {

      const diffDays = Math.floor(
        (Date.now() -
          medical.last_donation_date) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays < 90) {
        return res.status(400).json({
          success: false,
          message: `Donor can donate after ${
            90 - diffDays
          } day(s).`,
        });
      }
    }

    const donation = await Donation.create({

      donor_id: user._id,

      bank_id: req.user.bankId,

      blood_group: medical.blood_group,

      units,

      remarks,

      status: "Completed",

    });

    const components = [
      "WHOLE",
      "RBC",
      "PLASMA",
      "PLATELETS",
    ];

    for (const component of components) {

      await BloodStock.findOneAndUpdate(

        {
          bank_id: req.user.bankId,
          blood_group: medical.blood_group,
          component,
        },

        {
          $inc: {
            units,
          },
        },

        {
          upsert: true,
          new: true,
        }

      );

    }

    medical.last_donation_date = new Date();

    await medical.save();

    res.status(201).json({
      success: true,
      message: "Donation recorded successfully.",
      donation,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};